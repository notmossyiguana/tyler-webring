// webstring (ring.js) by june @ juneish.neocities.org
// partial formatting written by transing the internet @ transring.neocities.org


{
	let webring = {
		// sites in the ring
		// remove the https://
		sites: [
			"mossyscorner.neocities.org",
			"jugproductions.neocities.org",
			"decahedron.neocities.org"
		],
		// widget html
		// PREV and NEXT are replaced with neighbors' urls
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
			</div>`,
		},
	};
	// code
webring.idx = webring.sites.findIndex(site =>
  location.hostname.replace(/^www\./, "").toLowerCase() === site.toLowerCase()
);
	document.currentScript.outerHTML = webring.idx === -1 ? webring.widgets.error :
		(webring.widgets[document.currentScript.dataset.widget] ?? webring.widgets.default)
		.replace("PREV", "https://" + webring.sites.at(webring.idx - 1))
		.replace("NEXT", "https://" + webring.sites[(webring.idx + 1) % webring.sites.length]);
}
