/**
 * AmyClaw 管理服务：端口 8080，Token 设置、配置读写、系统/用户密码修改、升级与远程预留。
 *
 * 与 Gateway（18789）保持一致，方便升级兼容、多人管理不冲突：
 * - 读写 OPENCLAW_STATE_DIR/openclaw.json；设置/更改 Gateway Token 时同步写入 .env 的 OPENCLAW_GATEWAY_TOKEN 与 data/token.txt，并更新本进程 process.env，避免与 CLI/systemd EnvironmentFile 不一致。
 * - 可落明文：API Key、飞书帐号、Gateway Token 等直接存在 config 中。
 * - 保存：仅 writeConfig(config)；清除：用空值覆盖或删除对应 key。
 * - 全部保存后 triggerGatewayReload()，热加载生效；18789 与 8080 同源同逻辑。
 */
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.MANAGEMENT_PORT) || 8080;
const OPENCLAW_STATE_DIR = process.env.OPENCLAW_STATE_DIR?.trim() || path.join(os.homedir(), ".openclaw");
/** 唯一数据源：配置与 .env 仅由此路径派生，读写均通过下方常量，保证同源 */
const CONFIG_PATH = path.join(OPENCLAW_STATE_DIR, "openclaw.json");
const ENV_PATH = path.join(OPENCLAW_STATE_DIR, ".env");
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://127.0.0.1:18789";
const UPGRADE_URL = process.env.UPGRADE_SERVICE_URL || "https://local.amyclaw.ai/upgrade";
const UPGRADE_PAGE_URL = process.env.UPGRADE_PAGE_URL || UPGRADE_URL;
const REMOTE_MANAGEMENT_URL = process.env.REMOTE_MANAGEMENT_URL || "https://local.amyclaw.ai";
const REMOTE_REGISTER_URL = process.env.REMOTE_REGISTER_URL || "https://remote.amyclaw.ai";
/** 仅当显式设置 OPENCLAW_TEST_IDATABASE_KEY 时用于测试/拉模型；默认空，不硬编码任何密钥 */
const IDATABASE_TEST_KEY = process.env.OPENCLAW_TEST_IDATABASE_KEY || "";
/** 标准用户（Ubuntu 普通用户）用户名，用于密码修改与展示；可通过 STANDARD_USER_NAME 覆盖 */
const STANDARD_USER_NAME = (process.env.STANDARD_USER_NAME || "amyclaw").trim() || "amyclaw";

/** shadow-utils：显式绝对路径，避免个别 systemd 环境下 PATH 不含 /usr/sbin 导致 ENOENT */
const CHPASSWD_BIN = "/usr/sbin/chpasswd";

const DATA_DIR = path.join(__dirname, "data");
const TOKEN_FILE = path.join(DATA_DIR, "token.txt");

let MANAGEMENT_VERSION = "1.0.0";
try {
  const pkgPath = path.join(__dirname, "package.json");
  const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
  if (pkg.version) MANAGEMENT_VERSION = pkg.version;
} catch (_) {}

function randomToken() {
  return crypto.randomBytes(24).toString("hex");
}

