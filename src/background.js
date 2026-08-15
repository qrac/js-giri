import { updateActionForTab, updateAllActions } from "./action.js";
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
  runSafely(async () => {
    await Promise.all([initializeContextMenu(), updateAllActions()]);
  });
});

chrome.runtime.onStartup.addListener(() => {
  runSafely(updateAllActions);
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

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.cutHostnames) {
    runSafely(updateAllActions);
  }
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === SETTINGS_MENU_ID) {
    void chrome.runtime.openOptionsPage();
  }
});

// 拡張自身の画面から、action clickと同じ処理を呼べる内部メッセージ。
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "toggle-tab" || sender.id !== chrome.runtime.id) return false;

  void (async () => {
    try {
      const tab = await chrome.tabs.get(message.tabId);
      const state = await toggleJavaScriptForTab(tab);
      await updateActionForTab(tab);
      sendResponse({ state });
    } catch (error) {
      console.error(error);
      sendResponse({ state: "error", error: String(error) });
    }
  })();
  return true;
});
