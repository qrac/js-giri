import { createContentSettingPattern, getEligibleHostname } from "./site.js";

const STORAGE_KEY = "cutHostnames";

/** @returns {Promise<string[]>} */
export async function getCutHostnames() {
  const stored = await chrome.storage.local.get({ [STORAGE_KEY]: [] });
  const hostnames = stored[STORAGE_KEY];
  if (!Array.isArray(hostnames)) return [];

  return [...new Set(hostnames.filter((value) => typeof value === "string"))].sort();
}

/**
 * contentSettingsには個別ruleの削除APIがないため、JS斬りのruleを一旦clearし、
 * ローカル管理している残りのhostnameだけを再設定する。
 * @param {string[]} hostnames
 */
async function applyCutHostnames(hostnames) {
  await chrome.contentSettings.javascript.clear({ scope: "regular" });

  for (const hostname of hostnames) {
    await chrome.contentSettings.javascript.set({
      primaryPattern: createContentSettingPattern(hostname),
      setting: "block",
      scope: "regular",
    });
  }
}

/**
 * JS斬りが管理するhostname一覧を置換する。
 * @param {string[]} hostnames
 */
export async function replaceCutHostnames(hostnames) {
  const normalized = [...new Set(hostnames)].sort();
  await applyCutHostnames(normalized);
  await chrome.storage.local.set({ [STORAGE_KEY]: normalized });
}

/** @param {string} hostname */
export async function removeCutHostname(hostname) {
  const hostnames = await getCutHostnames();
  await replaceCutHostnames(hostnames.filter((value) => value !== hostname));
}

/**
 * タブのhostnameに対するJS斬りを反転してタブを再読み込みする。
 * @param {chrome.tabs.Tab} tab
 * @returns {Promise<"cut" | "normal" | "unsupported">}
 */
export async function toggleJavaScriptForTab(tab) {
  const hostname = getEligibleHostname(tab.url);
  if (!hostname || tab.id === undefined) return "unsupported";

  const hostnames = await getCutHostnames();
  const isCut = hostnames.includes(hostname);
  const nextHostnames = isCut
    ? hostnames.filter((value) => value !== hostname)
    : [...hostnames, hostname];

  await replaceCutHostnames(nextHostnames);
  await chrome.tabs.reload(tab.id);
  return isCut ? "normal" : "cut";
}

