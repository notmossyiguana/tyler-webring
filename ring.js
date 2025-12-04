// webring widget script — made from webstring by juneish - modified by mossy

(function () {
  'use strict';

  var webring = {
    sites: [
      "mossyscorner.neocities.org",
      "jugproductions.neocities.org",
      "decahedron.neocities.org",
      "oddfuturegirl.hotglue.me/?home",
      "dazaisfunpalace.nekoweb.org",
      "mewsdiary.nekoweb.org"
    ],
    widgets: {
      default: ''
        + '<div id="tyler-ring" style="display: flex; align-items: center; gap: 3.278%; max-width: 244px; image-rendering: smooth">'
        + '  <a href="PREV" target="_top" style="width: 12.295%"><img width="100%" src="https://mossyscorner.neocities.org/widget/right.svg" alt="previous site"></a>'
        + '  <a href="https://mossyscorner.neocities.org/webring" target="_top" style="width: 68.852%"><img width="100%" src="https://mossyscorner.neocities.org/widget/button.svg" alt="tyler the creator webring"></a>'
        + '  <a href="NEXT" target="_top" style="width: 12.295%"><img width="100%" src="https://mossyscorner.neocities.org/widget/left.svg" alt="next site"></a>'
        + '</div>',
      error: ''
        + '<div>'
        + '  <a href="https://mossyscorner.neocities.org/webring" target="_top"><img src="https://mossyscorner.neocities.org/widget/button.png" alt="webring button"></a>'
        + '  <div style="font-size: 0.75em; text-align: center">(this site is not part of the Tyler, The Creator webring quite yet)</div>'
        + '</div>'
    }
  };

  // helpers
  function normalizeHost(h) {
    return (h || '')
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0]
      .toLowerCase();
  }

  // fallback for document.currentScript
  var currentScript = document.currentScript || (function () {
    var s = document.getElementsByTagName('script');
    return s[s.length - 1] || null;
  })();

  var currentHost = normalizeHost(location.hostname || location.host || '');
  var currentHref = (location.href || '').toLowerCase();

  // robust match: match by hostname OR if the site string appears anywhere in the full URL
  function siteMatches(site) {
    if (!site) return false;
    var siteNorm = normalizeHost(site);
    if (siteNorm === currentHost) return true;
    // also check if the normalized site appears in the full href (handles /?home, previews, proxies, path variants)
    if (currentHref.indexOf(siteNorm) !== -1) return true;
    return false;
  }

  // find index
  webring.idx = -1;
  for (var i = 0; i < webring.sites.length; i++) {
    if (siteMatches(webring.sites[i])) {
      webring.idx = i;
      break;
    }
  }

  // safe injection: if body isn't ready, wait for DOMContentLoaded
  function doInject(html) {
    // injection routine that will run when DOM is ready
    function injectNow() {
      try {
        if (!currentScript) {
          var cont = document.createElement('div');
          cont.innerHTML = html;
          (document.body || document.documentElement).appendChild(cont);
          console.debug('webring: injected (no script element).');
          return;
        }

        var parent = currentScript.parentNode;
        var frag = document.createRange().createContextualFragment(html);

        if (parent) {
          parent.insertBefore(frag, currentScript.nextSibling);
          parent.removeChild(currentScript);
          console.debug('webring: injected after script (parent found).');
        } else if (document.body) {
          // script without parent (rare): append to body
          (document.body || document.documentElement).appendChild(frag);
          try { currentScript.remove(); } catch (e) { /* ignore */ }
          console.debug('webring: injected to body (script had no parent).');
        } else {
          // ultimate fallback
          (document.documentElement || document.body).appendChild(frag);
          try { currentScript.remove(); } catch (e) { /* ignore */ }
          console.debug('webring: injected to documentElement as ultimate fallback.');
        }
      } catch (err) {
        console.error('webring: injection error', err);
      }
    }

    if (document.readyState === 'loading') {
      // DOM not ready — wait
      document.addEventListener('DOMContentLoaded', function onReady() {
        document.removeEventListener('DOMContentLoaded', onReady);
        injectNow();
      });
    } else {
      injectNow();
    }
  }

  // selection & replacement
  if (webring.idx === -1) {
    console.debug('webring: current site not found in list — showing error widget.');
    doInject(webring.widgets.error);
  } else {
    var n = webring.sites.length;
    var prevIndex = (webring.idx - 1 + n) % n;
    var nextIndex = (webring.idx + 1) % n;

    var widgetKey = 'default';
    try {
      if (currentScript && currentScript.dataset && currentScript.dataset.widget) {
        widgetKey = currentScript.dataset.widget;
      }
    } catch (e) {
      widgetKey = 'default';
    }

    var html = webring.widgets[widgetKey] || webring.widgets.default;
    var prevURL = 'https://' + normalizeHost(webring.sites[prevIndex]);
    var nextURL = 'https://' + normalizeHost(webring.sites[nextIndex]);
    html = html.split('PREV').join(prevURL).split('NEXT').join(nextURL);

    console.debug('webring: injecting widget for index', webring.idx, 'prev:', prevURL, 'next:', nextURL);
    doInject(html);
  }
})();