// For SamToki.github.io/GPS-PFD
// Released under GNU GPL v3 open source license.
// © 2025 SAM TOKI STUDIO

// Initialization
	// Declare variables
	"use strict";
		// Unsaved
		const CacheName = "GPS-PFD_v0.17";

// Listeners
	// Service worker (https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/#step-5---add-a-service-worker)
	self.addEventListener("install", Event => {
		Event.waitUntil((async() => {
			const CacheContent = await caches.open(CacheName);
			CacheContent.addAll([
				"index.html",
				"images/Icon_Small.png",
				"../styles/common.css",
				"../styles/common_Dark.css",
				"../styles/common_Genshin.css",
				"../styles/common_HighContrast.css",
				"styles/style.css",
				"styles/style_Dark.css",
				"styles/style_Genshin.css",
				"styles/style_HighContrast.css",
				// "styles/style_PFD???.css",
				"../scripts/common.js",
				"../scripts/common_UserDataRepairer.js",
				"scripts/script.js",
				"manifests/manifest.json",
				"images/Icon.png",
				"images/Icon_Large.png",
				"images/Icon_Maskable.png",
				"images/Preview.jpg",
				"../cursors/BTRAhoge.cur",
				"../cursors/Genshin.cur",
				"../cursors/GenshinFurina.cur",
				"../cursors/GenshinNahida.cur",
				"../images/Background.jpg",
				"../audio/Beep.mp3",
				"audio/Boeing_10.mp3",
				"audio/Boeing_20.mp3",
				"audio/Boeing_30.mp3",
				"audio/Boeing_40.mp3",
				"audio/Boeing_50.mp3",
				"audio/Boeing_100.mp3",
				"audio/Boeing_200.mp3",
				"audio/Boeing_300.mp3",
				"audio/Boeing_400.mp3",
				"audio/Boeing_500.mp3",
				"audio/Boeing_1000.mp3",
				"audio/Boeing_2500.mp3",
				"audio/Boeing_AirspeedLow.mp3",
				"audio/Boeing_ApproachingMinimums.mp3",
				"audio/Boeing_Minimums.mp3",
				"audio/Boeing_Overspeed.mp3",
				"audio/Common_BankAngle.mp3",
				"audio/Common_DontSink.mp3",
				"audio/Common_GlideSlope.mp3",
				"audio/Common_PullUp.mp3",
				"audio/Common_SinkRate.mp3",
				"docs/GPS-PFD 说明文档.pdf"
			]);
		})());
	});
	self.addEventListener("fetch", Event => {
		Event.respondWith((async() => {
			const CacheContent = await caches.open(CacheName);
			const CachedResponse = await CacheContent.match(Event.request);
			if(CachedResponse) {
				return CachedResponse;
			} else {
				const FetchResponse = await fetch(Event.request);
				CacheContent.put(Event.request, FetchResponse.clone());
				return FetchResponse;
			}
		})());
	});
