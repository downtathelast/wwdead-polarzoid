// ==UserScript==
// @name         WWDead Polarzoid Snapshot
// @namespace    polarzoid
// @version      1.4
// @description  WWDead snapshot system using (Chrome/Tampermonkey Specific)
// @match        *://wwdead.com/*
// @grant        GM_xmlhttpRequest
// @connect      wwdead-snapshot.downtothelast.workers.dev
// ==/UserScript==

(function () {
  "use strict";

  const WORKER_URL = "https://wwdead-snapshot.downtothelast.workers.dev/";

  // -------------------------
  // BUTTON (stable position restored)
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
  // SNAPSHOT BUILDER (safe clone)
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
  // UPLOAD (CSP BYPASS FIXED VIA GM)
  // -------------------------
  function upload(html) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "POST",
        url: WORKER_URL,
        headers: {
          "Content-Type": "application/json"
        },
        data: JSON.stringify({ html }),

        onload: (res) => {
          try {
            const data = JSON.parse(res.responseText);

            if (!data.url) {
              reject(new Error("No URL returned"));
              return;
            }

            resolve(data);
          } catch (e) {
            reject(new Error("Bad response from Worker"));
          }
        },

        onerror: (err) => {
          reject(new Error("Network error (GM)"));
        }
      });
    });
  }

  // -------------------------
  // CLICK
  // -------------------------
  btn.addEventListener("click", async () => {
    try {
      btn.innerText = "Saving...";

      const html = buildSnapshotHTML();
      const res = await upload(html);

      await navigator.clipboard.writeText(res.url);

      btn.innerText = "Copied!";
      setTimeout(() => (btn.innerText = "📸 Snapshot"), 2000);

      alert("📸 Snapshot Created\n\n" + res.url);

    } catch (err) {
      console.error("[Polarzoid]", err);
      alert("Snapshot failed: " + err.message);
      btn.innerText = "📸 Snapshot";
    }
  });

})();
