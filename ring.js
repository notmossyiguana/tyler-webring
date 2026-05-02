// webring script
// made from webstring by juneish - modified by mossy
(function () {
  'use strict';

  var webring = {
    sites: [
      "mossyscorner.neocities.org",
      "jugproductions.neocities.org",
      "decahedron.eu",
      "oddfuturegirl.hotglue.me/home",
      "dazaisfunpalace.nekoweb.org",
      "mewsdiary.nekoweb.org",
      "mishcoded.lol",
      "ntraitor.neocities.org",
      "chubs.tubsandchubs.com",
      "sunnishinez.neocities.org",
      "sweetcherries.neocities.org",
      "kuradoberi.nyc",
      "klilo.neocities.org",
      "lyer-online.neocities.org",
      "heck.nekoweb.org",
      "6208why.neocities.org",
      "astrokid425.neocities.org",
      "lopster.neocities.org"
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
        + '  <a href="https://mossyscorner.neocities.org/webring" target="_top"><img src="https://mossyscorner.neocities.org/widget/button.svg" alt="webring button"></a>'
        + '  <div style="font-size: 0.75em; text-align: center">(this site is not part of the Tyler, The Creator webring quite yet)</div>'
        + '</div>'
    }
  };

  // helpers
  function stripProtocolAndWww(s) {
    return (s || '')
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .toLowerCase()
      .trim();
  }

  // parse a site entry into { host, path } where path may be '' or '/home' or '?home' or '/?home'
  function parseSiteEntry(site) {
    var s = stripProtocolAndWww(site || '');
    if (!s) return { host: '', path: '' };

    var firstSlash = s.indexOf('/');
    var firstQ = s.indexOf('?');

    if (firstSlash === -1 && firstQ === -1) {
      return { host: s, path: '' };
    }

    if ((firstQ !== -1 && firstSlash === -1) || (firstQ !== -1 && firstQ < firstSlash)) {
      var hostPart = s.slice(0, firstQ);
      var pathPart = s.slice(firstQ);
      return { host: hostPart, path: pathPart };
    }

    var hostPart = s.slice(0, firstSlash);
    var pathPart = s.slice(firstSlash);
    return { host: hostPart, path: pathPart };
  }


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

    if (parsed.host !== currentHost) {
      if (currentHref.indexOf(parsed.host) === -1) return false;
    }

    if (!parsed.path) return true;

    var path = parsed.path;

    if (path.indexOf('/?') === 0) {
      var q = path.slice(2);
      if (currentSearch.indexOf(q) !== -1) return true;
      if (currentHref.indexOf('?' + q) !== -1) return true;
      return false;
    }

    if (path.indexOf('?') === 0) {
      var q2 = path.slice(1);
      if (currentSearch.indexOf(q2) !== -1) return true;
      if (currentHref.indexOf('?' + q2) !== -1) return true;
      return false;
    }

    if (currentPathname === path) return true;
    if (currentPathname === path.replace(/\/$/, '')) return true;
    if (currentPathname.indexOf(path) === 0) return true;

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
      console.error('webring: matching error for site', webring.sites[i], e);
    }
  }

  // --- nav helper URLs ---
  // Exposes webring.nav for members who want to build their own custom widget.
  // webring.nav.prev, .next, .random are redirect URLs that handle navigation
  // server-side via the ?via= param. Only set when the current site is a member.
  // Non-members get null so they can't abuse the redirect pages.
  var BASE = 'https://mossyscorner.neocities.org/webring';

  if (webring.idx !== -1) {
    var n = webring.sites.length;
    var prevParsed = parseSiteEntry(webring.sites[(webring.idx - 1 + n) % n]);
    var nextParsed = parseSiteEntry(webring.sites[(webring.idx + 1) % n]);

    // Build a clean "host+path" identifier for the via param — just the
    // registered entry, no https://, so redirect pages can match it exactly.
    var viaSelf = stripProtocolAndWww(webring.sites[webring.idx]);

    webring.nav = {
      prev:   BASE + '/prev?via=' + encodeURIComponent(viaSelf),
      next:   BASE + '/next?via=' + encodeURIComponent(viaSelf),
      // also expose the direct URLs in case someone wants them
      prevURL:   'https://' + prevParsed.host + (prevParsed.path || ''),
      nextURL:   'https://' + nextParsed.host + (nextParsed.path || ''),
    };
    console.debug('webring: nav URLs available at webring.nav', webring.nav);
  } else {
    webring.nav = null;
    console.debug('webring: not a member site, webring.nav is null');
  }

  // expose on window so custom widgets can read it
  window.webring = webring;
  // --- end nav helper ---


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
          try { parent.removeChild(currentScript); } catch (e) { }
          console.debug('webring: injected after script (parent found).');
        } else if (document.body) {
          (document.body || document.documentElement).appendChild(frag);
          try { currentScript.remove(); } catch (e) { }
          console.debug('webring: injected to body (script had no parent).');
        } else {
          (document.documentElement || document.body).appendChild(frag);
          try { currentScript.remove(); } catch (e) { }
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
    console.debug('webring: current site not found in list — showing error widget.',
      'host=' + currentHost, 'href=' + currentHref, 'pathname=' + currentPathname, 'search=' + currentSearch);
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

    var prevParsedW = parseSiteEntry(webring.sites[prevIndex]);
    var nextParsedW = parseSiteEntry(webring.sites[nextIndex]);

    var prevURL = 'https://' + prevParsedW.host + (prevParsedW.path || '');
    var nextURL = 'https://' + nextParsedW.host + (nextParsedW.path || '');

    html = html.split('PREV').join(prevURL).split('NEXT').join(nextURL);

    console.debug('webring: injecting widget for index', webring.idx, 'prev:', prevURL, 'next:', nextURL);
    doInject(html);
  }
})();
