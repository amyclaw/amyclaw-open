import { r as runExec } from "./exec-CwhzW0JB.js";
import { h as parseLooseIpAddress, i as isCanonicalDottedDecimalIPv4, l as isLegacyIpv4Literal, m as parseCanonicalIpAddress, n as isBlockedSpecialUseIpv4Address, r as isBlockedSpecialUseIpv6Address, s as isIpv4Address, t as extractEmbeddedIpv4FromIpv6 } from "./ip-w605xvSx.js";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { lookup } from "node:dns";
import { lookup as lookup$1 } from "node:dns/promises";
import { Agent, EnvHttpProxyAgent, ProxyAgent } from "undici";
//#region src/infra/net/hostname.ts
function normalizeHostname(hostname) {
	const normalized = hostname.trim().toLowerCase().replace(/\.$/, "");
	if (normalized.startsWith("[") && normalized.endsWith("]")) return normalized.slice(1, -1);
	return normalized;
}
//#endregion
//#region src/infra/net/ssrf.ts
var SsrFBlockedError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "SsrFBlockedError";
	}
};
const BLOCKED_HOSTNAMES = new Set([
	"localhost",
	"localhost.localdomain",
	"metadata.google.internal"
]);
function normalizeHostnameSet(values) {
	if (!values || values.length === 0) return /* @__PURE__ */ new Set();
	return new Set(values.map((value) => normalizeHostname(value)).filter(Boolean));
}
function normalizeHostnameAllowlist(values) {
	if (!values || values.length === 0) return [];
	return Array.from(new Set(values.map((value) => normalizeHostname(value)).filter((value) => value !== "*" && value !== "*." && value.length > 0)));
}
function isPrivateNetworkAllowedByPolicy(policy) {
	return policy?.dangerouslyAllowPrivateNetwork === true || policy?.allowPrivateNetwork === true;
}
function resolveIpv4SpecialUseBlockOptions(policy) {
	return { allowRfc2544BenchmarkRange: policy?.allowRfc2544BenchmarkRange === true };
}
function isHostnameAllowedByPattern(hostname, pattern) {
	if (pattern.startsWith("*.")) {
		const suffix = pattern.slice(2);
		if (!suffix || hostname === suffix) return false;
		return hostname.endsWith(`.${suffix}`);
	}
	return hostname === pattern;
}
function matchesHostnameAllowlist(hostname, allowlist) {
	if (allowlist.length === 0) return true;
	return allowlist.some((pattern) => isHostnameAllowedByPattern(hostname, pattern));
}
function looksLikeUnsupportedIpv4Literal(address) {
	const parts = address.split(".");
	if (parts.length === 0 || parts.length > 4) return false;
	if (parts.some((part) => part.length === 0)) return true;
	return parts.every((part) => /^[0-9]+$/.test(part) || /^0x/i.test(part));
}
function isPrivateIpAddress(address, policy) {
	let normalized = address.trim().toLowerCase();
	if (normalized.startsWith("[") && normalized.endsWith("]")) normalized = normalized.slice(1, -1);
	if (!normalized) return false;
	const blockOptions = resolveIpv4SpecialUseBlockOptions(policy);
	const strictIp = parseCanonicalIpAddress(normalized);
	if (strictIp) {
		if (isIpv4Address(strictIp)) return isBlockedSpecialUseIpv4Address(strictIp, blockOptions);
		if (isBlockedSpecialUseIpv6Address(strictIp)) return true;
		const embeddedIpv4 = extractEmbeddedIpv4FromIpv6(strictIp);
		if (embeddedIpv4) return isBlockedSpecialUseIpv4Address(embeddedIpv4, blockOptions);
		return false;
	}
	if (normalized.includes(":") && !parseLooseIpAddress(normalized)) return true;
	if (!isCanonicalDottedDecimalIPv4(normalized) && isLegacyIpv4Literal(normalized)) return true;
	if (looksLikeUnsupportedIpv4Literal(normalized)) return true;
	return false;
}
function isBlockedHostname(hostname) {
	const normalized = normalizeHostname(hostname);
	if (!normalized) return false;
	return isBlockedHostnameNormalized(normalized);
}
function isBlockedHostnameNormalized(normalized) {
	if (BLOCKED_HOSTNAMES.has(normalized)) return true;
	return normalized.endsWith(".localhost") || normalized.endsWith(".local") || normalized.endsWith(".internal");
}
function isBlockedHostnameOrIp(hostname, policy) {
	const normalized = normalizeHostname(hostname);
	if (!normalized) return false;
	return isBlockedHostnameNormalized(normalized) || isPrivateIpAddress(normalized, policy);
}
const BLOCKED_HOST_OR_IP_MESSAGE = "Blocked hostname or private/internal/special-use IP address";
const BLOCKED_RESOLVED_IP_MESSAGE = "Blocked: resolves to private/internal/special-use IP address";
function assertAllowedHostOrIpOrThrow(hostnameOrIp, policy) {
	if (isBlockedHostnameOrIp(hostnameOrIp, policy)) throw new SsrFBlockedError(BLOCKED_HOST_OR_IP_MESSAGE);
}
function assertAllowedResolvedAddressesOrThrow(results, policy) {
	for (const entry of results) if (isBlockedHostnameOrIp(entry.address, policy)) throw new SsrFBlockedError(BLOCKED_RESOLVED_IP_MESSAGE);
}
function createPinnedLookup(params) {
	const normalizedHost = normalizeHostname(params.hostname);
	const fallback = params.fallback ?? lookup;
	const fallbackLookup = fallback;
	const fallbackWithOptions = fallback;
	const records = params.addresses.map((address) => ({
		address,
		family: address.includes(":") ? 6 : 4
	}));
	let index = 0;
	return ((host, options, callback) => {
		const cb = typeof options === "function" ? options : callback;
		if (!cb) return;
		const normalized = normalizeHostname(host);
		if (!normalized || normalized !== normalizedHost) {
			if (typeof options === "function" || options === void 0) return fallbackLookup(host, cb);
			return fallbackWithOptions(host, options, cb);
		}
		const opts = typeof options === "object" && options !== null ? options : {};
		const requestedFamily = typeof options === "number" ? options : typeof opts.family === "number" ? opts.family : 0;
		const candidates = requestedFamily === 4 || requestedFamily === 6 ? records.filter((entry) => entry.family === requestedFamily) : records;
		const usable = candidates.length > 0 ? candidates : records;
		if (opts.all) {
			cb(null, usable);
			return;
		}
		const chosen = usable[index % usable.length];
		index += 1;
		cb(null, chosen.address, chosen.family);
	});
}
function dedupeAndPreferIpv4(results) {
	const seen = /* @__PURE__ */ new Set();
	const ipv4 = [];
	const otherFamilies = [];
	for (const entry of results) {
		if (seen.has(entry.address)) continue;
		seen.add(entry.address);
		if (entry.family === 4) {
			ipv4.push(entry.address);
			continue;
		}
		otherFamilies.push(entry.address);
	}
	return [...ipv4, ...otherFamilies];
}
async function resolvePinnedHostnameWithPolicy(hostname, params = {}) {
	const normalized = normalizeHostname(hostname);
	if (!normalized) throw new Error("Invalid hostname");
	const allowPrivateNetwork = isPrivateNetworkAllowedByPolicy(params.policy);
	const allowedHostnames = normalizeHostnameSet(params.policy?.allowedHostnames);
	const hostnameAllowlist = normalizeHostnameAllowlist(params.policy?.hostnameAllowlist);
	const isExplicitAllowed = allowedHostnames.has(normalized);
	const skipPrivateNetworkChecks = allowPrivateNetwork || isExplicitAllowed;
	if (!matchesHostnameAllowlist(normalized, hostnameAllowlist)) throw new SsrFBlockedError(`Blocked hostname (not in allowlist): ${hostname}`);
	if (!skipPrivateNetworkChecks) assertAllowedHostOrIpOrThrow(normalized, params.policy);
	const results = await (params.lookupFn ?? lookup$1)(normalized, { all: true });
	if (results.length === 0) throw new Error(`Unable to resolve hostname: ${hostname}`);
	if (!skipPrivateNetworkChecks) assertAllowedResolvedAddressesOrThrow(results, params.policy);
	const addresses = dedupeAndPreferIpv4(results);
	if (addresses.length === 0) throw new Error(`Unable to resolve hostname: ${hostname}`);
	return {
		hostname: normalized,
		addresses,
		lookup: createPinnedLookup({
			hostname: normalized,
			addresses
		})
	};
}
async function resolvePinnedHostname(hostname, lookupFn = lookup$1) {
	return await resolvePinnedHostnameWithPolicy(hostname, { lookupFn });
}
function withPinnedLookup(lookup, connect) {
	return connect ? {
		...connect,
		lookup
	} : { lookup };
}
function createPinnedDispatcher(pinned, policy) {
	if (!policy || policy.mode === "direct") return new Agent({ connect: withPinnedLookup(pinned.lookup, policy?.connect) });
	if (policy.mode === "env-proxy") return new EnvHttpProxyAgent({
		connect: withPinnedLookup(pinned.lookup, policy.connect),
		...policy.proxyTls ? { proxyTls: { ...policy.proxyTls } } : {}
	});
	const proxyUrl = policy.proxyUrl.trim();
	if (!policy.proxyTls) return new ProxyAgent(proxyUrl);
	return new ProxyAgent({
		uri: proxyUrl,
		proxyTls: { ...policy.proxyTls }
	});
}
async function closeDispatcher(dispatcher) {
	if (!dispatcher) return;
	const candidate = dispatcher;
	try {
		if (typeof candidate.close === "function") {
			await candidate.close();
			return;
		}
		if (typeof candidate.destroy === "function") candidate.destroy();
	} catch {}
}
async function assertPublicHostname(hostname, lookupFn = lookup$1) {
	await resolvePinnedHostname(hostname, lookupFn);
}
//#endregion
//#region src/media/image-ops.ts
const IMAGE_REDUCE_QUALITY_STEPS = [
	85,
	75,
	65,
	55,
	45,
	35
];
function buildImageResizeSideGrid(maxSide, sideStart) {
	return [
		sideStart,
		1800,
		1600,
		1400,
		1200,
		1e3,
		800
	].map((value) => Math.min(maxSide, value)).filter((value, idx, arr) => value > 0 && arr.indexOf(value) === idx).toSorted((a, b) => b - a);
}
function isBun() {
	return typeof process.versions.bun === "string";
}
function prefersSips() {
	return process.env.OPENCLAW_IMAGE_BACKEND === "sips" || process.env.OPENCLAW_IMAGE_BACKEND !== "sharp" && isBun() && process.platform === "darwin";
}
async function loadSharp() {
	const mod = await import("sharp");
	const sharp = mod.default ?? mod;
	return (buffer) => sharp(buffer, { failOnError: false });
}
/**
* Reads EXIF orientation from JPEG buffer.
* Returns orientation value 1-8, or null if not found/not JPEG.
*
* EXIF orientation values:
* 1 = Normal, 2 = Flip H, 3 = Rotate 180, 4 = Flip V,
* 5 = Rotate 270 CW + Flip H, 6 = Rotate 90 CW, 7 = Rotate 90 CW + Flip H, 8 = Rotate 270 CW
*/
function readJpegExifOrientation(buffer) {
	if (buffer.length < 2 || buffer[0] !== 255 || buffer[1] !== 216) return null;
	let offset = 2;
	while (offset < buffer.length - 4) {
		if (buffer[offset] !== 255) {
			offset++;
			continue;
		}
		const marker = buffer[offset + 1];
		if (marker === 255) {
			offset++;
			continue;
		}
		if (marker === 225) {
			const exifStart = offset + 4;
			if (buffer.length > exifStart + 6 && buffer.toString("ascii", exifStart, exifStart + 4) === "Exif" && buffer[exifStart + 4] === 0 && buffer[exifStart + 5] === 0) {
				const tiffStart = exifStart + 6;
				if (buffer.length < tiffStart + 8) return null;
				const isLittleEndian = buffer.toString("ascii", tiffStart, tiffStart + 2) === "II";
				const readU16 = (pos) => isLittleEndian ? buffer.readUInt16LE(pos) : buffer.readUInt16BE(pos);
				const readU32 = (pos) => isLittleEndian ? buffer.readUInt32LE(pos) : buffer.readUInt32BE(pos);
				const ifd0Start = tiffStart + readU32(tiffStart + 4);
				if (buffer.length < ifd0Start + 2) return null;
				const numEntries = readU16(ifd0Start);
				for (let i = 0; i < numEntries; i++) {
					const entryOffset = ifd0Start + 2 + i * 12;
					if (buffer.length < entryOffset + 12) break;
					if (readU16(entryOffset) === 274) {
						const value = readU16(entryOffset + 8);
						return value >= 1 && value <= 8 ? value : null;
					}
				}
			}
			return null;
		}
		if (marker >= 224 && marker <= 239) {
			const segmentLength = buffer.readUInt16BE(offset + 2);
			offset += 2 + segmentLength;
			continue;
		}
		if (marker === 192 || marker === 218) break;
		offset++;
	}
	return null;
}
async function withTempDir(fn) {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-img-"));
	try {
		return await fn(dir);
	} finally {
		await fs.rm(dir, {
			recursive: true,
			force: true
		}).catch(() => {});
	}
}
async function sipsMetadataFromBuffer(buffer) {
	return await withTempDir(async (dir) => {
		const input = path.join(dir, "in.img");
		await fs.writeFile(input, buffer);
		const { stdout } = await runExec("/usr/bin/sips", [
			"-g",
			"pixelWidth",
			"-g",
			"pixelHeight",
			input
		], {
			timeoutMs: 1e4,
			maxBuffer: 512 * 1024
		});
		const w = stdout.match(/pixelWidth:\s*([0-9]+)/);
		const h = stdout.match(/pixelHeight:\s*([0-9]+)/);
		if (!w?.[1] || !h?.[1]) return null;
		const width = Number.parseInt(w[1], 10);
		const height = Number.parseInt(h[1], 10);
		if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
		if (width <= 0 || height <= 0) return null;
		return {
			width,
			height
		};
	});
}
async function sipsResizeToJpeg(params) {
	return await withTempDir(async (dir) => {
		const input = path.join(dir, "in.img");
		const output = path.join(dir, "out.jpg");
		await fs.writeFile(input, params.buffer);
		await runExec("/usr/bin/sips", [
			"-Z",
			String(Math.max(1, Math.round(params.maxSide))),
			"-s",
			"format",
			"jpeg",
			"-s",
			"formatOptions",
			String(Math.max(1, Math.min(100, Math.round(params.quality)))),
			input,
			"--out",
			output
		], {
			timeoutMs: 2e4,
			maxBuffer: 1024 * 1024
		});
		return await fs.readFile(output);
	});
}
async function sipsConvertToJpeg(buffer) {
	return await withTempDir(async (dir) => {
		const input = path.join(dir, "in.heic");
		const output = path.join(dir, "out.jpg");
		await fs.writeFile(input, buffer);
		await runExec("/usr/bin/sips", [
			"-s",
			"format",
			"jpeg",
			input,
			"--out",
			output
		], {
			timeoutMs: 2e4,
			maxBuffer: 1024 * 1024
		});
		return await fs.readFile(output);
	});
}
async function getImageMetadata(buffer) {
	if (prefersSips()) return await sipsMetadataFromBuffer(buffer).catch(() => null);
	try {
		const meta = await (await loadSharp())(buffer).metadata();
		const width = Number(meta.width ?? 0);
		const height = Number(meta.height ?? 0);
		if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
		if (width <= 0 || height <= 0) return null;
		return {
			width,
			height
		};
	} catch {
		return null;
	}
}
/**
* Applies rotation/flip to image buffer using sips based on EXIF orientation.
*/
async function sipsApplyOrientation(buffer, orientation) {
	const ops = [];
	switch (orientation) {
		case 2:
			ops.push("-f", "horizontal");
			break;
		case 3:
			ops.push("-r", "180");
			break;
		case 4:
			ops.push("-f", "vertical");
			break;
		case 5:
			ops.push("-r", "270", "-f", "horizontal");
			break;
		case 6:
			ops.push("-r", "90");
			break;
		case 7:
			ops.push("-r", "90", "-f", "horizontal");
			break;
		case 8:
			ops.push("-r", "270");
			break;
		default: return buffer;
	}
	return await withTempDir(async (dir) => {
		const input = path.join(dir, "in.jpg");
		const output = path.join(dir, "out.jpg");
		await fs.writeFile(input, buffer);
		await runExec("/usr/bin/sips", [
			...ops,
			input,
			"--out",
			output
		], {
			timeoutMs: 2e4,
			maxBuffer: 1024 * 1024
		});
		return await fs.readFile(output);
	});
}
/**
* Normalizes EXIF orientation in an image buffer.
* Returns the buffer with correct pixel orientation (rotated if needed).
* Falls back to original buffer if normalization fails.
*/
async function normalizeExifOrientation(buffer) {
	if (prefersSips()) try {
		const orientation = readJpegExifOrientation(buffer);
		if (!orientation || orientation === 1) return buffer;
		return await sipsApplyOrientation(buffer, orientation);
	} catch {
		return buffer;
	}
	try {
		return await (await loadSharp())(buffer).rotate().toBuffer();
	} catch {
		return buffer;
	}
}
async function resizeToJpeg(params) {
	if (prefersSips()) {
		const normalized = await normalizeExifOrientationSips(params.buffer);
		if (params.withoutEnlargement !== false) {
			const meta = await getImageMetadata(normalized);
			if (meta) {
				const maxDim = Math.max(meta.width, meta.height);
				if (maxDim > 0 && maxDim <= params.maxSide) return await sipsResizeToJpeg({
					buffer: normalized,
					maxSide: maxDim,
					quality: params.quality
				});
			}
		}
		return await sipsResizeToJpeg({
			buffer: normalized,
			maxSide: params.maxSide,
			quality: params.quality
		});
	}
	return await (await loadSharp())(params.buffer).rotate().resize({
		width: params.maxSide,
		height: params.maxSide,
		fit: "inside",
		withoutEnlargement: params.withoutEnlargement !== false
	}).jpeg({
		quality: params.quality,
		mozjpeg: true
	}).toBuffer();
}
async function convertHeicToJpeg(buffer) {
	if (prefersSips()) return await sipsConvertToJpeg(buffer);
	return await (await loadSharp())(buffer).jpeg({
		quality: 90,
		mozjpeg: true
	}).toBuffer();
}
/**
* Checks if an image has an alpha channel (transparency).
* Returns true if the image has alpha, false otherwise.
*/
async function hasAlphaChannel(buffer) {
	try {
		const meta = await (await loadSharp())(buffer).metadata();
		return meta.hasAlpha || meta.channels === 4;
	} catch {
		return false;
	}
}
/**
* Resizes an image to PNG format, preserving alpha channel (transparency).
* Falls back to sharp only (no sips fallback for PNG with alpha).
*/
async function resizeToPng(params) {
	const sharp = await loadSharp();
	const compressionLevel = params.compressionLevel ?? 6;
	return await sharp(params.buffer).rotate().resize({
		width: params.maxSide,
		height: params.maxSide,
		fit: "inside",
		withoutEnlargement: params.withoutEnlargement !== false
	}).png({ compressionLevel }).toBuffer();
}
async function optimizeImageToPng(buffer, maxBytes) {
	const sides = [
		2048,
		1536,
		1280,
		1024,
		800
	];
	const compressionLevels = [
		6,
		7,
		8,
		9
	];
	let smallest = null;
	for (const side of sides) for (const compressionLevel of compressionLevels) try {
		const out = await resizeToPng({
			buffer,
			maxSide: side,
			compressionLevel,
			withoutEnlargement: true
		});
		const size = out.length;
		if (!smallest || size < smallest.size) smallest = {
			buffer: out,
			size,
			resizeSide: side,
			compressionLevel
		};
		if (size <= maxBytes) return {
			buffer: out,
			optimizedSize: size,
			resizeSide: side,
			compressionLevel
		};
	} catch {}
	if (smallest) return {
		buffer: smallest.buffer,
		optimizedSize: smallest.size,
		resizeSide: smallest.resizeSide,
		compressionLevel: smallest.compressionLevel
	};
	throw new Error("Failed to optimize PNG image");
}
/**
* Internal sips-only EXIF normalization (no sharp fallback).
* Used by resizeToJpeg to normalize before sips resize.
*/
async function normalizeExifOrientationSips(buffer) {
	try {
		const orientation = readJpegExifOrientation(buffer);
		if (!orientation || orientation === 1) return buffer;
		return await sipsApplyOrientation(buffer, orientation);
	} catch {
		return buffer;
	}
}
//#endregion
export { isPrivateIpAddress as _, hasAlphaChannel as a, resolvePinnedHostnameWithPolicy as b, resizeToJpeg as c, assertPublicHostname as d, closeDispatcher as f, isBlockedHostnameOrIp as g, isBlockedHostname as h, getImageMetadata as i, resizeToPng as l, createPinnedLookup as m, buildImageResizeSideGrid as n, normalizeExifOrientation as o, createPinnedDispatcher as p, convertHeicToJpeg as r, optimizeImageToPng as s, IMAGE_REDUCE_QUALITY_STEPS as t, SsrFBlockedError as u, isPrivateNetworkAllowedByPolicy as v, normalizeHostname as x, resolvePinnedHostname as y };
