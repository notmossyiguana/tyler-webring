// webring.js — minimal dynamic widget (place this in src and publish to raw URL)
(async function() {
  const rawJsonUrl = 'https://raw.githubusercontent.com/notmossyiguana/tyler-webring/main/data/sites.json';
  let data;
  try {
    const r = await fetch(rawJsonUrl, {cache: 'no-cache'});
    data = await r.json();
  } catch (e) {
    // fallback small default widget
    document.currentScript.outerHTML = '<div>webring unavailable</div>';
    return;
  }

  const sites = data.sites || [];
  const idx = sites.findIndex(s => location.href.startsWith(s));
  const prev = sites.at(idx - 1) ?? sites[sites.length - 1];
  const next = sites[(idx + 1) % sites.length];

  const widgetHTML = `<div id="webring-${encodeURIComponent(data.name)}" style="display:flex; gap:8px; align-items:center">
    <a href="${prev}">prev</a>
    <a href="${data.home}" title="webring home">webring</a>
    <a href="${next}">next</a>
  </div>`;

  document.currentScript.outerHTML = widgetHTML;
})();

