import assert from "node:assert/strict";
import test from "node:test";
import { createContentSettingPattern, getEligibleHostname } from "../../src/site.js";

test("eligible web URLからhostnameだけを取り出す", () => {
  assert.equal(getEligibleHostname("https://WWW.Example.com/article?id=1"), "www.example.com");
  assert.equal(getEligibleHostname("http://localhost:8080/fixture"), "localhost");
});

test("Chrome内部ページとChrome Web Storeを対象外にする", () => {
  assert.equal(getEligibleHostname("chrome://extensions"), null);
  assert.equal(getEligibleHostname("chrome-extension://abc/options.html"), null);
  assert.equal(getEligibleHostname("https://chromewebstore.google.com/detail/example/abc"), null);
  assert.equal(getEligibleHostname("https://chrome.google.com/webstore/detail/example/abc"), null);
  assert.equal(getEligibleHostname("https://chrome.google.com/unrelated"), "chrome.google.com");
  assert.equal(getEligibleHostname(undefined), null);
  assert.equal(getEligibleHostname("not a url"), null);
});

test("patternはexact hostnameに限定し、schemeだけを共通化する", () => {
  assert.equal(createContentSettingPattern("www.example.com"), "*://www.example.com/*");
  assert.notEqual(createContentSettingPattern("www.example.com"), "*://*.example.com/*");
});
