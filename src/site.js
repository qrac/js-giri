/**
 * URLからJS切りの対象となる正規化済みhostnameを返す。
 * @param {string | undefined} value
 * @returns {string | null}
 */
export function getEligibleHostname(value) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.hostname === "chromewebstore.google.com") return null;
    if (url.hostname === "chrome.google.com" && url.pathname.startsWith("/webstore")) return null;
    return url.hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * サブドメインへ広げない、hostname単位のContent Settings Patternを作る。
 * @param {string} hostname
 * @returns {string}
 */
export function createContentSettingPattern(hostname) {
  return `*://${hostname}/*`;
}
