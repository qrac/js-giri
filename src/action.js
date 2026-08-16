import { getCutHostnames } from "./javascript.js";
import { getEligibleHostname } from "./site.js";

const ICONS = {
  normal: {
    16: chrome.runtime.getURL("icons/off/icon-16.png"),
    32: chrome.runtime.getURL("icons/off/icon-32.png"),
  },
  cut: {
    16: chrome.runtime.getURL("icons/on/icon-16.png"),
    32: chrome.runtime.getURL("icons/on/icon-32.png"),
  },
};

/**
 * タブのURLと保存状態に合わせてactionを更新する。
 * @param {chrome.tabs.Tab} tab
 */
export async function updateActionForTab(tab) {
  if (tab.id === undefined) return;

  // Without the tabs permission, URL is available only for tabs where Chrome
  // has granted temporary access (for example, after an action click).
  if (typeof tab.url !== "string") {
    await chrome.action.enable(tab.id);
    return;
  }

  const hostname = getEligibleHostname(tab.url);
  const hostnames = hostname ? await getCutHostnames() : [];
  const isCut = hostname !== null && hostnames.includes(hostname);

  await Promise.all([
    chrome.action.setIcon({ tabId: tab.id, path: isCut ? ICONS.cut : ICONS.normal }),
    chrome.action.setTitle({
      tabId: tab.id,
      title: isCut
        ? "このサイトのJavaScriptを元に戻す"
        : hostname
          ? "このサイトのJavaScriptを切る"
          : "このページでは使用できません",
    }),
    // Keep the action clickable even when the page is unsupported. Without
    // tabs permission, disabling it could leave it disabled after navigation
    // because the new URL may not be available to the extension.
    chrome.action.enable(tab.id),
  ]);
}
