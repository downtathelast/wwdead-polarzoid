// ==UserScript==
// @name         WWDead Polarzoid Snapshot
// @namespace    https://github.com/downtathelast
// @version      1.3
// @description  Snapshot system for WWDead.com (Greasemonkey Specific)
// @match        *://wwdead.com/*
// @license      MIT
// @grant        none
// @downloadURL https://update.greasyfork.org/scripts/574085/WWDead%20Polarzoid%20Snapshot%20%28Universal%20Stable%29.user.js
// @updateURL https://update.greasyfork.org/scripts/574085/WWDead%20Polarzoid%20Snapshot%20%28Universal%20Stable%29.meta.js
// ==/UserScript==

(function () {
  "use strict";

  const WORKER_URL = "https://wwdead-snapshot.downtothelast.workers.dev/";

  // -------------------------
  // BUTTON (RESTORED STABLE UI)
  // -------------------------
  const btn = document.createElement("button");

  Object.assign(btn.style, {
    position: "fixed",
    top: "12px",
    right: "12px",
    zIndex: 999999,
    padding: "8px 10px",
    background: "#111",
    color: "#fff",
    border: "1px solid #444",
    cursor: "pointer",
    fontSize: "12px"
  });

  btn.innerText = "📸 Snapshot";
  document.body.appendChild(btn);

  // -------------------------
  // SAFE SNAPSHOT BUILDER
  // -------------------------
  function buildSnapshotHTML() {
    const clone = document.documentElement.cloneNode(true);

    clone.querySelectorAll("script, iframe, noscript").forEach(el => el.remove());

    const stamp = new Date().toLocaleString();

    const banner = `
<div style="background:#111;color:#0f0;padding:6px;font-family:monospace;font-size:12px;border-bottom:1px solid #333;">
WWDead Snapshot — ${stamp}
</div>
`;

    const body = clone.querySelector("body");
    if (body) body.insertAdjacentHTML("afterbegin", banner);

    return "<!DOCTYPE html>\n" + clone.outerHTML;
  }

  // -------------------------
  // CROSS-BROWSER SAFE UPLOAD (NO GM, NO CSP TRICKS)
  // -------------------------
  async function upload(html) {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ html })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error("HTTP " + res.status + " - " + text);
    }

    return await res.json();
  }

  // -------------------------
  // CLICK HANDLER
  // -------------------------
  btn.addEventListener("click", async () => {
    try {
      btn.innerText = "Saving...";

      const html = buildSnapshotHTML();
      const data = await upload(html);

      if (!data.url) throw new Error("No URL returned");

      await navigator.clipboard.writeText(data.url);

      btn.innerText = "Copied!";
      setTimeout(() => (btn.innerText = "📸 Snapshot"), 2000);

      alert("📸 Snapshot Created\n\n" + data.url);

    } catch (err) {
      console.error("[Polarzoid]", err);
      alert("Snapshot failed: " + err.message);
      btn.innerText = "📸 Snapshot";
    }
  });

})();
