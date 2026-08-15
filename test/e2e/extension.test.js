import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { once } from "node:events";
import { resolve } from "node:path";
import test from "node:test";
import puppeteer from "puppeteer";

const extensionPath = resolve("dist");
const fixturePath = resolve("test/e2e/fixtures/index.html");

/** @returns {Promise<{server: import("node:http").Server, port: number}>} */
async function startFixtureServer() {
  const fixture = await readFile(fixturePath, "utf8");
  const server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(fixture);
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("fixture server failed");
  return { server, port: address.port };
}

/**
 * @param {import("puppeteer").Page} extensionPage
 * @param {number} tabId
 */
async function toggleTab(extensionPage, tabId) {
  return extensionPage.evaluate(async (targetTabId) => {
    const response = await chrome.runtime.sendMessage({ type: "toggle-tab", tabId: targetTabId });
    if (response.state === "error") throw new Error(response.error);
    return response.state;
  }, tabId);
}

/**
 * Content Settings変更後のreloadを、main frameの遷移イベントで待つ。
 * @param {import("puppeteer").Page} extensionPage
 * @param {number} tabId
 * @param {import("puppeteer").Page} page
 */
async function toggleAndWaitForReload(extensionPage, tabId, page) {
  const reloaded = new Promise((resolve) => {
    /** @param {import("puppeteer").Frame} frame */
    const handleNavigation = (frame) => {
      if (frame.parentFrame() === null) {
        page.off("framenavigated", handleNavigation);
        resolve(undefined);
      }
    };
    page.on("framenavigated", handleNavigation);
  });

  const state = await toggleTab(extensionPage, tabId);
  await reloaded;
  await page.waitForFunction(() => document.readyState === "complete");
  return state;
}

test("JavaScriptをhostname単位で斬り、解除できる", { timeout: 60_000 }, async () => {
  const { server, port } = await startFixtureServer();
  const browser = await puppeteer.launch({
    headless: true,
    pipe: true,
    enableExtensions: [extensionPath],
  });

  try {
    const workerTarget = await browser.waitForTarget(
      (target) => target.type() === "service_worker" && target.url().endsWith("src/background.js"),
    );
    const worker = await workerTarget.worker();
    if (!worker) throw new Error("extension service worker not found");
    const extensionId = new URL(workerTarget.url()).hostname;
    const extensionPage = await browser.newPage();
    await extensionPage.goto(`chrome-extension://${extensionId}/src/options/index.html`);
    assert.equal(await extensionPage.$eval("h1", (element) => element.textContent), "JS斬り");
    await extensionPage.waitForFunction(() => document.querySelector("#rule-count")?.textContent === "2");

    const primaryPage = await browser.newPage();
    const primaryUrl = `http://localhost:${port}/`;
    await primaryPage.goto(primaryUrl, { waitUntil: "load" });
    const primaryTabId = await worker.evaluate(async (url) => {
      const [tab] = await chrome.tabs.query({ url });
      if (tab.id === undefined) throw new Error("fixture tab not found");
      return tab.id;
    }, primaryUrl);
    assert.equal(await primaryPage.evaluate(() => document.body.dataset.javascript), "executed");

    assert.equal(await toggleAndWaitForReload(extensionPage, primaryTabId, primaryPage), "cut");
    assert.equal(await primaryPage.evaluate(() => document.body.dataset.javascript), "blocked");

    const otherHostPage = await browser.newPage();
    await otherHostPage.goto(`http://127.0.0.1:${port}/`, { waitUntil: "load" });
    assert.equal(await otherHostPage.evaluate(() => document.body.dataset.javascript), "executed");

    assert.equal(await toggleAndWaitForReload(extensionPage, primaryTabId, primaryPage), "normal");
    assert.equal(await primaryPage.evaluate(() => document.body.dataset.javascript), "executed");
  } finally {
    await browser.close();
    server.close();
    await once(server, "close");
  }
});
