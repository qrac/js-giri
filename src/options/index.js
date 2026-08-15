import { getCutHostnames, removeCutHostname } from "../javascript.js";

const list = /** @type {HTMLUListElement | null} */ (document.querySelector("#site-list"));
const emptyMessage = /** @type {HTMLParagraphElement | null} */ (
  document.querySelector("#empty-message")
);
const ruleCount = /** @type {HTMLElement | null} */ (document.querySelector("#rule-count"));

if (!(list instanceof HTMLUListElement)) throw new Error("site-list is missing");
if (!(emptyMessage instanceof HTMLParagraphElement)) throw new Error("empty-message is missing");
if (!(ruleCount instanceof HTMLElement)) throw new Error("rule-count is missing");

const siteList = /** @type {HTMLUListElement} */ (list);
const noSitesMessage = /** @type {HTMLParagraphElement} */ (emptyMessage);
const ruleCountOutput = /** @type {HTMLElement} */ (ruleCount);

/** @param {string[]} hostnames */
function renderSites(hostnames) {
  siteList.replaceChildren();
  noSitesMessage.hidden = hostnames.length > 0;

  for (const hostname of hostnames) {
    const item = document.createElement("li");
    const label = document.createElement("span");
    const button = document.createElement("button");

    label.textContent = hostname;
    button.type = "button";
    button.textContent = "解除";
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        await removeCutHostname(hostname);
        renderSites(await getCutHostnames());
      } catch (error) {
        console.error(error);
        button.disabled = false;
      }
    });

    item.append(label, button);
    siteList.append(item);
  }
}

async function initialize() {
  const loadRules = async () => {
    const response = await fetch(chrome.runtime.getURL("src/rules/block-rules.json"));
    return response.json();
  };
  const [hostnames, rules] = await Promise.all([
    getCutHostnames(),
    loadRules(),
  ]);

  renderSites(hostnames);
  ruleCountOutput.textContent = Array.isArray(rules) ? String(rules.length) : "0";
}

void (async () => {
  try {
    await initialize();
  } catch (error) {
    console.error(error);
  }
})();
