import { updateActionForTab } from "./action.js";
import { initializeContextMenu, SETTINGS_MENU_ID } from "./context-menu.js";
import { toggleJavaScriptForTab } from "./javascript.js";

/** @param {() => Promise<unknown>} task */
function runSafely(task) {
  void (async () => {
    try {
      await task();
    } catch (error) {
      console.error(error);
    }
  })();
}

chrome.runtime.onInstalled.addListener(() => {
  runSafely(initializeContextMenu);
});

chrome.action.onClicked.addListener((tab) => {
  runSafely(async () => {
    await toggleJavaScriptForTab(tab);
    await updateActionForTab(tab);
  });
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  runSafely(async () => {
    await updateActionForTab(await chrome.tabs.get(tabId));
  });
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" || changeInfo.url) {
    runSafely(async () => updateActionForTab(tab));
  }
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === SETTINGS_MENU_ID) {
    void chrome.runtime.openOptionsPage();
  }
});
