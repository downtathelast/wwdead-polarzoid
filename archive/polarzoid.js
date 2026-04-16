// ==UserScript==
// @name         WWDead Polarzoid (Ugly Stable)
// @namespace    wwdead.polarzoid
// @version      1.0
// @match        https://wwdead.com/classic*
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

(function () {
  'use strict';

  // MUST match your worker exactly
  const WORKER_URL = "https://wwdead-snapshot.downtothelast.workers.dev";

  function waitForLogout(cb) {
    const el = Array.from(document.querySelectorAll("a"))
      .find(a => a.textContent.includes("Log out"));

    if (!el) return setTimeout(() => waitForLogout(cb), 500);
    cb(el);
  }

  function buildSnapshotHTML() {
    const clone = document.documentElement.cloneNode(true);

    const stamp = new Date().toLocaleString();

    const banner = `
<div style="
background:#111;
color:#0f0;
padding:6px;
font-family:monospace;
font-size:12px;
border-bottom:1px solid #333;
">
WWDead Snapshot — ${stamp}
</div>
`;

    const body = clone.querySelector("body");
    if (body) {
      body.insertAdjacentHTML("afterbegin", banner);
    }

    return "<!DOCTYPE html>\n" + clone.outerHTML;
  }

  function upload(html) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "POST",
        url: WORKER_URL,
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({ html }),

        onload: (res) => {
          console.log("RAW:", res.status, res.responseText);

          if (res.status !== 200) {
            reject(new Error("Worker HTTP " + res.status));
            return;
          }

          try {
            const data = JSON.parse(res.responseText);

            if (!data || !data.url) {
              reject(new Error("Missing URL"));
              return;
            }

            resolve(data);
          } catch (e) {
            reject(new Error("Bad JSON from worker"));
          }
        },

        onerror: reject
      });
    });
  }

  function addButton(logout) {
    if (document.getElementById("wwsnap-btn")) return;

    const btn = document.createElement("a");
    btn.id = "wwsnap-btn";
    btn.href = "#";
    btn.className = "y";
    btn.textContent = "Snapshot";
    btn.style.marginLeft = "10px";

    btn.onclick = async (e) => {
      e.preventDefault();

      try {
        btn.textContent = "Saving...";

        const html = buildSnapshotHTML();
        const res = await upload(html);

        await navigator.clipboard.writeText(res.url);

        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = "Snapshot"), 2000);

        alert("📸 Snapshot Created\n\n" + res.url);

      } catch (err) {
        console.error("Snapshot error:", err);
        alert("Snapshot failed — check console");
        btn.textContent = "Snapshot";
      }
    };

    logout.parentNode.insertBefore(btn, logout.nextSibling);
  }

  waitForLogout(addButton);

})();
