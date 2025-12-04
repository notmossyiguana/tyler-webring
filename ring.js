// webring widget script — made from webstring by juneish - modified by mossy
let webring = {
  sites: [
    "mossyscorner.neocities.org",
    "jugproductions.neocities.org",
    "decahedron.neocities.org",
    "oddfuturegirl.hotglue.me/?home",
    "dazaisfunpalace.nekoweb.org",
    "mewsdiary.nekoweb.org"
  ],
  widgets: {
    default: '\
      <div id="tyler-ring" style="display: flex; align-items: center; gap: 3.278%; max-width: 244px; image-rendering: smooth">\
        <a href="PREV" target="_top" style="width: 12.295%"><img width="100%" src="https://mossyscorner.neocities.org/widget/right.svg" alt="previous site"></a>\
        <a href="https://mossyscorner.neocities.org/webring" target="_top" style="width: 68.852%"><img width="100%" src="https://mossyscorner.neocities.org/widget/button.svg" alt="tyler the creator webring"></a>\
        <a href="NEXT" target="_top" style="width: 12.295%"><img width="100%" src="https://mossyscorner.neocities.org/widget/left.svg" alt="next site"></a>\
      </div>',
    error: '\
      <div>\
        <a href="https://mossyscorner.neocities.org/webring" target="_top"><img src="https://mossyscorner.neocities.org/widget/button.png" alt="webring button"></a>\
        <div style="font-size: 0.75em; text-align: center">(this site is not part of the Tyler, The Creator webring quite yet)</div>\
      </div>'
  }
};

// helper: find script element (document.currentScript fallback)
const currentScript = document.currentScript || (function () {
  const s = document.getElementsByTagName('script');
  return s[s.length - 1] || null;
})();

// helper: normalize hosts (strip protocol, www, path, lower-case)
function normalizeHost(h) {
  return (h || "")
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split('/')[0]
    .toLowerCase();
}

const currentHost = normalizeHost(location.hostname);
webring.idx = webring.sites.findIndex(function (site) {
  return normalizeHost(site) === currentHost;
});

// safe injection routine: inserts HTML after the script, removes the script
function replaceScriptWithHtml(html) {
  if (!currentScript) {
    // fallback: append to body if no script element found
    try {
      const cont = document.createElement('div');
      cont.innerHTML = html;
      (document.body || document.documentElement).appendChild(cont);
    } catch (e) {
      // last-resort: log error to console
      console.error('webring: cannot inject widget, no script element and append failed', e);
    }
    return;
  }

  const parent = currentScript.parentNode;
  if (!parent) {
    // if parentNode is null, try appending to body
    try {
      const frag = document.createRange().createContextualFragment(html);
      (document.body || document.documentElement).appendChild(frag);
      currentScript.remove();
    } catch (e) {
      console.error('webring: injection failed (no parentNode)', e);
    }
    return;
  }

  try {
    const frag = document.createRange().createContextualFragment(html);
    parent.insertBefore(frag, currentScript.nextSibling);
    parent.removeChild(currentScript);
  } catch (e) {
    console.error('webring: injection failed', e);
  }
}

if (webring.idx === -1) {
  replaceScriptWithHtml(webring.widgets.error);
} else {
  const n = webring.sites.length;
  const prevIndex = (webring.idx - 1 + n) % n;
  const nextIndex = (webring.idx + 1) % n;

  let widgetKey = "default";
  if (currentScript && currentScript.dataset && currentScript.dataset.widget) {
    widgetKey = currentScript.dataset.widget;
  }

  let html = webring.widgets[widgetKey] || webring.widgets.default;
  html = html.replace(/PREV/g, "https://" + normalizeHost(webring.sites[prevIndex]));
  html = html.replace(/NEXT/g, "https://" + normalizeHost(webring.sites[nextIndex]));

  replaceScriptWithHtml(html);
}