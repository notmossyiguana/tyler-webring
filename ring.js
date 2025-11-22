{
  let webring = {
    sites: [
      "mossyscorner.neocities.org",
      "jugproductions.neocities.org",
      "decahedron.neocities.org",
      "oddfuturegirl.hotglue.me/?home",
      "dazaisfunpalace.nekoweb.org"
    ],
    widgets: {
      default: `
        <div id="tyler-ring" style="display: flex; align-items: center; gap: 3.278%; max-width: 244px; image-rendering: smooth">
          <a href="PREV" target="_top" style="width: 12.295%"><img width="100%" src="https://mossyscorner.neocities.org/widget/right.svg" alt="previous site"></a>
          <a href="https://mossyscorner.neocities.org/webring" target="_top" style="width: 68.852%"><img width="100%" src="https://mossyscorner.neocities.org/widget/button.svg" alt="tyler the creator webring"></a>
          <a href="NEXT" target="_top" style="width: 12.295%"><img width="100%" src="https://mossyscorner.neocities.org/widget/left.svg" alt="next site"></a>
        </div>
      `,
      error: `<div>
          <a href="https://mossyscorner.neocities.org/webring" target="_top"><img src="https://mossyscorner.neocities.org/widget/button.png"></a>
          <div style="font-size: 0.75em; text-align: center">(this site is not part of the Tyler, The Creator webring quite yet)</div>
        </div>`
    },
  };

  // safer currentScript fallback (handles module / edge cases)
  const currentScript = document.currentScript || (function(){
    const s = document.getElementsByTagName('script');
    return s[s.length - 1];
  })();

  // normalize host helper
  const normalizeHost = h => (h || "").replace(/^https?:\/\//i, "").replace(/^www\./i, "").split('/')[0].toLowerCase();

  const currentHost = normalizeHost(location.hostname);

  webring.idx = webring.sites.findIndex(site => normalizeHost(site) === currentHost);

  // build widget HTML safely
  if (!currentScript) {
    console.error("webring: no script element available to inject widget into.");
  }

  if (webring.idx === -1) {
    // not in ring: replace script with error widget
    if (currentScript) currentScript.outerHTML = webring.widgets.error;
  } else {
    const n = webring.sites.length;
    const prevIndex = (webring.idx - 1 + n) % n;
    const nextIndex = (webring.idx + 1) % n;

    const widgetKey = (currentScript && currentScript.dataset && currentScript.dataset.widget) || "default";
    const html = (webring.widgets[widgetKey] || webring.widgets.default)
      .replace(/PREV/g, "https://" + normalizeHost(webring.sites[prevIndex]))
      .replace(/NEXT/g, "https://" + normalizeHost(webring.sites[nextIndex]));

    if (currentScript) currentScript.outerHTML = html;
  }
}