function normalizeToken(value) {
  if (typeof value !== "string") return "";
  const t = value.trim();
  if (t === "undefined" || t === "null") return "";
  return t;
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function isTokenSet() {
  try {
    const t = await fs.readFile(TOKEN_FILE, "utf8");
    return !!normalizeToken(t);
  } catch {
    return false;
  }
}

async function getStoredToken() {
  try {
    const t = await fs.readFile(TOKEN_FILE, "utf8");
    return normalizeToken(t);
  } catch {
    return "";
  }
}

async function setStoredToken(token) {
  await ensureDataDir();
  await fs.writeFile(TOKEN_FILE, token, "utf8");
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let buf = "";
    req.on("data", (c) => { buf += c; });
    req.on("end", () => {
      try {
        resolve(buf ? JSON.parse(buf) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function send(res, status, data) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.writeHead(status);
  res.end(JSON.stringify(data));
}

function normalizeTokenForCompare(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[\x00-\x08\x0B\x0C\x0e-\x1f]/g, "").trim();
}

/** 本机非回环 IPv4，供管理页展示（多网卡时多条） */
function getLocalIPv4Addresses() {
  const nets = os.networkInterfaces();
  const out = [];
  for (const iface of Object.keys(nets)) {
    for (const net of nets[iface] || []) {
      const v4 = net.family === "IPv4" || net.family === 4;
      if (v4 && !net.internal) {
        out.push({ iface, address: net.address });
      }
    }
  }
  return out;
}

function getAuthToken(req) {
  const auth = req.headers.authorization;
  if (auth && typeof auth === "string" && auth.startsWith("Bearer ")) {
    return normalizeTokenForCompare(auth.slice(7));
  }
  const cookie = req.headers.cookie || "";
  const m = cookie.match(/(?:^|;\s*)openclaw_management_token=([^;]+)/);
  return m ? normalizeTokenForCompare(decodeURIComponent(m[1])) : "";
}

/** 从 openclaw.json 或 .env 或环境变量解析出当前 Gateway Token，用于验证解锁。
 *  顺序：磁盘 openclaw.json → .env 文件 → 最后才 process.env。
 *  避免「清除所有资料」已写盘清空后，仍因进程内 OPENCLAW_GATEWAY_TOKEN 未同步而误判为已配置。 */
async function resolveGatewayTokenForAuth() {
  const config = await readConfig();
  const raw = config.gateway?.auth?.token;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  let envContent = "";
  try {
    envContent = await readEnv();
  } catch {
    envContent = "";
  }
  if (raw && typeof raw === "object" && raw.id) {
    const key = String(raw.id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`^${key}=([^\\n]*)`, "m");
    const match = envContent.match(regex);
    if (match && match[1].trim()) return match[1].trim();
  }
  const m = envContent.match(/^OPENCLAW_GATEWAY_TOKEN=([^\n]*)/m);
  if (m && m[1].trim()) return m[1].trim();
  const fromEnvVar = process.env.OPENCLAW_GATEWAY_TOKEN?.trim();
  if (fromEnvVar) return fromEnvVar;
  return "";
}

async function requireAuth(req, res) {
  const token = getAuthToken(req);
  if (!token) {
    send(res, 401, { error: "未授权" });
    return null;
  }
  const stored = await getStoredToken();
  if (stored && token === normalizeTokenForCompare(stored)) return token;
  const gatewayToken = await resolveGatewayTokenForAuth();
  const normalizedGateway = normalizeTokenForCompare(gatewayToken);
  if (normalizedGateway && token === normalizedGateway) {
    await setStoredToken(token);
    return token;
  }
  send(res, 401, { error: "未授权" });
  return null;
}

function isLocalhost(req) {
  const host = req.headers["x-forwarded-for"] ? String(req.headers["x-forwarded-for"]).split(",")[0].trim() : req.socket?.remoteAddress;
  return host === "127.0.0.1" || host === "::1" || host === "::ffff:127.0.0.1";
}

async function readConfig() {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === "ENOENT") return {};
    throw e;
  }
}

/** 原子写入配置：先写临时文件再 rename，避免写入中断导致配置损坏 */
async function writeConfig(config) {
  const dir = path.dirname(CONFIG_PATH);
  await fs.mkdir(dir, { recursive: true });
  const tmpPath = CONFIG_PATH + ".tmp." + Date.now();
  const body = JSON.stringify(config, null, 2);
  await fs.writeFile(tmpPath, body, "utf8");
  await fs.rename(tmpPath, CONFIG_PATH);
}

/**
 * openclaw.json 中是否已无任何 Gateway Token 痕迹（与 resolveGatewayTokenForAuth 从 config 读取的规则一致）。
 * 用于「清除所有帐号」写盘校验，避免仅校验飞书/模型 Key 却漏掉仍留在盘上的 gateway token。
 */
function isGatewayTokenAbsentInConfig(c) {
  if (!c || typeof c !== "object") return true;
  const raw = c.gateway?.auth?.token;
  if (typeof raw === "string" && raw.trim()) return false;
  if (raw && typeof raw === "object") {
    if (raw.id && String(raw.id).trim()) return false;
    if (raw.token != null && String(raw.token).trim()) return false;
  }
  const rt = c.gateway?.remote?.token;
  if (rt != null && String(rt).trim()) return false;
  return true;
}

/** 校验磁盘上的 openclaw.json 是否已无敏感项（Gateway Token、飞书帐号、provider apiKey、记忆 apiKey）。用于一键清除后验证落盘，未通过则触发补清。 */
async function verifyConfigCleared() {
  let raw;
  try {
    raw = await fs.readFile(CONFIG_PATH, "utf8");
  } catch (e) {
    if (e.code === "ENOENT") return true;
    throw e;
  }
  const c = JSON.parse(raw);
  if (!isGatewayTokenAbsentInConfig(c)) return false;
  if (c.channels?.feishu?.accounts && Object.keys(c.channels.feishu.accounts).length > 0) return false;
  const providers = c.models?.providers || {};
  for (const p of Object.values(providers)) {
    if (p && typeof p === "object" && p.apiKey != null) return false;
  }
  if (c.agents?.defaults?.memorySearch?.remote?.apiKey != null) return false;
  return true;
}

async function readEnv() {
  try {
    const raw = await fs.readFile(ENV_PATH, "utf8");
    return raw;
  } catch (e) {
    if (e.code === "ENOENT") return "";
    throw e;
  }
}

/** 将 OPENCLAW_GATEWAY_TOKEN 写入 .env（替换已有行或追加），与 openclaw.json 中 gateway token 保持一致，供 systemd EnvironmentFile、CLI 使用 */
async function upsertEnvGatewayToken(token) {
  let raw = await readEnv().catch(() => "");
  const line = `OPENCLAW_GATEWAY_TOKEN=${token}`;
  if (/^OPENCLAW_GATEWAY_TOKEN=/m.test(raw)) {
    raw = raw.replace(/^OPENCLAW_GATEWAY_TOKEN=.*$/m, line);
  } else {
    const sep = raw.length === 0 || raw.endsWith("\n") ? "" : "\n";
    raw = raw + sep + line + "\n";
  }
  await fs.mkdir(path.dirname(ENV_PATH), { recursive: true });
  await fs.writeFile(ENV_PATH, raw, { mode: 0o600 });
  process.env.OPENCLAW_GATEWAY_TOKEN = token;
}

/** 从 .env 移除 OPENCLAW_GATEWAY_TOKEN 行（与 DELETE token 一致） */
function stripEnvGatewayTokenLine(envRaw) {
  if (typeof envRaw !== "string") return "";
  const keyPattern = /^\s*(export\s+)?OPENCLAW_GATEWAY_TOKEN\s*=/;
  return envRaw
    .split(/\r?\n/)
    .filter((line) => !keyPattern.test(line))
    .join("\n");
}

/** 解析 .env 内容为键值对象（支持 # 注释、export KEY=value、value 去首尾双引号） */
function parseEnvToObject(envRaw) {
  const out = {};
  if (typeof envRaw !== "string") return out;
  for (const line of envRaw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i <= 0) continue;
    let key = trimmed.slice(0, i).trim();
    if (key.startsWith("export ")) key = key.slice(7).trim();
    if (!key) continue;
    let value = trimmed.slice(i + 1).trim();
    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    out[key] = value;
  }
  return out;
}

/** 从 .env 原始内容中按行匹配 KEY= 提取值（应对 BOM、不可见字符等） */
function extractEnvKeyFromRaw(envRaw, key) {
  if (typeof envRaw !== "string" || !key) return "";
  const marker = key + "=";
  for (const line of envRaw.split(/\r?\n/)) {
    const idx = line.indexOf(marker);
    if (idx !== 0) continue;
    let v = line.slice(marker.length).trim();
    if (v.length >= 2 && (v.startsWith('"') && v.endsWith('"') || v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    return v;
  }
  return "";
}

/**
 * 与「清除所有帐号信息」对应的 .env 敏感键：仅删除这些键所在行，保留 .env 其余内容。
 * 不包含系统主机/用户密码：root 与标准用户（如 amyclaw）密码存于 /etc/shadow，仅通过 POST /api/system/change-password → chpasswd 修改，绝不写入或读取 .env，清除逻辑不涉及。
 */
const ENV_SENSITIVE_KEYS = ["OPENCLAW_GATEWAY_TOKEN", "IDATABASE_API_KEY", "GEMINI_API_KEY", "MINIMAX_API_KEY", "MOONSHOT_API_KEY", "FEISHU_APP_ID", "FEISHU_APP_SECRET"];

/** 从 .env 原始内容中移除敏感键所在行（支持 KEY= 或 export KEY=），其余行原样保留 */
function stripSensitiveKeysFromEnvRaw(envRaw) {
  if (typeof envRaw !== "string") return "";
  const keyPattern = new RegExp(
    "^\\s*(export\\s+)?(" + ENV_SENSITIVE_KEYS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")\\s*="
  );
  return envRaw
    .split(/\r?\n/)
    .filter((line) => !keyPattern.test(line))
    .join("\n");
}

/**
 * Gateway 重启后 OpenClaw 会在「无 token」时通过 startup-auth 把新 token 写回 openclaw.json（persist: true）。
 * 「清除所有帐号」在 systemctl restart 之后需再清一次盘，否则 GET /api/status 仍会认为已配置 Gateway。
 */
async function stripGatewayTokenFromDiskOnce() {
  const config = await readConfig();
  if (config.gateway?.auth) {
    delete config.gateway.auth.token;
    delete config.gateway.auth.mode;
    if (Object.keys(config.gateway.auth).length === 0) delete config.gateway.auth;
  }
  if (config.gateway?.remote) delete config.gateway.remote.token;
  await writeConfig(config);
  await fs.writeFile(TOKEN_FILE, "", "utf8").catch(() => {});
  const envRaw = await readEnv().catch(() => "");
  await fs.writeFile(ENV_PATH, stripSensitiveKeysFromEnvRaw(envRaw), { mode: 0o600 }).catch(() => {});
  delete process.env.OPENCLAW_GATEWAY_TOKEN;
}

async function stripAutoGeneratedGatewayTokenAfterGatewayRestart() {
  for (let i = 0; i < 6; i++) {
    await new Promise((r) => setTimeout(r, i === 0 ? 2200 : 700));
    const c = await readConfig();
    if (isGatewayTokenAbsentInConfig(c)) {
      if (i > 0) console.info("[clear-all-accounts] 网关启动后磁盘已无 Gateway Token（第 " + (i + 1) + " 次检测）");
      return;
    }
    await stripGatewayTokenFromDiskOnce();
    console.warn("[clear-all-accounts] 网关启动后检测到 Gateway Token，已再次从磁盘清除（第 " + (i + 1) + " 次）");
  }
  const final = await readConfig();
  if (!isGatewayTokenAbsentInConfig(final)) {
    console.error("[clear-all-accounts] 多次重写后 openclaw.json 仍含 Gateway Token，网关可能持续写回配置");
  }
}

/** .env 解析结果与 process.env 合并，便于显示由 systemd/Shell 注入的密钥；与 .env 中写入的 key 保持一致 */
function mergeEnvWithProcessEnv(envObj, envRaw) {
  const keys = ["IDATABASE_API_KEY", "GEMINI_API_KEY", "MINIMAX_API_KEY", "MOONSHOT_API_KEY", "OPENCLAW_GATEWAY_TOKEN", "FEISHU_APP_ID", "FEISHU_APP_SECRET"];
  const out = { ...envObj };
  for (const k of keys) {
    const v = process.env[k];
    if (v != null && String(v).trim()) out[k] = String(v).trim();
    else if (envRaw && !out[k]) {
      const fromRaw = extractEnvKeyFromRaw(envRaw, k);
      if (fromRaw) out[k] = fromRaw;
    }
  }
  return out;
}

/** 从 config + env 解析出大模型 API Key：先看配置文件里 idatabase/google 的 apiKey（明文或 env 引用），再回退到 .env / process.env 的 IDATABASE_API_KEY */
function getLlmApiKeyFromConfigAndEnv(config, envObj) {
  const idatabase = config?.models?.providers?.idatabase;
  const google = config?.models?.providers?.google;
  function resolve(v) {
    if (typeof v === "string" && v.trim()) return v.trim();
    if (v && typeof v === "object" && v.source === "env" && typeof v.id === "string") {
      const val = envObj[v.id];
      if (val != null && String(val).trim()) return String(val).trim();
    }
    return "";
  }
  const fromIdatabase = resolve(idatabase?.apiKey);
  if (fromIdatabase) return fromIdatabase;
  const fromGoogle = resolve(google?.apiKey);
  if (fromGoogle) return fromGoogle;
  const fromEnv = (envObj.IDATABASE_API_KEY != null && String(envObj.IDATABASE_API_KEY).trim()) || "";
  return fromEnv;
}

/** 从 config + envObj 解析单字段：明文用明文，env 引用用 envObj[ref.id] */
function resolveSecret(configPath, envObj) {
  let v = configPath;
  if (typeof v === "string" && v.trim()) return v.trim();
  if (v && typeof v === "object" && v.source === "env" && typeof v.id === "string") {
    const val = envObj[v.id];
    if (val != null && String(val).trim()) return String(val).trim();
  }
  return "";
}

/** 飞书首个帐号 App Secret（config + env 引用） */
function getFeishuAppSecretFromConfigAndEnv(config, envObj) {
  const accounts = config.channels?.feishu?.accounts;
  if (!accounts || typeof accounts !== "object") return "";
  const acc = accounts.default || Object.values(accounts).find((a) => a && typeof a === "object");
  return resolveSecret(acc?.appSecret, envObj);
}

/** 一次性解析大模型 / 向量 / Minimax / Kimi 等 API Key，供前端统一填充（config + .env + process.env） */
function getResolvedSecrets(config, envObj) {
  const idatabase = config?.models?.providers?.idatabase;
  const google = config?.models?.providers?.google;
  const memory = config?.agents?.defaults?.memorySearch?.remote;
  const minimax = config?.models?.providers?.minimax;
  const moonshot = config?.models?.providers?.moonshot;
  const llmApiKey = resolveSecret(idatabase?.apiKey, envObj) || resolveSecret(google?.apiKey, envObj)
    || (envObj.IDATABASE_API_KEY != null && String(envObj.IDATABASE_API_KEY).trim()) || "";
  const memoryApiKey = resolveSecret(memory?.apiKey, envObj)
    || (envObj.GEMINI_API_KEY != null && String(envObj.GEMINI_API_KEY).trim()) || "";
  const minimaxApiKey = resolveSecret(minimax?.apiKey, envObj)
    || (envObj.MINIMAX_API_KEY != null && String(envObj.MINIMAX_API_KEY).trim()) || "";
  const moonshotApiKey = resolveSecret(moonshot?.apiKey, envObj)
    || (envObj.MOONSHOT_API_KEY != null && String(envObj.MOONSHOT_API_KEY).trim()) || "";
  return { llmApiKey, memoryApiKey, minimaxApiKey, moonshotApiKey };
}

/** 是否已配置飞书 Secret 或任一模型/记忆相关 Key（config + .env），用于「安全重置 Gateway Token」资格判断 */
function hasAnyFeishuOrModelSecrets(config, envObj) {
  const sec = getResolvedSecrets(config, envObj);
  if (sec.llmApiKey && String(sec.llmApiKey).trim()) return true;
  if (sec.memoryApiKey && String(sec.memoryApiKey).trim()) return true;
  if (sec.minimaxApiKey && String(sec.minimaxApiKey).trim()) return true;
  if (sec.moonshotApiKey && String(sec.moonshotApiKey).trim()) return true;
  const fs = getFeishuAppSecretFromConfigAndEnv(config, envObj);
  if (fs && String(fs).trim()) return true;
  if (envObj.FEISHU_APP_SECRET && String(envObj.FEISHU_APP_SECRET).trim()) return true;
  return false;
}

/** 深度克隆 config，将 env 引用替换为 .env 中的实际值（缺失则置空串），便于解锁后前端显示与修改 */
function resolveConfigSecrets(config, envObj) {
  const c = JSON.parse(JSON.stringify(config));
  function replaceRef(obj, key) {
    const v = obj[key];
    if (v && typeof v === "object" && v.source === "env" && typeof v.id === "string") {
      obj[key] = envObj.hasOwnProperty(v.id) ? (envObj[v.id] || "") : "";
    }
  }
  if (c.models?.providers) {
    for (const p of Object.values(c.models.providers)) {
      if (p && typeof p === "object") replaceRef(p, "apiKey");
    }
  }
  if (c.agents?.defaults?.memorySearch?.remote) replaceRef(c.agents.defaults.memorySearch.remote, "apiKey");
  if (c.channels?.feishu?.accounts) {
    for (const acc of Object.values(c.channels.feishu.accounts)) {
      if (acc && typeof acc === "object") {
        replaceRef(acc, "appId");
        replaceRef(acc, "appSecret");
      }
    }
  }
  return c;
}

async function probeGateway(token) {
  try {
    const u = new URL("/health", GATEWAY_URL);
    const res = await fetch(u.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e.message) };
  }
}

/**
 * 请求 Gateway 执行一次配置热加载（保存后调用，不阻塞响应）。
 * Gateway 通过文件监听 openclaw.json 变更自动热加载，多数情况下无需 HTTP 通知；
 * 若 Gateway 未实现 POST /reload-config（返回 404），属正常，配置已落盘，下次变更或进程内重载会生效。
 */
async function triggerGatewayReload() {
  const token = await resolveGatewayTokenForAuth();
  if (!token) return;
  try {
    const u = new URL("/reload-config", GATEWAY_URL);
    const res = await fetch(u.toString(), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    });
    if (res.status === 404) {
      // Gateway 未实现该端点时以文件监听为主，无需告警
      return;
    }
    if (!res.ok) {
      console.warn("[management] gateway reload-config returned", res.status);
    }
  } catch (e) {
    console.warn("[management] gateway reload-config failed:", e?.message || e);
  }
}

const GATEWAY_SERVICE_NAME = "openclaw-gateway.service";

/**
 * 重启 Gateway 进程（systemctl restart），使主机上该进程内存中的旧配置彻底释放，新进程仅从已清空的磁盘读取。
 * 用于「清除所有帐号」后保证敏感信息不残留在进程内存。成功返回 true，失败返回 false（不抛错）。
 */
async function restartGatewayService() {
  function runRestart(useSudo) {
    const cmd = useSudo ? "sudo" : "systemctl";
    const args = useSudo ? ["systemctl", "restart", GATEWAY_SERVICE_NAME] : ["restart", GATEWAY_SERVICE_NAME];
    return spawnSync(cmd, args, { encoding: "utf8", timeout: 15000 });
  }
  try {
    let r = runRestart(false);
    if (r.status !== 0 && (r.stderr || "").toLowerCase().includes("permission")) {
      r = runRestart(true);
    }
    if (r.status !== 0) {
      console.warn("[management] gateway restart failed:", (r.stderr || "").trim() || r.error?.message || "unknown");
      return false;
    }
    console.info("[management] gateway restarted (process memory cleared)");
    return true;
  } catch (e) {
    console.warn("[management] gateway restart error:", e?.message || e);
    return false;
  }
}

/** 校验系统/用户密码：不少于 8 位，且包含大小写字母与数字 */
function validateSystemPassword(password) {
  if (typeof password !== "string") return { ok: false, message: "密码无效" };
  const p = password;
  if (p.length < 8) return { ok: false, message: "密码不少于 8 位" };
  if (!/[a-z]/.test(p)) return { ok: false, message: "需包含小写字母" };
  if (!/[A-Z]/.test(p)) return { ok: false, message: "需包含大写字母" };
  if (!/\d/.test(p)) return { ok: false, message: "需包含数字" };
  return { ok: true };
}

const ROUTES = {
  "GET /api/status": async (req, res) => {
    const tokenSet = await isTokenSet();
    const gw = await resolveGatewayTokenForAuth();
    const gatewayTokenConfigured = !!gw;
    let gatewayReachable = false;
    if (gw) {
      const p = await probeGateway(gw);
      gatewayReachable = p.ok;
    }
    const config = await readConfig();
    const envRaw = await readEnv().catch(() => "");
    const envObj = mergeEnvWithProcessEnv(parseEnvToObject(envRaw), envRaw);
    /** 仅当磁盘上已有 Gateway Token，且未配置飞书/模型/记忆等业务密钥时，前端才展示「同意并安全重置」 */
    const canSafeResetGatewayToken = gatewayTokenConfigured && !hasAnyFeishuOrModelSecrets(config, envObj);
    send(res, 200, {
      tokenSet,
      gatewayTokenConfigured,
      canSafeResetGatewayToken,
      gatewayReachable,
      stateDir: OPENCLAW_STATE_DIR,
      configPath: CONFIG_PATH,
      envPath: ENV_PATH,
    });
  },

  /**
   * 在未配置飞书 Secret、且无任何模型/记忆 Key 时，允许将 Gateway Token 重置为新随机串（无需旧 Token）。
   * 用于忘记 Token 且尚未录入业务密钥的设备；若已录入任一则返回 400。
   */
  "POST /api/safe-reset-gateway-token": async (req, res) => {
    try {
      const config = await readConfig();
      const envRaw = await readEnv().catch(() => "");
      const envObj = mergeEnvWithProcessEnv(parseEnvToObject(envRaw), envRaw);
      const gw = await resolveGatewayTokenForAuth();
      if (!gw) {
        send(res, 400, { error: "未配置 Gateway Token，无需安全重置。" });
        return;
      }
      if (hasAnyFeishuOrModelSecrets(config, envObj)) {
        send(res, 400, {
          error:
            "已配置飞书 App Secret 或模型/记忆等 API Key，无法使用安全重置。请使用原 Token、「忘记 Token」验证，或先清除相关配置。",
        });
        return;
      }
      if (config.gateway?.auth) {
        delete config.gateway.auth.token;
        delete config.gateway.auth.mode;
        if (Object.keys(config.gateway.auth).length === 0) delete config.gateway.auth;
      }
      if (config.gateway?.remote) delete config.gateway.remote.token;
      await writeConfig(config);
      await fs.writeFile(TOKEN_FILE, "", "utf8").catch(() => {});
      await fs.writeFile(ENV_PATH, stripEnvGatewayTokenLine(envRaw), { mode: 0o600 }).catch(() => {});
      delete process.env.OPENCLAW_GATEWAY_TOKEN;
      const token = randomToken();
      const c = await readConfig();
      c.gateway = c.gateway || {};
      c.gateway.auth = c.gateway.auth || {};
      c.gateway.auth.mode = "token";
      c.gateway.auth.token = token;
      c.gateway.remote = c.gateway.remote || {};
      c.gateway.remote.token = token;
      await writeConfig(c);
      await setStoredToken(token);
      await upsertEnvGatewayToken(token);
      triggerGatewayReload().catch(() => {});
      send(res, 200, {
        ok: true,
        token,
        message: "已安全重置 Gateway Token 并写入配置与 .env；请立即复制保存。",
      });
    } catch (e) {
      send(res, 500, { error: String(e.message) });
    }
  },

  /**
   * 忘记管理页 Gateway Token 时：用「当前主模型 API Key」或「飞书 App Secret」与设备配置比对，通过后写入 session（data/token.txt）。
   * 不降低网关侧安全：仅证明操作者掌握本机已配置的密钥之一。
   */
  "POST /api/unlock-with-secret": async (req, res) => {
    try {
      const body = await parseJsonBody(req);
      const gw = await resolveGatewayTokenForAuth();
      if (!gw || !normalizeToken(gw)) {
        send(res, 400, { error: "本机尚未配置 Gateway Token，请先在上方完成首次设置。" });
        return;
      }
      const config = await readConfig();
      const envRaw = await readEnv();
      const envObj = mergeEnvWithProcessEnv(parseEnvToObject(envRaw), envRaw);
      const llmIn = normalizeToken(body.llmApiKey);
      const fsIn = normalizeToken(body.feishuAppSecret);
      if (!llmIn && !fsIn) {
        send(res, 400, { error: "请至少填写主模型 API Key 或飞书 App Secret 之一。" });
        return;
      }
      let matched = false;
      if (llmIn) {
        const real = getLlmApiKeyFromConfigAndEnv(config, envObj);
        if (real && normalizeTokenForCompare(llmIn) === normalizeTokenForCompare(real)) matched = true;
      }
      if (!matched && fsIn) {
        const real = getFeishuAppSecretFromConfigAndEnv(config, envObj);
        if (real && normalizeTokenForCompare(fsIn) === normalizeTokenForCompare(real)) matched = true;
      }
      if (!matched) {
        send(res, 401, { error: "凭证与当前设备已保存的配置不一致。" });
        return;
      }
      const t = normalizeToken(gw);
      await setStoredToken(t);
      await upsertEnvGatewayToken(t);
      send(res, 200, { ok: true, token: t, message: "验证通过，已登录管理页" });
    } catch (e) {
      send(res, 500, { error: String(e.message) });
    }
  },

  "POST /api/set-token": async (req, res) => {
    const body = await parseJsonBody(req);
    const existingGw = await resolveGatewayTokenForAuth();
    const existingNorm = existingGw ? normalizeTokenForCompare(existingGw) : "";

    if (existingNorm) {
      if (body.generate) {
        send(res, 400, {
          error:
            "本机已存在 Gateway Token，无法重新生成。请先使用「清除设备 Token」或「清除所有帐号信息」删除后再新建；若仅忘记管理页登录，请直接输入原 Token，或使用「忘记 Token」用飞书 App Secret / 主模型 API Key 验证。",
        });
        return;
      }
      const incoming = normalizeToken(body.token);
      if (!incoming) {
        send(res, 400, {
          error:
            "请输入本机已设置的 Gateway Token；若忘记请点击「忘记 Token」，用飞书 App Secret 或当前主模型 API Key 验证登录。",
        });
        return;
      }
      if (normalizeTokenForCompare(incoming) !== existingNorm) {
        send(res, 400, { error: "Gateway Token 不正确。若忘记请使用「忘记 Token」以飞书 App Secret 或主模型 API Key 验证。" });
        return;
      }
      await setStoredToken(incoming);
      await upsertEnvGatewayToken(incoming);
      send(res, 200, { token: incoming, message: "已验证并登录管理页" });
      return;
    }

    let token = normalizeToken(body.token);
    if (body.generate) {
      token = randomToken();
    }
    if (!token) {
      send(res, 400, { error: "请提供 token 或使用 generate: true 自动生成" });
      return;
    }
    const config = await readConfig();
    config.gateway = config.gateway || {};
    config.gateway.auth = config.gateway.auth || {};
    config.gateway.auth.mode = "token";
    config.gateway.auth.token = token;
    config.gateway.remote = config.gateway.remote || {};
    config.gateway.remote.token = token;
    await writeConfig(config);
    await setStoredToken(token);
    await upsertEnvGatewayToken(token);
    send(res, 200, {
      token,
      message:
        "Token 已写入 openclaw.json、data/token.txt 与 .env（OPENCLAW_GATEWAY_TOKEN）；gateway.remote.token 已同步；CLI 与引用 EnvironmentFile 的服务一致",
    });
  },

  "GET /api/config": async (req, res) => {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    const config = await readConfig();
    const envRaw = await readEnv();
    const envObj = mergeEnvWithProcessEnv(parseEnvToObject(envRaw), envRaw);
    const resolved = resolveConfigSecrets(config, envObj);
    send(res, 200, resolved);
  },

  "PATCH /api/config": async (req, res) => {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    const patch = await parseJsonBody(req);
    const config = await readConfig();
    // 留空不覆盖：patch 未提交的 apiKey/appSecret 保留原配置，避免 merge 时被清掉
    const p = patch.models?.providers;
    const c = config.models?.providers;
    if (p?.idatabase && !Object.prototype.hasOwnProperty.call(p.idatabase, "apiKey") && c?.idatabase?.apiKey != null) {
      p.idatabase.apiKey = c.idatabase.apiKey;
    }
    if (p?.google && !Object.prototype.hasOwnProperty.call(p.google, "apiKey") && c?.google?.apiKey != null) {
      p.google.apiKey = c.google.apiKey;
    }
    if (p?.minimax && !Object.prototype.hasOwnProperty.call(p.minimax, "apiKey") && c?.minimax?.apiKey != null) {
      p.minimax.apiKey = c.minimax.apiKey;
    }
    if (p?.moonshot && !Object.prototype.hasOwnProperty.call(p.moonshot, "apiKey") && c?.moonshot?.apiKey != null) {
      p.moonshot.apiKey = c.moonshot.apiKey;
    }
    const pr = patch.agents?.defaults?.memorySearch?.remote;
    const cr = config.agents?.defaults?.memorySearch?.remote;
    if (pr && !Object.prototype.hasOwnProperty.call(pr, "apiKey") && cr?.apiKey != null) {
      pr.apiKey = cr.apiKey;
    }
    const fa = patch.channels?.feishu?.accounts?.default;
    const ca = config.channels?.feishu?.accounts?.default;
    if (fa && ca?.appSecret != null && String(ca.appSecret).trim()) {
      const patchAppId = typeof fa.appId === "string" ? fa.appId.trim() : "";
      const patchAppSecretEmpty = typeof fa.appSecret === "string" && !fa.appSecret.trim();
      if (!Object.prototype.hasOwnProperty.call(fa, "appSecret")) fa.appSecret = ca.appSecret;
      else if (patchAppSecretEmpty && patchAppId) fa.appSecret = ca.appSecret;
    }
    function merge(target, src) {
      for (const k of Object.keys(src)) {
        if (src[k] !== null && typeof src[k] === "object" && !Array.isArray(src[k])) {
          target[k] = target[k] || {};
          merge(target[k], src[k]);
        } else {
          target[k] = src[k];
        }
      }
    }
    merge(config, patch);
    // 飞书：整块覆盖，保证「唯一附属账号」——仅保留 patch 中的 default，移除历史上可能存在的其他账号
    if (patch.channels && Object.prototype.hasOwnProperty.call(patch.channels, "feishu")) {
      config.channels.feishu = patch.channels.feishu;
    }
    // 飞书：与 18789 一致，仅改 config；清除时用空值覆盖（accounts 置空、enabled 关）
    const feishuAcc = config.channels?.feishu?.accounts?.default;
    if (config.channels?.feishu && feishuAcc && typeof feishuAcc === "object") {
      const appIdStr = typeof feishuAcc.appId === "string" ? feishuAcc.appId.trim() : "";
      const appSecretStr = typeof feishuAcc.appSecret === "string" ? feishuAcc.appSecret.trim() : "";
      if (!appIdStr && !appSecretStr) {
        config.channels.feishu.accounts = {};
        config.channels.feishu.enabled = false;
      }
    }
    const providers = config.models?.providers || {};
    // 确保 minimax 有 baseUrl 和 models，否则 Gateway 校验会报错
    if (providers.minimax && (!providers.minimax.baseUrl || !Array.isArray(providers.minimax.models) || !providers.minimax.models.length)) {
      providers.minimax.baseUrl = providers.minimax.baseUrl || "https://api.minimax.io/anthropic";
      providers.minimax.models = Array.isArray(providers.minimax.models) && providers.minimax.models.length
        ? providers.minimax.models
        : [
            { id: "MiniMax-M2.5", name: "MiniMax M2.5", reasoning: true, input: ["text"], contextWindow: 200000, maxTokens: 8192 },
            { id: "MiniMax-M2.5-highspeed", name: "MiniMax M2.5 Highspeed", reasoning: true, input: ["text"], contextWindow: 200000, maxTokens: 8192 },
          ];
    }
    // Kimi（moonshot）：固定 baseUrl 与模型列表，仅写 API Key
    const KIMI_BASE_URL = "https://api.moonshot.cn/v1";
    const KIMI_MODELS = [
      { id: "kimi-k2.5", name: "Kimi K2.5", reasoning: false, input: ["text", "image"], contextWindow: 256000, maxTokens: 8192 },
      { id: "kimi-k2.1", name: "Kimi K2.1", reasoning: false, input: ["text", "image"], contextWindow: 256000, maxTokens: 8192 },
    ];
    if (providers.moonshot) {
      providers.moonshot.baseUrl = KIMI_BASE_URL;
      providers.moonshot.api = "openai-completions";
      if (!Array.isArray(providers.moonshot.models) || !providers.moonshot.models.length) {
        providers.moonshot.models = KIMI_MODELS;
      }
    }
    // 与 18789 一致：API Key 仅存 config 明文；空字符串时删除 key（清除）
    if (providers.idatabase && typeof providers.idatabase.apiKey === "string" && !providers.idatabase.apiKey.trim()) {
      delete providers.idatabase.apiKey;
    }
    if (providers.google && typeof providers.google.apiKey === "string" && !providers.google.apiKey.trim()) {
      delete providers.google.apiKey;
    }
    if (providers.minimax && typeof providers.minimax.apiKey === "string" && !providers.minimax.apiKey.trim()) {
      delete providers.minimax.apiKey;
    }
    if (providers.moonshot && typeof providers.moonshot.apiKey === "string" && !providers.moonshot.apiKey.trim()) {
      delete providers.moonshot.apiKey;
    }
    // 统一生成备选顺序：主模型不可用时依次使用 Kimi → Minimax（保留用户已选的 Kimi 子型号）
    const hasMoonshotKey = providers.moonshot && (typeof providers.moonshot.apiKey === "string" ? !!providers.moonshot.apiKey?.trim() : !!providers.moonshot.apiKey);
    const hasMinimaxKey = providers.minimax && (typeof providers.minimax.apiKey === "string" ? !!providers.minimax.apiKey?.trim() : !!providers.minimax.apiKey);
    const existingFallbacks = config.agents?.defaults?.model?.fallbacks || [];
    const moonshotChoice = existingFallbacks.find((f) => f && f.startsWith("moonshot/"));
    const fallbacks = [];
    if (hasMoonshotKey) fallbacks.push(moonshotChoice || "moonshot/kimi-k2.5");
    if (hasMinimaxKey) fallbacks.push("minimax/MiniMax-M2.5");
    if (config.agents?.defaults?.model) config.agents.defaults.model.fallbacks = fallbacks;

    // 大模型调用路径与成功范例一致：存在 google 提供商时主模型使用 google/xxx（v1beta + google-generative-ai）
    const primary = config.agents?.defaults?.model?.primary;
    if (typeof primary === "string" && primary.startsWith("idatabase/") && providers.google) {
      const modelId = primary.slice("idatabase/".length).trim();
      if (modelId) config.agents.defaults.model.primary = "google/" + modelId;
    }

    const mem = config.agents?.defaults?.memorySearch;
    if (mem?.remote) {
      const base = (mem.remote.baseUrl && mem.remote.baseUrl.trim()) || "";
      if (!base || base === "https://api.idatabase.ai") mem.remote.baseUrl = "https://api.idatabase.ai/v1/";
      if (typeof mem.remote.apiKey === "string" && !mem.remote.apiKey.trim()) delete mem.remote.apiKey;
    }
    // 飞书：OpenClaw 仅当 plugins.entries.feishu.enabled=true 时加载扩展；仅改 channels 时须对齐，否则「通道开但收不到消息」
    if (config.channels?.feishu) {
      config.plugins = config.plugins || {};
      config.plugins.entries = config.plugins.entries || {};
      config.plugins.entries.feishu = config.plugins.entries.feishu || {};
      const acc = config.channels.feishu.accounts?.default;
      const appIdStr = typeof acc?.appId === "string" ? acc.appId.trim() : "";
      const appSecretStr = typeof acc?.appSecret === "string" ? acc.appSecret.trim() : "";
      const hasCred = !!(appIdStr && appSecretStr);
      config.plugins.entries.feishu.enabled = config.channels.feishu.enabled === true && hasCred;
    }
    await writeConfig(config);
    triggerGatewayReload().catch(() => {});
    send(res, 200, { ok: true, message: "配置已更新；若 Gateway 已运行将自动热加载" });
  },

  "GET /api/gateway-probe": async (req, res) => {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    const result = await probeGateway(auth);
    send(res, 200, result);
  },

  /** 重启 Gateway 服务（systemctl restart openclaw-gateway.service）；本机访问可免鉴权，否则需鉴权 */
  "POST /api/gateway-restart": async (req, res) => {
    if (!isLocalhost(req) && !(await requireAuth(req, res))) return;
    const ok = await restartGatewayService();
    if (ok) {
      send(res, 200, { ok: true, message: "Gateway 重启已执行" });
    } else {
      send(res, 500, { error: "重启失败（请检查 systemd 与 openclaw-gateway.service 是否存在且可执行）" });
    }
  },

  /** 升级检测：请求升级服务器。升级服务需返回 JSON，可选含 latestVersion 供前端每日对比；子页环境校验走 POST /api/upgrade-qualify → 升级服务 POST /qualify。 */
  "POST /api/upgrade-check": async (req, res) => {
    if (!(await requireAuth(req, res))) return;
    try {
      const r = await fetch(UPGRADE_URL, { signal: AbortSignal.timeout(10000) });
      const text = await r.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        json = { raw: text };
      }
      send(res, 200, { upgradeUrl: UPGRADE_URL, response: json });
    } catch (e) {
      send(res, 200, { upgradeUrl: UPGRADE_URL, error: String(e.message), reserved: true });
    }
  },

  "POST /api/remote-upload": async (req, res) => {
    if (!(await requireAuth(req, res))) return;
    send(res, 200, {
      reserved: true,
      remoteUrl: REMOTE_MANAGEMENT_URL,
      message: "远程管理上传功能预留，后续在管理网站开发",
    });
  },

  /** 当前管理端版本号（供升级子页与每日检测用） */
  "GET /api/version": async (_req, res) => {
    send(res, 200, { version: MANAGEMENT_VERSION });
  },

  /** 返回系统管理员与标准用户名，供前端展示密码修改区块 */
  "GET /api/system/users": async (_req, res) => {
    send(res, 200, { root: "root", standardUser: STANDARD_USER_NAME });
  },

  /**
   * 修改 Ubuntu 系统用户密码（root 或标准用户）。需鉴权。
   * body: { user: "root" | "<standardUser>", password: string }
   * 密码约束：不少于 8 位，且包含大小写字母与数字。
   */
  "POST /api/system/change-password": async (req, res) => {
    if (!(await requireAuth(req, res))) return;
    let body;
    try {
      body = await parseJsonBody(req);
    } catch (e) {
      send(res, 400, { error: "Invalid JSON" });
      return;
    }
    const user = typeof body.user === "string" ? body.user.trim() : "";
    const allowedUsers = ["root", STANDARD_USER_NAME];
    if (!allowedUsers.includes(user)) {
      send(res, 400, { error: "仅支持 root 或标准用户 " + STANDARD_USER_NAME });
      return;
    }
    const v = validateSystemPassword(body.password);
    if (!v.ok) {
      send(res, 400, { error: v.message });
      return;
    }
    const password = String(body.password);
    const line = user + ":" + password + "\n";
    try {
      let r = spawnSync(CHPASSWD_BIN, [], {
        input: line,
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      if (r.error && (r.error.code === "ENOENT" || /ENOENT/i.test(String(r.error.message)))) {
        r = spawnSync("chpasswd", [], {
          input: line,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
        });
      }
      if (r.status !== 0) {
        const err = (r.stderr || r.stdout || r.error?.message || "chpasswd failed").trim();
        send(res, 500, { error: err || "修改密码失败" });
        return;
      }
      send(res, 200, { ok: true, message: user === "root" ? "系统管理员密码已更新" : "标准用户 " + user + " 密码已更新" });
    } catch (e) {
      send(res, 500, { error: String(e.message) });
    }
  },

  /**
   * 升级环境校验：服务端收集本机 version + env（Node 版本、平台、状态目录）上传至升级服务器；
   * 服务器认可 qualify 后才允许升级。body 可选 { version? }，不传则用当前管理端版本。
   * 升级服务器需实现 POST /qualify：接收 { version, env: { nodeVersion, platform, stateDir } }，返回 { qualify, message?, latestVersion? }。
   */
  "POST /api/upgrade-qualify": async (req, res) => {
    if (!(await requireAuth(req, res))) return;
    let body = {};
    try {
      body = await parseJsonBody(req).catch(() => ({}));
    } catch (_) {}
    const version = body.version || MANAGEMENT_VERSION;
    const env = {
      nodeVersion: process.version,
      platform: process.platform,
      stateDir: OPENCLAW_STATE_DIR,
    };
    const qualifyUrl = UPGRADE_URL.replace(/\/$/, "") + "/qualify";
    try {
      const r = await fetch(qualifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version, env }),
        signal: AbortSignal.timeout(10000),
      });
      const json = await r.json().catch(() => ({}));
      send(res, 200, { qualify: !!json.qualify, message: json.message, latestVersion: json.latestVersion });
    } catch (e) {
      send(res, 200, { qualify: true, message: "Upgrade server not configured; qualify skipped.", reserved: true });
    }
  },

  /** 前端用于「升级」「注册远程」链接的 URL（无需鉴权，仅读） */
  "GET /api/urls": async (_req, res) => {
    send(res, 200, { upgradeUrl: UPGRADE_PAGE_URL, remoteRegisterUrl: REMOTE_REGISTER_URL });
  },

  /** 鉴权后从 .env 读取指定 key 的值，用于前端显示 */
  "GET /api/env-key": async (req, res) => {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    const name = (req.url && new URL(req.url, "http://x").searchParams.get("name")) || "";
    const allowed = ["IDATABASE_API_KEY", "GEMINI_API_KEY", "MINIMAX_API_KEY", "MOONSHOT_API_KEY"];
    if (!allowed.includes(name)) {
      send(res, 400, { error: "不允许的 key" });
      return;
    }
    const envRaw = await readEnv();
    const envObj = parseEnvToObject(envRaw);
    send(res, 200, { value: envObj[name] != null ? String(envObj[name]) : "" });
  },

  /** 鉴权后从 config + .env + process.env 一次性解析大模型 / 向量 / Minimax 三个 API Key，供前端统一填充 */
  "GET /api/resolved-secrets": async (req, res) => {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    const config = await readConfig();
    const envRaw = await readEnv();
    const envObj = mergeEnvWithProcessEnv(parseEnvToObject(envRaw), envRaw);
    const secrets = getResolvedSecrets(config, envObj);
    send(res, 200, secrets);
  },

  /** 已配置信息摘要（用于页面展示，密钥以「已配置」代替）；并返回 env 密钥存在/缺失列表 */
  "GET /api/config-summary": async (req, res) => {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    const config = await readConfig();
    const envRaw = await readEnv();
    const envObj = parseEnvToObject(envRaw);
    const envKeysWeCareAbout = ["OPENCLAW_GATEWAY_TOKEN", "IDATABASE_API_KEY", "GEMINI_API_KEY", "MINIMAX_API_KEY", "MOONSHOT_API_KEY"];
    const envKeysPresent = envKeysWeCareAbout.filter((k) => (envObj[k] || "").trim().length > 0);
    const envKeysMissing = envKeysWeCareAbout.filter((k) => !(envObj[k] || "").trim().length);

    const feishu = config.channels?.feishu;
    const feishuAccount = feishu?.accounts && Object.values(feishu.accounts)[0];
    const idatabase = config.models?.providers?.idatabase;
    const memory = config.agents?.defaults?.memorySearch;
    const minimax = config.models?.providers?.minimax;
    const moonshot = config.models?.providers?.moonshot;
    const primary = config.agents?.defaults?.model?.primary;
    const localIps = getLocalIPv4Addresses();
    send(res, 200, {
      localIps,
      feishu: feishu?.enabled
        ? {
            appId: feishuAccount?.appId || "(未填)",
            domain: feishu?.domain || "feishu",
            hasSecret: !!feishuAccount?.appSecret,
          }
        : null,
      idatabase: idatabase
        ? {
            baseUrl: idatabase.baseUrl || "https://api.idatabase.ai",
            modelId: idatabase.models?.[0]?.id || "—",
            hasApiKey: typeof idatabase.apiKey === "string" ? !!idatabase.apiKey : !!idatabase.apiKey,
          }
        : null,
      memory: memory
        ? { provider: memory.provider, model: memory.model || "—", hasApiKey: !!(memory.remote?.apiKey && (typeof memory.remote.apiKey === "string" ? memory.remote.apiKey : true)) }
        : null,
      minimax: minimax ? { hasApiKey: !!minimax.apiKey } : null,
      moonshot: moonshot ? { hasApiKey: !!moonshot.apiKey, modelId: moonshot.models?.[0]?.id || "—" } : null,
      primaryModel: primary || null,
      modelFallbacks: config.agents?.defaults?.model?.fallbacks || [],
      envKeysPresent,
      envKeysMissing,
    });
  },

  /** 所有 Key 的键名、存储位置、值（敏感项脱敏）；valueRaw 为明文供前端眼睛图标切换显示。 */
  "GET /api/keys-final": async (req, res) => {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    try {
      const config = await readConfig();
      const envRaw = await readEnv();
      const envObj = parseEnvToObject(envRaw);
      let tokenValue = "";
      try {
        tokenValue = await fs.readFile(TOKEN_FILE, "utf8");
      } catch (_) {}
      const mask = (v, minLen = 12) => {
        if (v == null || String(v).trim() === "") return null;
        const s = String(v).trim();
        if (s.length <= minLen) return s.length ? "***" : null;
        return s.slice(0, 4) + "…" + s.slice(-4);
      };
      const push = (key, storage, displayVal, rawVal, sensitive) => {
        const row = { key, storage, value: displayVal };
        if (sensitive && rawVal != null && String(rawVal).trim() !== "") row.valueRaw = String(rawVal).trim();
        keys.push(row);
      };
      const keys = [];
      const localIps = getLocalIPv4Addresses();
      for (const { iface, address } of localIps) {
        push(`localIPv4.${iface}`, "system", address, address, false);
      }
      if (localIps.length === 0) {
        push("localIPv4", "system", "(无可用 IPv4)", "", false);
      }
      const acc = config.channels?.feishu?.accounts?.default;
      push("feishu.appId", "openclaw.json", acc?.appId ?? "(无)", acc?.appId, false);
      push("feishu.appSecret", "openclaw.json", acc?.appSecret != null ? mask(acc.appSecret) : "(无)", acc?.appSecret, true);
      const gwRaw = tokenValue || envObj.OPENCLAW_GATEWAY_TOKEN;
      const gwDisplay = tokenValue ? (mask(tokenValue) ?? `已设置(${tokenValue.length}字节)`) : (envObj.OPENCLAW_GATEWAY_TOKEN != null ? mask(envObj.OPENCLAW_GATEWAY_TOKEN) : "(未设置)");
      push("OPENCLAW_GATEWAY_TOKEN", tokenValue ? "data/token.txt" : ".env", gwDisplay, gwRaw || null, true);
      for (const k of ["IDATABASE_API_KEY", "GEMINI_API_KEY", "MINIMAX_API_KEY", "MOONSHOT_API_KEY", "FEISHU_APP_ID", "FEISHU_APP_SECRET"]) {
        const v = envObj[k];
        const raw = v != null && String(v).trim() ? String(v).trim() : null;
        push(k, ".env", raw ? mask(raw) : "(未设置)", raw, true);
      }
      const providers = config.models?.providers || {};
      for (const [name, p] of Object.entries(providers)) {
        if (p && typeof p === "object" && p.apiKey != null) {
          const v = typeof p.apiKey === "string" ? p.apiKey : "(引用)";
          const display = typeof v === "string" && v !== "(引用)" ? mask(v) : v;
          push(`models.providers.${name}.apiKey`, "openclaw.json", display, typeof v === "string" && v !== "(引用)" ? v : null, true);
        }
      }
      const memKey = config.agents?.defaults?.memorySearch?.remote?.apiKey;
      if (memKey != null) {
        push("memorySearch.remote.apiKey", "openclaw.json", mask(String(memKey)), String(memKey), true);
      }
      send(res, 200, { keys });
    } catch (e) {
      send(res, 500, { error: String(e?.message) });
    }
  },

  /** 测试 idatabase 连通性：POST /v1/chat/completions；body 可传 apiKey、baseUrl、model。未登录时也可用（凭 body 中的 key 测试）。 */
  "POST /api/test-idatabase": async (req, res) => {
    const body = await parseJsonBody(req);
    const baseUrl = (body.baseUrl || "https://api.idatabase.ai").replace(/\/$/, "");
    const apiKey = (body.apiKey && body.apiKey.trim()) || IDATABASE_TEST_KEY;
    const model = body.model || "gemini-3.1-flash-lite-preview";
    try {
      const r = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "你好，请确认收到信息" }],
        }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error?.message || data.error?.code || `HTTP ${r.status}`);
      if (data.error && (data.error.message || data.error.code)) throw new Error(data.error.message || data.error.code);
      send(res, 200, { ok: true, message: "idatabase 连通正常" });
    } catch (e) {
      send(res, 200, { ok: false, error: String(e.message) });
    }
  },

  /** 测试 Kimi（Moonshot）连通性：固定 https://api.moonshot.cn/v1，body 可传 apiKey、model。 */
  "POST /api/test-moonshot": async (req, res) => {
    const body = await parseJsonBody(req);
    const apiKey = (body.apiKey && body.apiKey.trim()) || "";
    const model = (body.model && body.model.trim()) || "kimi-k2.5";
    if (!apiKey) {
      send(res, 200, { ok: false, error: "请填写 API Key" });
      return;
    }
    const baseUrl = "https://api.moonshot.cn/v1";
    try {
      const r = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "你好，请确认收到信息" }],
        }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error?.message || data.error?.code || `HTTP ${r.status}`);
      if (data.error && (data.error.message || data.error.code)) throw new Error(data.error.message || data.error.code);
      send(res, 200, { ok: true, message: "Kimi 连通正常" });
    } catch (e) {
      send(res, 200, { ok: false, error: String(e.message) });
    }
  },

  /** 测试飞书应用凭证与长连接可用性：用 app_id + app_secret 获取 tenant_access_token。未登录时也可用（凭 body 中的 appId/appSecret 测试）。 */
  "POST /api/test-feishu": async (req, res) => {
    const body = await parseJsonBody(req);
    const appId = (body.appId && body.appId.trim()) || "";
    const appSecret = (body.appSecret && body.appSecret.trim()) || "";
    const domain = (body.domain && body.domain.trim()) || "feishu";
    if (!appId || !appSecret) {
      send(res, 200, { ok: false, error: "请填写应用 ID 和应用密钥" });
      return;
    }
    const tokenUrl =
      domain === "lark"
        ? "https://open.larkoffice.com/open-apis/auth/v3/tenant_access_token/internal"
        : "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal";
    try {
      const r = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
        signal: AbortSignal.timeout(10000),
      });
      const data = await r.json().catch(() => ({}));
      if (data.code !== 0) throw new Error(data.msg || `code ${data.code}`);
      send(res, 200, { ok: true, message: "飞书应用凭证有效，长连接需由 Gateway 启动后建立" });
    } catch (e) {
      send(res, 200, { ok: false, error: String(e.message) });
    }
  },

  /** 获取模型列表（仅上游返回，无静态/修饰）；与调用格式一致：默认 v1（POST baseUrl/v1/chat/completions + Bearer）。
   *  POST body: baseUrl, apiKey, apiStyle?: "v1"|"v1beta"|"all"。v1: baseUrl/v1/models → idatabase/xxx；v1beta: baseUrl/v1beta/models → google/xxx；all: 合并。 */
  "POST /api/models-list": async (req, res) => {
    const body = await parseJsonBody(req);
    const baseUrl = ((body.baseUrl && body.baseUrl.trim()) || "https://api.idatabase.ai").replace(/\/$/, "");
    const apiKey = (body.apiKey && body.apiKey.trim()) || IDATABASE_TEST_KEY;
    const apiStyle = (body.apiStyle && body.apiStyle.trim()) || "v1";
    const seen = new Set();
    const models = [];
    function add(id, providerPrefix) {
      const key = (providerPrefix || "idatabase") + "/" + id;
      if (!id || seen.has(key)) return;
      seen.add(key);
      models.push({ id, providerPrefix: providerPrefix || "idatabase" });
    }
    try {
      if (apiStyle === "v1" || apiStyle === "all") {
        const r = await fetch(`${baseUrl}/v1/models`, {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(10000),
        });
        const data = await r.json().catch(() => ({}));
        if (r.ok) {
          const list = data.data || data.models || [];
          (Array.isArray(list) ? list : []).forEach((m) => {
            const id = (m.id || m.model || m.name || String(m)).trim();
            if (id) add(id, "idatabase");
          });
        }
      }
      if (apiStyle === "v1beta" || apiStyle === "all") {
        const r = await fetch(`${baseUrl}/v1beta/models`, {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(10000),
        });
        const data = await r.json().catch(() => ({}));
        if (r.ok && Array.isArray(data.models)) {
          data.models.forEach((m) => {
            const name = m.name || m.id || "";
            const id = name.replace(/^models\//, "").trim() || (m.id || m.model || "").trim();
            if (id) add(id, "google");
          });
        }
      }
      send(res, 200, { models });
    } catch (e) {
      send(res, 200, { models: [], error: String(e.message) });
    }
  },

  /** 测试向量（记忆）API：与 idatabase 同根 URL https://api.idatabase.ai，请求 /v1/embeddings；若 baseUrl 已含 /v1 则只拼 /embeddings，避免双 v1。 */
  "POST /api/test-memory": async (req, res) => {
    const body = await parseJsonBody(req);
    const baseUrl = (body.baseUrl && body.baseUrl.trim()) || "https://api.idatabase.ai";
    const apiKey = (body.apiKey && body.apiKey.trim()) || IDATABASE_TEST_KEY;
    const model = (body.model && body.model.trim()) || "text-embedding-005";
    const base = baseUrl.replace(/\/$/, "");
    const embedPath = base.endsWith("/v1") ? "/embeddings" : "/v1/embeddings";
    try {
      const r = await fetch(`${base}${embedPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, input: "测试向量查询接口" }),
        signal: AbortSignal.timeout(10000),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error?.message || data.error?.code || `HTTP ${r.status}`);
      send(res, 200, { ok: true, message: "向量 API 连通正常" });
    } catch (e) {
      send(res, 200, { ok: false, error: String(e.message) });
    }
  },

  /** 清除设备上的 Token（需已验证）；删除 data/token.txt、openclaw.json 中 gateway token、.env 中 OPENCLAW_GATEWAY_TOKEN */
  "DELETE /api/token": async (req, res) => {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    try {
      const config = await readConfig();
      if (config.gateway?.auth) {
        delete config.gateway.auth.token;
        delete config.gateway.auth.mode;
        if (Object.keys(config.gateway.auth).length === 0) delete config.gateway.auth;
      }
      if (config.gateway?.remote) delete config.gateway.remote.token;
      await writeConfig(config);
      await fs.writeFile(TOKEN_FILE, "", "utf8").catch(() => {});
      const envRaw = await readEnv().catch(() => "");
      await fs.writeFile(ENV_PATH, stripEnvGatewayTokenLine(envRaw), { mode: 0o600 }).catch(() => {});
      delete process.env.OPENCLAW_GATEWAY_TOKEN;
      send(res, 200, { ok: true, message: "设备 Token 已清除（含 .env 中 OPENCLAW_GATEWAY_TOKEN）" });
    } catch (e) {
      send(res, 500, { error: String(e.message) });
    }
  },

  /** 一键清除所有帐号信息：openclaw.json 内 Gateway Token/飞书/大模型/记忆密钥、data/token.txt；.env 中仅删除对应敏感键所在行。写后校验落盘，未通过则补写一次（补清），加固可靠性。 */
  "POST /api/clear-all-accounts": async (req, res) => {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    try {
      const config = await readConfig();
      if (config.gateway?.auth) {
        delete config.gateway.auth.token;
        delete config.gateway.auth.mode;
        if (Object.keys(config.gateway.auth).length === 0) delete config.gateway.auth;
      }
      if (config.gateway?.remote) delete config.gateway.remote.token;
      if (config.channels?.feishu) {
        config.channels.feishu.accounts = {};
        config.channels.feishu.enabled = false;
      }
      if (config.plugins?.entries?.feishu && typeof config.plugins.entries.feishu === "object") {
        config.plugins.entries.feishu.enabled = false;
      }
      const providers = config.models?.providers || {};
      for (const p of Object.values(providers)) {
        if (p && typeof p === "object") delete p.apiKey;
      }
      if (config.agents?.defaults?.memorySearch?.remote && typeof config.agents.defaults.memorySearch.remote === "object") {
        delete config.agents.defaults.memorySearch.remote.apiKey;
      }
      console.info("[clear-all-accounts] CONFIG_PATH=" + CONFIG_PATH);
      const ensureCleared = async () => {
        await writeConfig(config);
        await new Promise((r) => setTimeout(r, 80));
        let ok = await verifyConfigCleared();
        if (!ok) {
          console.warn("[clear-all-accounts] 写后校验未通过，执行补清");
          await writeConfig(config);
          await new Promise((r) => setTimeout(r, 80));
          ok = await verifyConfigCleared();
        }
        return ok;
      };
      let cleared = await ensureCleared();
      for (let retry = 0; retry < 3 && !cleared; retry++) {
        await new Promise((r) => setTimeout(r, 350));
        cleared = await verifyConfigCleared();
        if (!cleared) {
          console.warn("[clear-all-accounts] 可能被网关写回，第 " + (retry + 1) + " 次重写");
          await writeConfig(config);
          await new Promise((r) => setTimeout(r, 80));
          cleared = await verifyConfigCleared();
        }
      }
      if (!cleared) {
        const rawCheck = await fs.readFile(CONFIG_PATH, "utf8").catch(() => "");
        console.error("[clear-all-accounts] 多次重写后仍未通过 path=" + CONFIG_PATH + " hasFeishu=" + (rawCheck.includes('"appId"') || rawCheck.includes('"appSecret"')));
        for (let s = 0; s < 2; s++) {
          try {
            const raw = await fs.readFile(CONFIG_PATH, "utf8");
            const onDisk = JSON.parse(raw);
            if (onDisk.gateway?.auth) {
              delete onDisk.gateway.auth.token;
              delete onDisk.gateway.auth.mode;
              if (Object.keys(onDisk.gateway.auth).length === 0) delete onDisk.gateway.auth;
            }
            if (onDisk.gateway?.remote) delete onDisk.gateway.remote.token;
            if (onDisk.channels?.feishu) {
              onDisk.channels.feishu.accounts = {};
              onDisk.channels.feishu.enabled = false;
            }
            const providers = onDisk.models?.providers || {};
            for (const p of Object.values(providers)) {
              if (p && typeof p === "object") delete p.apiKey;
            }
            if (onDisk.agents?.defaults?.memorySearch?.remote && typeof onDisk.agents.defaults.memorySearch.remote === "object") {
              delete onDisk.agents.defaults.memorySearch.remote.apiKey;
            }
            await writeConfig(onDisk);
            await new Promise((r) => setTimeout(r, 200));
            cleared = await verifyConfigCleared();
            if (cleared) {
              console.info("[clear-all-accounts] 兜底修补写盘后校验通过");
              break;
            }
          } catch (e) {
            console.error("[clear-all-accounts] 兜底修补写盘失败:", e?.message || e);
          }
        }
      }
      await fs.writeFile(TOKEN_FILE, "", "utf8").catch((e) => {
        console.error("[clear-all-accounts] TOKEN_FILE write failed:", e?.message || e);
      });
      const envRaw = await readEnv().catch(() => "");
      if (envRaw) {
        const stripped = stripSensitiveKeysFromEnvRaw(envRaw);
        await fs.writeFile(ENV_PATH, stripped, "utf8").catch((e) => {
          console.error("[clear-all-accounts] ENV_PATH write failed:", e?.message || e);
        });
      }
      delete process.env.OPENCLAW_GATEWAY_TOKEN;
      await new Promise((r) => setTimeout(r, 200));
      const restarted = await restartGatewayService();
      if (restarted) {
        await stripAutoGeneratedGatewayTokenAfterGatewayRestart();
        send(res, 200, {
          ok: true,
          message:
            "已清除 Gateway Token、飞书帐号、大模型与记忆密钥及 .env 中对应敏感项；已重启 Gateway。已尝试清除网关启动时自动写回的 Gateway Token，刷新管理页应显示「首次设置」（自动生成）。",
        });
      } else {
        triggerGatewayReload().catch(() => {});
        send(res, 200, { ok: true, message: "已清除 Gateway Token、飞书帐号、大模型与记忆密钥及 .env 中对应敏感项；Gateway 将热加载。若需彻底清空网关进程内存，请在本机手动执行：systemctl restart openclaw-gateway.service" });
      }
    } catch (e) {
      send(res, 500, { error: String(e.message) });
    }
  },
};

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  const pathname = ((req.url && req.url.split("?")[0]) || req.url || "").replace(/\/$/, "") || "/";
  const key = `${req.method} ${pathname}`;
  const handler = ROUTES[key] || (pathname === "/" || pathname === "/index.html" ? null : undefined);
  if (handler) {
    try {
      await handler(req, res);
    } catch (e) {
      console.error(e);
      send(res, 500, { error: String(e.message) });
    }
    return;
  }
  if (req.method === "GET" && (pathname === "/" || pathname === "/index.html")) {
    try {
      const p = path.join(__dirname, "public", "index.html");
      const html = await fs.readFile(p, "utf8");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.writeHead(200);
      res.end(html);
    } catch (e) {
      res.writeHead(404);
      res.end("Not found");
    }
    return;
  }
  res.writeHead(404);
  res.end("Not found");
});

ensureDataDir()
  .then(() => {
    server.listen({ port: PORT, host: "0.0.0.0", reuseAddress: true }, () => {
      console.log(`AmyClaw 管理服务: http://0.0.0.0:${PORT}  (OPENCLAW_STATE_DIR=${OPENCLAW_STATE_DIR})`);
    });
  })
  .catch((e) => {
    console.error("初始化 data 目录失败:", e);
    process.exit(1);
  });
