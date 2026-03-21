#!/usr/bin/env node
/**
 * 将状态目录的 openclaw.json 修复为 google 专用配置（与 production-template 一致），
 * 同时保留现有 gateway、channels.feishu、plugins、commands、meta。
 * 用法：OPENCLAW_STATE_DIR=/root/.openclaw node scripts/sync-config-google-only.js
 */

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const STATE_DIR = process.env.OPENCLAW_STATE_DIR || path.join(process.env.HOME || "/root", ".openclaw");
const STATE_CONFIG = path.join(STATE_DIR, "openclaw.json");
const TEMPLATE_CONFIG = path.join(REPO, "openclaw/production-template/state/openclaw.json");

const template = JSON.parse(fs.readFileSync(TEMPLATE_CONFIG, "utf8"));
let current = {};
if (fs.existsSync(STATE_CONFIG)) {
  current = JSON.parse(fs.readFileSync(STATE_CONFIG, "utf8"));
}

// 使用模板的 models、agents、browser、update、env
const merged = {
  ...template,
  gateway: current.gateway ?? template.gateway,
  channels: current.channels ?? template.channels,
  plugins: current.plugins,
  commands: current.commands,
  meta: current.meta,
};
if (merged.channels?.feishu && !merged.channels.feishu.accounts) {
  merged.channels.feishu.accounts = {};
}
if (merged.channels?.feishu && template.channels?.feishu) {
  merged.channels.feishu.enabled = current.channels?.feishu?.enabled ?? template.channels.feishu.enabled;
  merged.channels.feishu.requireMention = current.channels?.feishu?.requireMention ?? template.channels.feishu.requireMention;
  merged.channels.feishu.domain = merged.channels.feishu.domain ?? template.channels.feishu.domain;
  merged.channels.feishu.dmPolicy = merged.channels.feishu.dmPolicy ?? template.channels.feishu.dmPolicy;
  merged.channels.feishu.accounts = current.channels?.feishu?.accounts ?? merged.channels.feishu.accounts ?? {};
}

fs.writeFileSync(STATE_CONFIG, JSON.stringify(merged, null, 2), "utf8");
console.log("已写入:", STATE_CONFIG);
console.log("  models.providers: 仅 google (idatabase v1beta)");
console.log("  agents.defaults.model.primary: google/gemini-3.1-pro-preview");
console.log("  agents.defaults.memorySearch.remote.baseUrl: https://api.idatabase.ai/v1/");
console.log("  已保留: gateway, channels.feishu, plugins, commands, meta");
