// webring widget script — fixes matching for /home (and still tolerates ?home)
// made from webstring by juneish - modified by mossy
(function () {
  'use strict';

  var webring = {
    sites: [
      "mossyscorner.neocities.org",
      "jugproductions.neocities.org",
      "decahedron.neocities.org",
      "oddfuturegirl.hotglue.me/home",
      "dazaisfunpalace.nekoweb.org",
      "mewsdiary.nekoweb.org",
      "mishcoded.nekoweb.org" 
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
  function stripProtocolAndWww(s) {
    return (s || '')
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .toLowerCase();
  }

  // parse a site entry into { host, path } where path may be '' or '/home' or '?home'
  function parseSiteEntry(site) {
    var s = stripProtocolAndWww(site).trim();
    var idx = s.indexOf('/');
    if (idx === -1) {
      return { host: s, path: '' };
    } else {
      return { host: s.slice(0, idx), path: s.slice(idx) }; // path includes leading '/'
    }
  }

  // fallback for document.currentScript
  var currentScript = document.currentScript || (function () {
    var s = document.getElementsByTagName('script');
    return s[s.length - 1] || null;
  })();

  var currentHost = stripProtocolAndWww(location.hostname || location.host || '');
  var currentHref = (location.href || '').toLowerCase();
  var currentPathname = (location.pathname || '').toLowerCase();
  var currentSearch = (location.search || '').toLowerCase();

  // matching: host must match, and if site entry has a path (like /home or ?home) check it
  function siteMatches(siteEntry) {
    if (!siteEntry) return false;
    var parsed = parseSiteEntry(siteEntry);
    if (!parsed.host) return false;

    // first: host equality
    if (parsed.host !== currentHost) {
      // sometimes previews/proxies include the site host in the full href; fallback to that check
      if (currentHref.indexOf(parsed.host) === -1) return false;
    }

    // if entry has no path, host match is enough
    if (!parsed.path) return true;

    // path may be something like '/home' or '/some/path' or '/?home' (rare)
    var path = parsed.path; // begins with '/'
    // if path starts with '/?' or just '?', treat as search query
    if (path.indexOf('/?') === 0) {
      var q = path.slice(2); // after '/?'
      if (currentSearch.indexOf(q) !== -1) return true;
      if (currentHref.indexOf('?' + q) !== -1) return true;
      return false;
    }
    if (path.indexOf('?') === 0) { // '?home' form
      var q2 = path.slice(1);
      if (currentSearch.indexOf(q2) !== -1) return true;
      return false;
    }

    // normal path matching: accept exact pathname or pathname that starts with the path (handles trailing slashes)
    if (currentPathname === path) return true;
    if (currentPathname === path.replace(/\/$/, '')) return true;
    if (currentPathname.indexOf(path) === 0) return true;

    // fallback: full href contains host+path
    if (currentHref.indexOf(parsed.host + path) !== -1) return true;

    return false;
  }

  // find index
  webring.idx = -1;
  for (var i = 0; i < webring.sites.length; i++) {
    try {
      if (siteMatches(webring.sites[i])) {
        webring.idx = i;
        break;
      }
    } catch (e) {
      // ignore and continue
    }
  }

  // safe injection: if body isn't ready, wait for DOMContentLoaded
  function doInject(html) {
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
          (document.body || document.documentElement).appendChild(frag);
          try { currentScript.remove(); } catch (e) { /* ignore */ }
          console.debug('webring: injected to body (script had no parent).');
        } else {
          (document.documentElement || document.body).appendChild(frag);
          try { currentScript.remove(); } catch (e) { /* ignore */ }
          console.debug('webring: injected to documentElement as ultimate fallback.');
        }
      } catch (err) {
        console.error('webring: injection error', err);
      }
    }

    if (document.readyState === 'loading') {
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
    console.debug('webring: current site not found in list — showing error widget. (host=' + currentHost + ', href=' + currentHref + ', pathname=' + currentPathname + ', search=' + currentSearch + ')');
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
    var prevURL = 'https://' + stripProtocolAndWww(webring.sites[prevIndex]).split('/')[0];
    var nextURL = 'https://' + stripProtocolAndWww(webring.sites[nextIndex]).split('/')[0];
    html = html.split('PREV').join(prevURL).split('NEXT').join(nextURL);

    console.debug('webring: injecting widget for index', webring.idx, 'prev:', prevURL, 'next:', nextURL);
    doInject(html);
  }
})();