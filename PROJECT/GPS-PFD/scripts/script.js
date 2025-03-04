// For SamToki.github.io/GPS-PFD
// Released under GNU GPL v3 open source license.
// © 2025 SAM TOKI STUDIO

// Initialization
	// Declare variables
	"use strict";
		// Unsaved
		const CurrentVersion = 0.20,
		GeolocationAPIOptions = {
			enableHighAccuracy: true
		};
		var PFD0 = {
			RawData: {
				GPS: {
					Position: {
						Lat: null, Lon: null, Accuracy: null
					},
					Speed: null,
					Altitude: {
						Altitude: null, Accuracy: null
					},
					Heading: null,
					Timestamp: 0
				},
				Accel: {
					Accel: {
						Absolute: {
							X: null, Y: null, Z: null
						},
						AbsoluteWithGravity: {
							X: null, Y: null, Z: null
						},
						Relative: {
							Forward: 0, Right: 0, Upward: 0
						},
						RelativeWithGravity: {
							Forward: 0, Right: 0, Upward: 0
						},
						Aligned: {
							Forward: 0, Right: 0, Upward: 0
						}
					},
					Attitude: {
						Original: {
							Pitch: 0, Roll: 0
						},
						Aligned: {
							Pitch: 0, Roll: 0
						}
					},
					Speed: {
						Vector: {
							Forward: 0, Right: 0, Upward: 0
						},
						Speed: 0
					},
					Altitude: 0,
					Interval: null,
					Timestamp: 0
				},
				Manual: {
					Attitude: {
						Pitch: 0, Roll: 0
					},
					Speed: 0, Altitude: 0
				}
			},
			Status: {
				GPS: {
					IsPositionAvailable: false, IsPositionAccurate: false,
					IsSpeedAvailable: false, IsAltitudeAvailable: false, IsAltitudeAccurate: false, IsHeadingAvailable: false
				},
				IsAccelAvailable: false,
				IsDecisionAltitudeActive: false
			},
			Stats: {
				ClockTime: 0, PreviousClockTime: Date.now(),
				Attitude: {
					Pitch: 0, Pitch2: 0, Roll: 0
				},
				Speed: {
					SampleCount: 0,
					Speed: 0, Vertical: 0, Pitch: 0,
					GS: 0, GSDisplay: 0,
					AvgGS: 0, AvgGSDisplay: 0,
					TAS: 0, TASDisplay: 0,
					Wind: {
						Heading: 0, RelativeHeading: 0 // Wind "heading" is the opposite of wind direction.
					},
					IAS: 0, TapeDisplay: 0, PreviousTapeDisplay: 0, BalloonDisplay: [0, 0, 0, 0],
					Trend: 0, TrendDisplay: 0,
					AvgIAS: 0, AvgIASDisplay: 0,
					MachNumber: 0
				},
				Altitude: {
					Altitude: 0, TapeDisplay: 0, PreviousTapeDisplay: 0, BalloonDisplay: [0, 0, 0, 0, 0],
					Trend: 0, TrendDisplay: 0,
					RadioDisplay: 0,
					DecisionTimestamp: 0
				},
				Heading: {
					Heading: 0, Display: 0
				},
				DME: {
					Lat: 0, Lon: 0,
					Distance: 0, ETA: 0
				},
				FlightModeTimestamp: 0
			},
			Alert: {
				Active: {
					AttitudeWarning: "", SpeedWarning: "", AltitudeCallout: "", AltitudeWarning: ""
				},
				NowPlaying: {
					AttitudeWarning: "", SpeedWarning: "", AltitudeCallout: "", AltitudeWarning: ""
				}
			}
		};
		Automation.ClockPFD = null;
		Automation.ClockAvgSpeeds = null;

		// Saved
		var Subsystem = {
			Display: {
				PFDStyle: "Default",
				FlipPFDVertically: false,
				KeepScreenOn: false
			},
			Audio: {
				Scheme: "Boeing",
				AttitudeAlertVolume: 0, SpeedAlertVolume: 0, AltitudeAlertVolume: 0
			},
			I18n: {
				AlwaysUseEnglishTerminologyOnPFD: false,
				SpeedUnit: "Knot", DistanceUnit: "NauticalMile", AltitudeUnit: "Feet", VerticalSpeedUnit: "FeetPerMin", TemperatureUnit: "Celsius", PressureUnit: "Hectopascal"
			}
		},
		PFD = {
			Attitude: {
				IsEnabled: true,
				Mode: "Accel",
				Offset: {
					Pitch: 0, Roll: 0
				}
			},
			Speed: {
				Mode: "GPS",
				IASAlgorithm: "SimpleAlgorithm",
				AirportTemperature: {
					Departure: 288.15, Arrival: 288.15
				},
				RelativeHumidity: {
					Departure: 50, Arrival: 50
				},
				QNH: {
					Departure: 1013.25, Arrival: 1013.25
				},
				Wind: {
					Direction: 0, Speed: 0
				},
				SpeedLimit: {
					Min: 0, MaxOnFlapsUp: 277.5, MaxOnFlapsFull: 277.5
				}
			},
			Altitude: {
				Mode: "GPS",
				AirportElevation: {
					Departure: 0, Arrival: 0
				},
				DecisionHeight: 76.2
			},
			DME: {
				IsEnabled: false,
				AirportCoordinates: {
					Departure: {
						Lat: 0, Lon: 0
					},
					Arrival: {
						Lat: 0, Lon: 0
					}
				},
				ETACalcMethod: "UseAvgGS"
			},
			FlightMode: {
				FlightMode: "DepartureGround",
				AutoSwitchFlightModeAndSwapAirportData: true
			},
			Flaps: 0
		};

	// Load
	window.onload = Load();
	function Load() {
		// User data
		if(localStorage.System != undefined) {
			System = JSON.parse(localStorage.getItem("System"));
		}
		switch(System.I18n.Language) {
			case "Auto":
				// navigator.language ...
				break;
			case "en-US":
				/* ChangeCursorOverall("wait");
				window.location.replace("index_en-US.html"); */
				ShowDialog("System_LanguageUnsupported",
					"Caution",
					"<span lang=\"en-US\">Sorry, this webpage currently does not support English (US).</span>",
					"", "", "", "<span lang=\"en-US\">OK</span>");
				break;
			case "ja-JP":
				ShowDialog("System_LanguageUnsupported",
					"Caution",
					"<span lang=\"ja-JP\">すみません。このページは日本語にまだサポートしていません。</span>",
					"", "", "", "<span lang=\"ja-JP\">OK</span>");
				break;
			case "zh-CN":
				break;
			case "zh-TW":
				ShowDialog("System_LanguageUnsupported",
					"Caution",
					"<span lang=\"zh-TW\">抱歉，本網頁暫不支援繁體中文。</span>",
					"", "", "", "<span lang=\"zh-TW\">確定</span>");
				break;
			default:
				AlertSystemError("The value of System.I18n.Language \"" + System.I18n.Language + "\" in function Load is invalid.");
				break;
		}
		if(System.Version.GPSPFD != undefined) {
			if(Math.trunc(CurrentVersion) - Math.trunc(System.Version.GPSPFD) >= 1) {
				ShowDialog("System_MajorUpdateDetected",
					"Info",
					"检测到大版本更新。若您继续使用旧版本的用户数据，则有可能发生兼容性问题。敬请留意。",
					"", "", "", "确定");
				System.Version.GPSPFD = CurrentVersion;
			}
		} else {
			System.Version.GPSPFD = CurrentVersion;
		}
		if(localStorage.GPSPFD_Subsystem != undefined) {
			Subsystem = JSON.parse(localStorage.getItem("GPSPFD_Subsystem"));
		}
		if(localStorage.GPSPFD_PFD != undefined) {
			PFD = JSON.parse(localStorage.getItem("GPSPFD_PFD"));
		}

		// Refresh
		HighlightActiveSectionInNav();
		RefreshSystem();
		RefreshSubsystem();
		RefreshPFD();
		ClockAvgSpeeds();

		// PWA
		if(navigator.serviceWorker != undefined) {
			navigator.serviceWorker.register("script_ServiceWorker.js").then(function(ServiceWorkerRegistration) {
				// Detect update (https://stackoverflow.com/a/41896649)
				ServiceWorkerRegistration.addEventListener("updatefound", function() {
					const ServiceWorkerInstallation = ServiceWorkerRegistration.installing;
					ServiceWorkerInstallation.addEventListener("statechange", function() {
						if(ServiceWorkerInstallation.state == "installed" && navigator.serviceWorker.controller != null) {
							Show("Label_HelpPWANewVersionReady");
							ShowDialog("System_PWANewVersionReady",
								"Info",
								"新版本已就绪，将在下次启动时生效。",
								"", "", "", "确定");
						}
					});
				});

				// Read service worker status (https://github.com/GoogleChrome/samples/blob/gh-pages/service-worker/registration-events/index.html)
				switch(true) {
					case ServiceWorkerRegistration.installing != null:
						ChangeText("Label_SettingsPWAServiceWorkerRegistration", "等待生效");
						break;
					case ServiceWorkerRegistration.waiting != null:
						ChangeText("Label_SettingsPWAServiceWorkerRegistration", "等待更新");
						Show("Label_HelpPWANewVersionReady");
						ShowDialog("System_PWANewVersionReady",
							"Info",
							"新版本已就绪，将在下次启动时生效。",
							"", "", "", "确定");
						break;
					case ServiceWorkerRegistration.active != null:
						ChangeText("Label_SettingsPWAServiceWorkerRegistration", "已生效");
						break;
					default:
						break;
				}
				if(navigator.serviceWorker.controller != null) {
					ChangeText("Label_SettingsPWAServiceWorkerController", "已生效");
				} else {
					ChangeText("Label_SettingsPWAServiceWorkerController", "未生效");
				}
			});
		} else {
			ChangeText("Label_SettingsPWAServiceWorkerRegistration", "不可用");
			ChangeText("Label_SettingsPWAServiceWorkerController", "不可用");
		}

		// Ready
		setTimeout(HideToast, 0);
		if(System.DontShowAgain.includes("GPSPFD_System_Welcome") == false) {
			ShowDialog("System_Welcome",
				"Info",
				"欢迎使用 GPS-PFD。若您是首次使用，请先阅读「使用前须知」。",
				"不再提示", "", "了解更多", "关闭");
		}
	}

// Refresh
	// Webpage
	function RefreshWebpage() {
		ShowDialog("System_RefreshingWebpage",
			"Info",
			"正在刷新网页...",
			"", "", "", "确定");
		ChangeCursorOverall("wait");
		window.location.reload();
	}

	// System
	function RefreshSystem() {
		// Topbar
		if(IsMobileLayout() == false) {
			HideHorizontally("Button_Nav");
			ChangeInert("DropctrlGroup_Nav", false);
		} else {
			Show("Button_Nav");
			ChangeInert("DropctrlGroup_Nav", true);
		}

		// Fullscreen
		if(IsFullscreen() == false) {
			Show("Topbar");
			ChangeText("Button_PFDToggleFullscreen", "全屏");
		} else {
			Hide("Topbar");
			ChangeText("Button_PFDToggleFullscreen", "退出全屏");
		}

		// Settings
			// Display
			if(window.matchMedia("(prefers-contrast: more)").matches == false) {
				ChangeDisabled("Combobox_SettingsTheme", false);
			} else {
				System.Display.Theme = "HighContrast";
				ChangeDisabled("Combobox_SettingsTheme", true);
			}
			ChangeValue("Combobox_SettingsTheme", System.Display.Theme);
			switch(System.Display.Theme) {
				case "Auto":
					ChangeLink("ThemeVariant_Common", "../styles/common_Dark.css");
					ChangeMediaCondition("ThemeVariant_Common", "(prefers-color-scheme: dark)");
					ChangeLink("ThemeVariant_Style", "styles/style_Dark.css");
					ChangeMediaCondition("ThemeVariant_Style", "(prefers-color-scheme: dark)");
					break;
				case "Light":
					ChangeLink("ThemeVariant_Common", "");
					ChangeMediaCondition("ThemeVariant_Common", "");
					ChangeLink("ThemeVariant_Style", "");
					ChangeMediaCondition("ThemeVariant_Style", "");
					break;
				case "Dark":
					ChangeLink("ThemeVariant_Common", "../styles/common_Dark.css");
					ChangeMediaCondition("ThemeVariant_Common", "");
					ChangeLink("ThemeVariant_Style", "styles/style_Dark.css");
					ChangeMediaCondition("ThemeVariant_Style", "");
					break;
				case "Genshin":
					ChangeLink("ThemeVariant_Common", "../styles/common_Genshin.css");
					ChangeMediaCondition("ThemeVariant_Common", "");
					ChangeLink("ThemeVariant_Style", "styles/style_Genshin.css");
					ChangeMediaCondition("ThemeVariant_Style", "");
					break;
				case "HighContrast":
					ChangeLink("ThemeVariant_Common", "../styles/common_HighContrast.css");
					ChangeMediaCondition("ThemeVariant_Common", "");
					ChangeLink("ThemeVariant_Style", "styles/style_HighContrast.css");
					ChangeMediaCondition("ThemeVariant_Style", "");
					break;
				default:
					AlertSystemError("The value of System.Display.Theme \"" + System.Display.Theme + "\" in function RefreshSystem is invalid.");
					break;
			}
			ChangeValue("Combobox_SettingsCursor", System.Display.Cursor);
			switch(System.Display.Cursor) {
				case "Default":
					ChangeCursorOverall("");
					break;
				case "BTRAhoge":
				case "Genshin":
				case "GenshinFurina":
				case "GenshinNahida":
					ChangeCursorOverall("url(../cursors/" + System.Display.Cursor + ".cur), auto");
					break;
				default:
					AlertSystemError("The value of System.Display.Cursor \"" + System.Display.Cursor + "\" in function RefreshSystem is invalid.");
					break;
			}
			ChangeChecked("Checkbox_SettingsBlurBgImage", System.Display.BlurBgImage);
			if(System.Display.BlurBgImage == true) {
				AddClass("BgImage", "Blur");
			} else {
				RemoveClass("BgImage", "Blur");
			}
			ChangeValue("Combobox_SettingsHotkeyIndicators", System.Display.HotkeyIndicators);
			switch(System.Display.HotkeyIndicators) {
				case "Disabled":
					FadeHotkeyIndicators();
					break;
				case "ShowOnWrongKeyPress":
				case "ShowOnAnyKeyPress":
					break;
				case "AlwaysShow":
					ShowHotkeyIndicators();
					break;
				default:
					AlertSystemError("The value of System.Display.HotkeyIndicators \"" + System.Display.HotkeyIndicators + "\" in function RefreshSystem is invalid.");
					break;
			}
			if(window.matchMedia("(prefers-reduced-motion: reduce)").matches == false) {
				ChangeDisabled("Combobox_SettingsAnim", false);
			} else {
				System.Display.Anim = 0;
				ChangeDisabled("Combobox_SettingsAnim", true);
			}
			ChangeValue("Combobox_SettingsAnim", System.Display.Anim);
			ChangeAnimOverall(System.Display.Anim);

			// Audio
			ChangeChecked("Checkbox_SettingsPlayAudio", System.Audio.PlayAudio);
			if(System.Audio.PlayAudio == true) {
				Show("Ctrl_SettingsAudioScheme");
				Show("Ctrl_SettingsAttitudeAlertVolume");
				Show("Ctrl_SettingsSpeedAlertVolume");
				Show("Ctrl_SettingsAltitudeAlertVolume");
				ChangeValue("Combobox_SettingsAudioScheme", Subsystem.Audio.Scheme);
				ChangeValue("Slider_SettingsAttitudeAlertVolume", Subsystem.Audio.AttitudeAlertVolume);
				if(Subsystem.Audio.AttitudeAlertVolume > 0) {
					ChangeText("Label_SettingsAttitudeAlertVolume", Subsystem.Audio.AttitudeAlertVolume + "%");
				} else {
					ChangeText("Label_SettingsAttitudeAlertVolume", "禁用");
				}
				ChangeVolume("Audio_AttitudeAlert", Subsystem.Audio.AttitudeAlertVolume);
				ChangeValue("Slider_SettingsSpeedAlertVolume", Subsystem.Audio.SpeedAlertVolume);
				if(Subsystem.Audio.SpeedAlertVolume > 0) {
					ChangeText("Label_SettingsSpeedAlertVolume", Subsystem.Audio.SpeedAlertVolume + "%");
				} else {
					ChangeText("Label_SettingsSpeedAlertVolume", "禁用");
				}
				ChangeVolume("Audio_SpeedAlert", Subsystem.Audio.SpeedAlertVolume);
				ChangeValue("Slider_SettingsAltitudeAlertVolume", Subsystem.Audio.AltitudeAlertVolume);
				if(Subsystem.Audio.AltitudeAlertVolume > 0) {
					ChangeText("Label_SettingsAltitudeAlertVolume", Subsystem.Audio.AltitudeAlertVolume + "%");
				} else {
					ChangeText("Label_SettingsAltitudeAlertVolume", "禁用");
				}
				ChangeVolume("Audio_AltitudeAlert", Subsystem.Audio.AltitudeAlertVolume);
			} else {
				StopAllAudio();
				Hide("Ctrl_SettingsAudioScheme");
				Hide("Ctrl_SettingsAttitudeAlertVolume");
				Hide("Ctrl_SettingsSpeedAlertVolume");
				Hide("Ctrl_SettingsAltitudeAlertVolume");
			}

			// PWA
			if(window.matchMedia("(display-mode: standalone)").matches == true) {
				ChangeText("Label_SettingsPWAStandaloneDisplay", "是");
			} else {
				ChangeText("Label_SettingsPWAStandaloneDisplay", "否");
			}

			// Dev
			ChangeChecked("Checkbox_SettingsTryToOptimizePerformance", System.Dev.TryToOptimizePerformance);
			if(System.Dev.TryToOptimizePerformance == true) {
				AddClass("Html", "TryToOptimizePerformance");
			} else {
				RemoveClass("Html", "TryToOptimizePerformance");
			}
			ChangeChecked("Checkbox_SettingsShowDebugOutlines", System.Dev.ShowDebugOutlines);
			if(System.Dev.ShowDebugOutlines == true) {
				AddClass("Html", "ShowDebugOutlines");
			} else {
				RemoveClass("Html", "ShowDebugOutlines");
			}
			ChangeChecked("Checkbox_SettingsUseJapaneseGlyph", System.Dev.UseJapaneseGlyph);
			if(System.Dev.UseJapaneseGlyph == true) {
				ChangeLanguage("Html", "ja-JP");
			} else {
				ChangeLanguage("Html", "zh-CN");
			}
			ChangeValue("Textbox_SettingsFont", System.Dev.Font);
			ChangeFont("Html", System.Dev.Font);

			// User data
			ChangeValue("Textbox_SettingsUserDataImport", "");

		// Save user data
		localStorage.setItem("System", JSON.stringify(System));
	}
	function RefreshSubsystem() {
		// Settings
			// Display
			ChangeValue("Combobox_SettingsPFDStyle", Subsystem.Display.PFDStyle);
			HideHorizontally("Ctnr_PFDDefaultPanel");
			HideHorizontally("Ctnr_PFDHUDPanel");
			HideHorizontally("Ctnr_PFDBocchi737Panel");
			HideHorizontally("Ctnr_PFDAnalogGaugesPanel");
			HideHorizontally("Ctnr_PFDAutomobileSpeedometerPanel");
			RemoveClass("PFD", "PFDStyleIsDefault");
			RemoveClass("PFD", "PFDStyleIsHUD");
			RemoveClass("PFD", "PFDStyleIsBocchi737");
			RemoveClass("PFD", "PFDStyleIsAnalogGauges");
			RemoveClass("PFD", "PFDStyleIsAutomobileSpeedometer");
			switch(Subsystem.Display.PFDStyle) {
				case "Default":
					Show("Ctnr_PFDDefaultPanel");
					AddClass("PFD", "PFDStyleIsDefault");
					break;
				case "HUD":
				case "Bocchi737":
				case "AnalogGauges":
				case "AutomobileSpeedometer":
					AlertSystemError("A PFD style which is still under construction was selected.");
					break;
				default:
					AlertSystemError("The value of Subsystem.Display.PFDStyle \"" + Subsystem.Display.PFDStyle + "\" in function RefreshSubsystem is invalid.");
					break;
			}
			ChangeChecked("Checkbox_PFDOptionsFlipPFDVertically", Subsystem.Display.FlipPFDVertically);
			ChangeChecked("Checkbox_SettingsFlipPFDVertically", Subsystem.Display.FlipPFDVertically);
			ChangeChecked("Checkbox_PFDOptionsKeepScreenOn", Subsystem.Display.KeepScreenOn);
			ChangeChecked("Checkbox_SettingsKeepScreenOn", Subsystem.Display.KeepScreenOn);
			if(Subsystem.Display.KeepScreenOn == true) {
				RequestScreenWakeLock();
			} else {
				ReleaseScreenWakeLock();
			}

			// Audio
			if(System.Audio.PlayAudio == true) {
				ChangeValue("Combobox_SettingsAudioScheme", Subsystem.Audio.Scheme);
				ChangeValue("Slider_SettingsAttitudeAlertVolume", Subsystem.Audio.AttitudeAlertVolume);
				if(Subsystem.Audio.AttitudeAlertVolume > 0) {
					ChangeText("Label_SettingsAttitudeAlertVolume", Subsystem.Audio.AttitudeAlertVolume + "%");
				} else {
					ChangeText("Label_SettingsAttitudeAlertVolume", "禁用");
				}
				ChangeVolume("Audio_AttitudeAlert", Subsystem.Audio.AttitudeAlertVolume);
				ChangeValue("Slider_SettingsSpeedAlertVolume", Subsystem.Audio.SpeedAlertVolume);
				if(Subsystem.Audio.SpeedAlertVolume > 0) {
					ChangeText("Label_SettingsSpeedAlertVolume", Subsystem.Audio.SpeedAlertVolume + "%");
				} else {
					ChangeText("Label_SettingsSpeedAlertVolume", "禁用");
				}
				ChangeVolume("Audio_SpeedAlert", Subsystem.Audio.SpeedAlertVolume);
				ChangeValue("Slider_SettingsAltitudeAlertVolume", Subsystem.Audio.AltitudeAlertVolume);
				if(Subsystem.Audio.AltitudeAlertVolume > 0) {
					ChangeText("Label_SettingsAltitudeAlertVolume", Subsystem.Audio.AltitudeAlertVolume + "%");
				} else {
					ChangeText("Label_SettingsAltitudeAlertVolume", "禁用");
				}
				ChangeVolume("Audio_AltitudeAlert", Subsystem.Audio.AltitudeAlertVolume);
			}

			// I18n
			ChangeChecked("Checkbox_SettingsAlwaysUseEnglishTerminologyOnPFD", Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD);
			if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
				switch(Subsystem.Display.PFDStyle) {
					case "Default":
						ChangeText("Label_PFDDefaultPanelGPSStatusTitle", "GPS 状态");
						ChangeText("Label_PFDDefaultPanelAccelStatusTitle", "加速计状态");
						ChangeText("Label_PFDDefaultPanelGSTitle", "地速");
						ChangeText("Label_PFDDefaultPanelAvgGSTitle", "平均地速");
						ChangeText("Label_PFDDefaultPanelTASTitle", "真空速");
						ChangeText("Label_PFDDefaultPanelWindTitle", "风");
						ChangeText("Label_PFDDefaultPanelFlapsTitle", "襟翼");
						ChangeText("Label_PFDDefaultPanelAttitudeModeTitle", "姿态模式");
						ChangeText("Label_PFDDefaultPanelSpeedModeTitle", "速度模式");
						ChangeText("Label_PFDDefaultPanelAltitudeModeTitle", "高度模式");
						ChangeText("Label_PFDDefaultPanelDMETitle", "测距仪");
						ChangeText("Label_PFDDefaultPanelDecisionAltitudeTitle", "决断高度");
						break;
					case "HUD":
					case "Bocchi737":
					case "AnalogGauges":
					case "AutomobileSpeedometer":
						AlertSystemError("A PFD style which is still under construction was selected.");
						break;
					default:
						AlertSystemError("The value of Subsystem.Display.PFDStyle \"" + Subsystem.Display.PFDStyle + "\" in function RefreshSubsystem is invalid.");
						break;
				}
			} else {
				switch(Subsystem.Display.PFDStyle) {
					case "Default":
						ChangeText("Label_PFDDefaultPanelGPSStatusTitle", "GPS STS");
						ChangeText("Label_PFDDefaultPanelAccelStatusTitle", "ACCEL STS");
						ChangeText("Label_PFDDefaultPanelGSTitle", "GS");
						ChangeText("Label_PFDDefaultPanelAvgGSTitle", "AVG GS");
						ChangeText("Label_PFDDefaultPanelTASTitle", "TAS");
						ChangeText("Label_PFDDefaultPanelWindTitle", "WIND");
						ChangeText("Label_PFDDefaultPanelFlapsTitle", "FLAPS");
						ChangeText("Label_PFDDefaultPanelAttitudeModeTitle", "ATT MODE");
						ChangeText("Label_PFDDefaultPanelSpeedModeTitle", "SPD MODE");
						ChangeText("Label_PFDDefaultPanelAltitudeModeTitle", "ALT MODE");
						ChangeText("Label_PFDDefaultPanelDMETitle", "DME");
						ChangeText("Label_PFDDefaultPanelDecisionAltitudeTitle", "DA");
						break;
					case "HUD":
					case "Bocchi737":
					case "AnalogGauges":
					case "AutomobileSpeedometer":
						AlertSystemError("A PFD style which is still under construction was selected.");
						break;
					default:
						AlertSystemError("The value of Subsystem.Display.PFDStyle \"" + Subsystem.Display.PFDStyle + "\" in function RefreshSubsystem is invalid.");
						break;
				}
			}
			switch(true) {
				case Subsystem.I18n.SpeedUnit == "KilometerPerHour" && Subsystem.I18n.DistanceUnit == "Kilometer" &&
				Subsystem.I18n.AltitudeUnit == "Meter" && Subsystem.I18n.VerticalSpeedUnit == "MeterPerSec" &&
				Subsystem.I18n.PressureUnit == "Hectopascal" && Subsystem.I18n.TemperatureUnit == "Celsius":
					ChangeValue("Combobox_SettingsMeasurementUnitsPreset", "AllMetric");
					break;
				case Subsystem.I18n.SpeedUnit == "Knot" && Subsystem.I18n.DistanceUnit == "NauticalMile" &&
				Subsystem.I18n.AltitudeUnit == "Feet" && Subsystem.I18n.VerticalSpeedUnit == "FeetPerMin" &&
				Subsystem.I18n.PressureUnit == "Hectopascal" && Subsystem.I18n.TemperatureUnit == "Celsius":
					ChangeValue("Combobox_SettingsMeasurementUnitsPreset", "CivilAviation");
					break;
				default:
					ChangeValue("Combobox_SettingsMeasurementUnitsPreset", "");
					break;
			}
			ChangeValue("Combobox_SettingsSpeedUnit", Subsystem.I18n.SpeedUnit);
			switch(Subsystem.I18n.SpeedUnit) {
				case "KilometerPerHour":
					ChangeMax("Textbox_SettingsWindSpeed", "999");
					ChangePlaceholder("Textbox_SettingsWindSpeed", "0~999");
					ChangeTooltip("Textbox_SettingsWindSpeed", "0~999");
					ChangeMax("Textbox_SettingsSpeedLimitMin", "981");
					ChangePlaceholder("Textbox_SettingsSpeedLimitMin", "0~981");
					ChangeTooltip("Textbox_SettingsSpeedLimitMin", "0~981");
					ChangeMin("Textbox_SettingsSpeedLimitMaxOnFlapsUp", "15");
					ChangeMax("Textbox_SettingsSpeedLimitMaxOnFlapsUp", "999");
					ChangePlaceholder("Textbox_SettingsSpeedLimitMaxOnFlapsUp", "18~999");
					ChangeTooltip("Textbox_SettingsSpeedLimitMaxOnFlapsUp", "18~999");
					ChangeMin("Textbox_SettingsSpeedLimitMaxOnFlapsFull", "15");
					ChangeMax("Textbox_SettingsSpeedLimitMaxOnFlapsFull", "999");
					ChangePlaceholder("Textbox_SettingsSpeedLimitMaxOnFlapsFull", "18~999");
					ChangeTooltip("Textbox_SettingsSpeedLimitMaxOnFlapsFull", "18~999");
					break;
				case "MilePerHour":
					ChangeMax("Textbox_SettingsWindSpeed", "621");
					ChangePlaceholder("Textbox_SettingsWindSpeed", "0~621");
					ChangeTooltip("Textbox_SettingsWindSpeed", "0~621");
					ChangeMax("Textbox_SettingsSpeedLimitMin", "610");
					ChangePlaceholder("Textbox_SettingsSpeedLimitMin", "0~610");
					ChangeTooltip("Textbox_SettingsSpeedLimitMin", "0~610");
					ChangeMin("Textbox_SettingsSpeedLimitMaxOnFlapsUp", "10");
					ChangeMax("Textbox_SettingsSpeedLimitMaxOnFlapsUp", "621");
					ChangePlaceholder("Textbox_SettingsSpeedLimitMaxOnFlapsUp", "11~621");
					ChangeTooltip("Textbox_SettingsSpeedLimitMaxOnFlapsUp", "11~621");
					ChangeMin("Textbox_SettingsSpeedLimitMaxOnFlapsFull", "10");
					ChangeMax("Textbox_SettingsSpeedLimitMaxOnFlapsFull", "621");
					ChangePlaceholder("Textbox_SettingsSpeedLimitMaxOnFlapsFull", "11~621");
					ChangeTooltip("Textbox_SettingsSpeedLimitMaxOnFlapsFull", "11~621");
					break;
				case "Knot":
					ChangeMax("Textbox_SettingsWindSpeed", "539");
					ChangePlaceholder("Textbox_SettingsWindSpeed", "0~539");
					ChangeTooltip("Textbox_SettingsWindSpeed", "0~539");
					ChangeMax("Textbox_SettingsSpeedLimitMin", "530");
					ChangePlaceholder("Textbox_SettingsSpeedLimitMin", "0~530");
					ChangeTooltip("Textbox_SettingsSpeedLimitMin", "0~530");
					ChangeMin("Textbox_SettingsSpeedLimitMaxOnFlapsUp", "10");
					ChangeMax("Textbox_SettingsSpeedLimitMaxOnFlapsUp", "539");
					ChangePlaceholder("Textbox_SettingsSpeedLimitMaxOnFlapsUp", "10~539");
					ChangeTooltip("Textbox_SettingsSpeedLimitMaxOnFlapsUp", "10~539");
					ChangeMin("Textbox_SettingsSpeedLimitMaxOnFlapsFull", "10");
					ChangeMax("Textbox_SettingsSpeedLimitMaxOnFlapsFull", "539");
					ChangePlaceholder("Textbox_SettingsSpeedLimitMaxOnFlapsFull", "10~539");
					ChangeTooltip("Textbox_SettingsSpeedLimitMaxOnFlapsFull", "10~539");
					break;
				default:
					AlertSystemError("The value of Subsystem.I18n.SpeedUnit \"" + Subsystem.I18n.SpeedUnit + "\" in function RefreshSubsystem is invalid.");
					break;
			}
			ChangeText("Label_SettingsWindSpeedUnit", Translate(Subsystem.I18n.SpeedUnit));
			ChangeText("Label_SettingsSpeedLimitMinUnit", Translate(Subsystem.I18n.SpeedUnit));
			ChangeText("Label_SettingsSpeedLimitOnFlapsUpUnit", Translate(Subsystem.I18n.SpeedUnit));
			ChangeText("Label_SettingsSpeedLimitOnFlapsFullUnit", Translate(Subsystem.I18n.SpeedUnit));
			ChangeValue("Combobox_SettingsDistanceUnit", Subsystem.I18n.DistanceUnit);
			ChangeValue("Combobox_SettingsAltitudeUnit", Subsystem.I18n.AltitudeUnit);
			switch(Subsystem.I18n.AltitudeUnit) {
				case "Meter":
					ChangeMin("Textbox_SettingsAirportElevationDeparture", "-500");
					ChangeMax("Textbox_SettingsAirportElevationDeparture", "5000");
					ChangeStep("Textbox_SettingsAirportElevationDeparture", "5");
					ChangePlaceholder("Textbox_SettingsAirportElevationDeparture", "-500~5000");
					ChangeTooltip("Textbox_SettingsAirportElevationDeparture", "-500~5000");
					ChangeMin("Textbox_SettingsAirportElevationArrival", "-500");
					ChangeMax("Textbox_SettingsAirportElevationArrival", "5000");
					ChangeStep("Textbox_SettingsAirportElevationArrival", "5");
					ChangePlaceholder("Textbox_SettingsAirportElevationArrival", "-500~5000");
					ChangeTooltip("Textbox_SettingsAirportElevationArrival", "-500~5000");
					ChangeMin("Textbox_SettingsDecisionHeight", "15");
					ChangeMax("Textbox_SettingsDecisionHeight", "750");
					ChangeStep("Textbox_SettingsDecisionHeight", "5");
					ChangePlaceholder("Textbox_SettingsDecisionHeight", "15~750");
					ChangeTooltip("Textbox_SettingsDecisionHeight", "15~750");
					break;
				case "Feet":
				case "FeetButShowMeterBeside":
					ChangeMin("Textbox_SettingsAirportElevationDeparture", "-1640");
					ChangeMax("Textbox_SettingsAirportElevationDeparture", "16404");
					ChangeStep("Textbox_SettingsAirportElevationDeparture", "10");
					ChangePlaceholder("Textbox_SettingsAirportElevationDeparture", "-1640~16404");
					ChangeTooltip("Textbox_SettingsAirportElevationDeparture", "-1640~16404");
					ChangeMin("Textbox_SettingsAirportElevationArrival", "-1640");
					ChangeMax("Textbox_SettingsAirportElevationArrival", "16404");
					ChangeStep("Textbox_SettingsAirportElevationArrival", "10");
					ChangePlaceholder("Textbox_SettingsAirportElevationArrival", "-1640~16404");
					ChangeTooltip("Textbox_SettingsAirportElevationArrival", "-1640~16404");
					ChangeMin("Textbox_SettingsDecisionHeight", "40");
					ChangeMax("Textbox_SettingsDecisionHeight", "2461");
					ChangeStep("Textbox_SettingsDecisionHeight", "10");
					ChangePlaceholder("Textbox_SettingsDecisionHeight", "49~2461");
					ChangeTooltip("Textbox_SettingsDecisionHeight", "49~2461");
					break;
				default:
					AlertSystemError("The value of Subsystem.I18n.AltitudeUnit \"" + Subsystem.I18n.AltitudeUnit + "\" in function RefreshSubsystem is invalid.");
					break;
			}
			ChangeText("Label_SettingsAirportElevationUnit", Translate(Subsystem.I18n.AltitudeUnit));
			ChangeText("Label_SettingsDecisionHeightUnit", Translate(Subsystem.I18n.AltitudeUnit));
			ChangeValue("Combobox_SettingsVerticalSpeedUnit", Subsystem.I18n.VerticalSpeedUnit);
			ChangeValue("Combobox_SettingsTemperatureUnit", Subsystem.I18n.TemperatureUnit);
			switch(Subsystem.I18n.TemperatureUnit) {
				case "Celsius":
					ChangeMin("Textbox_SettingsAirportTemperatureDeparture", "-50");
					ChangeMax("Textbox_SettingsAirportTemperatureDeparture", "50");
					ChangePlaceholder("Textbox_SettingsAirportTemperatureDeparture", "-50~50");
					ChangeTooltip("Textbox_SettingsAirportTemperatureDeparture", "-50~50");
					ChangeMin("Textbox_SettingsAirportTemperatureArrival", "-50");
					ChangeMax("Textbox_SettingsAirportTemperatureArrival", "50");
					ChangePlaceholder("Textbox_SettingsAirportTemperatureArrival", "-50~50");
					ChangeTooltip("Textbox_SettingsAirportTemperatureArrival", "-50~50");
					break;
				case "Fahrenheit":
					ChangeMin("Textbox_SettingsAirportTemperatureDeparture", "-58");
					ChangeMax("Textbox_SettingsAirportTemperatureDeparture", "122");
					ChangePlaceholder("Textbox_SettingsAirportTemperatureDeparture", "-58~122");
					ChangeTooltip("Textbox_SettingsAirportTemperatureDeparture", "-58~122");
					ChangeMin("Textbox_SettingsAirportTemperatureArrival", "-58");
					ChangeMax("Textbox_SettingsAirportTemperatureArrival", "122");
					ChangePlaceholder("Textbox_SettingsAirportTemperatureArrival", "-58~122");
					ChangeTooltip("Textbox_SettingsAirportTemperatureArrival", "-58~122");
					break;
				default:
					AlertSystemError("The value of Subsystem.I18n.TemperatureUnit \"" + Subsystem.I18n.TemperatureUnit + "\" in function RefreshSubsystem is invalid.");
					break;
			}
			ChangeText("Label_SettingsAirportTemperatureUnit", Translate(Subsystem.I18n.TemperatureUnit));
			ChangeValue("Combobox_SettingsPressureUnit", Subsystem.I18n.PressureUnit);
			switch(Subsystem.I18n.PressureUnit) {
				case "Hectopascal":
					ChangeMin("Textbox_SettingsQNHDeparture", "900");
					ChangeMax("Textbox_SettingsQNHDeparture", "1100");
					ChangeStep("Textbox_SettingsQNHDeparture", "1");
					ChangePlaceholder("Textbox_SettingsQNHDeparture", "900~1100");
					ChangeTooltip("Textbox_SettingsQNHDeparture", "900~1100");
					ChangeMin("Textbox_SettingsQNHArrival", "900");
					ChangeMax("Textbox_SettingsQNHArrival", "1100");
					ChangeStep("Textbox_SettingsQNHArrival", "1");
					ChangePlaceholder("Textbox_SettingsQNHArrival", "900~1100");
					ChangeTooltip("Textbox_SettingsQNHArrival", "900~1100");
					break;
				case "InchOfMercury":
					ChangeMin("Textbox_SettingsQNHDeparture", "26.58");
					ChangeMax("Textbox_SettingsQNHDeparture", "32.48");
					ChangeStep("Textbox_SettingsQNHDeparture", "0.01");
					ChangePlaceholder("Textbox_SettingsQNHDeparture", "26.58~32.48");
					ChangeTooltip("Textbox_SettingsQNHDeparture", "26.58~32.48");
					ChangeMin("Textbox_SettingsQNHArrival", "26.58");
					ChangeMax("Textbox_SettingsQNHArrival", "32.48");
					ChangeStep("Textbox_SettingsQNHArrival", "0.01");
					ChangePlaceholder("Textbox_SettingsQNHArrival", "26.58~32.48");
					ChangeTooltip("Textbox_SettingsQNHArrival", "26.58~32.48");
					break;
				default:
					AlertSystemError("The value of Subsystem.I18n.PressureUnit \"" + Subsystem.I18n.PressureUnit + "\" in function RefreshSubsystem is invalid.");
					break;
			}
			ChangeText("Label_SettingsQNHUnit", Translate(Subsystem.I18n.PressureUnit));

		// Save user data
		localStorage.setItem("GPSPFD_Subsystem", JSON.stringify(Subsystem));
	}

	// PFD
	function ClockPFD() {
		// Automation
		clearTimeout(Automation.ClockPFD);
		Automation.ClockPFD = setTimeout(ClockPFD, 20);

		// Update essentials
		PFD0.Stats.ClockTime = Date.now();

		// Call
		RefreshGPSStatus();
		RefreshAccelStatus();
		RefreshPFDData();
		RefreshScale();
		RefreshPanel();
		RefreshPFDAudio();
		RefreshTechInfo();

		// Update previous variables
		PFD0.Stats.PreviousClockTime = PFD0.Stats.ClockTime;
		PFD0.Stats.Speed.PreviousTapeDisplay = PFD0.Stats.Speed.TapeDisplay;
		PFD0.Stats.Altitude.PreviousTapeDisplay = PFD0.Stats.Altitude.TapeDisplay;
	}
		// Sub-functions
		function RefreshGPSStatus() {
			PFD0.Status.GPS = {
				IsPositionAvailable: false, IsPositionAccurate: false,
				IsSpeedAvailable: false, IsAltitudeAvailable: false, IsAltitudeAccurate: false, IsHeadingAvailable: false
			};
			if(PFD0.Stats.ClockTime - PFD0.RawData.GPS.Timestamp < 3000) {
				if(PFD0.RawData.GPS.Position.Lat != null && PFD0.RawData.GPS.Position.Lon != null) {
					PFD0.Status.GPS.IsPositionAvailable = true;
					if(PFD0.RawData.GPS.Position.Accuracy <= 10) {
						PFD0.Status.GPS.IsPositionAccurate = true;
					}
				}
				if(PFD0.RawData.GPS.Speed != null) {
					PFD0.Status.GPS.IsSpeedAvailable = true;
				}
				if(PFD0.RawData.GPS.Altitude.Altitude != null) {
					PFD0.Status.GPS.IsAltitudeAvailable = true;
					if(PFD0.RawData.GPS.Altitude.Accuracy <= 20) {
						PFD0.Status.GPS.IsAltitudeAccurate = true;
					}
				}
				if(PFD0.RawData.GPS.Heading != null) {
					PFD0.Status.GPS.IsHeadingAvailable = true;
				}
			}
		}
		function RefreshAccelStatus() {
			if(PFD0.Stats.ClockTime - PFD0.RawData.Accel.Timestamp < 1000 &&
			PFD0.RawData.Accel.Accel.Absolute.X != null && PFD0.RawData.Accel.Accel.AbsoluteWithGravity.X != null) {
				PFD0.Status.IsAccelAvailable = true;
			} else {
				PFD0.Status.IsAccelAvailable = false;
			}
		}
		function RefreshPFDData() {
			// Attitude
			if(PFD.Attitude.IsEnabled == true) {
				switch(true) {
					case PFD.Attitude.Mode == "Accel" && PFD0.Status.IsAccelAvailable == true:
						PFD0.Stats.Attitude.Pitch = PFD0.RawData.Accel.Attitude.Aligned.Pitch;
						PFD0.Stats.Attitude.Roll = PFD0.RawData.Accel.Attitude.Aligned.Roll;
						break;
					case PFD.Attitude.Mode == "Manual":
						PFD0.Stats.Attitude.Pitch = PFD0.RawData.Manual.Attitude.Pitch;
						PFD0.Stats.Attitude.Roll = PFD0.RawData.Manual.Attitude.Roll;
						break;
					default:
						break;
				}
				if(PFD0.Stats.Attitude.Pitch < -90) {
					PFD0.Stats.Attitude.Pitch = -90;
				}
				if(PFD0.Stats.Attitude.Pitch > 90) {
					PFD0.Stats.Attitude.Pitch = 90;
				}
				PFD0.Stats.Attitude.Pitch2 = PFD0.Stats.Attitude.Pitch;
				if(PFD0.Stats.Attitude.Pitch2 < -20) {
					PFD0.Stats.Attitude.Pitch2 = -20;
				}
				if(PFD0.Stats.Attitude.Pitch2 > 20) {
					PFD0.Stats.Attitude.Pitch2 = 20;
				}
				if(PFD0.Stats.Attitude.Roll < -180) {
					PFD0.Stats.Attitude.Roll += 360;
				}
				if(PFD0.Stats.Attitude.Roll > 180) {
					PFD0.Stats.Attitude.Roll -= 360;
				}
			}

			// Altitude (Updated before speed because speed data relies on altitude variation)
			switch(true) {
				case PFD.Altitude.Mode == "GPS" && PFD0.Status.GPS.IsAltitudeAvailable == true:
					PFD0.Stats.Altitude.Altitude = PFD0.RawData.GPS.Altitude.Altitude;
					break;
				case PFD.Altitude.Mode == "Accel" && PFD0.Status.IsAccelAvailable == true:
				case PFD.Altitude.Mode == "DualChannel" && (PFD0.Status.GPS.IsAltitudeAvailable == true || PFD0.Status.IsAccelAvailable == true):
					PFD0.Stats.Altitude.Altitude = PFD0.RawData.Accel.Altitude;
					break;
				case PFD.Altitude.Mode == "Manual":
					PFD0.Stats.Altitude.Altitude = PFD0.RawData.Manual.Altitude;
					break;
				default:
					break;
			}
				// Tape
				PFD0.Stats.Altitude.TapeDisplay += (PFD0.Stats.Altitude.Altitude - PFD0.Stats.Altitude.TapeDisplay) / 50 * ((PFD0.Stats.ClockTime - PFD0.Stats.PreviousClockTime) / 30); // Use "ClockTime" here for smoother trend displaying.
				if(PFD0.Stats.Altitude.TapeDisplay < -609.5) { // It should have been -609.6 meters. But -609.59999 can be converted to -2000.00001 feet, resulting in a display error on the balloon.
					PFD0.Stats.Altitude.TapeDisplay = -609.5;
				}
				if(PFD0.Stats.Altitude.TapeDisplay > 15239.9) { // It should have been 15240 meters. Reason same as above.
					PFD0.Stats.Altitude.TapeDisplay = 15239.9;
				}

				// Additional indicators
					// Altitude trend
					PFD0.Stats.Altitude.Trend = (PFD0.Stats.Altitude.TapeDisplay - PFD0.Stats.Altitude.PreviousTapeDisplay) * (6000 / Math.max(PFD0.Stats.ClockTime - PFD0.Stats.PreviousClockTime, 1)); // (1) Altitude trend shows target altitude in 6 sec. (2) If refreshed too frequently, the divisor may become zero. So "Math.max" is applied here.
					PFD0.Stats.Altitude.TrendDisplay += (PFD0.Stats.Altitude.Trend - PFD0.Stats.Altitude.TrendDisplay) / 5;
					PFD0.Stats.Speed.Vertical = PFD0.Stats.Altitude.TrendDisplay / 6;

				// Balloon
				PFD0.Stats.Altitude.BalloonDisplay[1] = Math.trunc(ConvertUnit(PFD0.Stats.Altitude.TapeDisplay, "Meter", Subsystem.I18n.AltitudeUnit) / 10000);
				PFD0.Stats.Altitude.BalloonDisplay[2] = Math.trunc(ConvertUnit(PFD0.Stats.Altitude.TapeDisplay, "Meter", Subsystem.I18n.AltitudeUnit) % 10000 / 1000);
				PFD0.Stats.Altitude.BalloonDisplay[3] = Math.trunc(ConvertUnit(PFD0.Stats.Altitude.TapeDisplay, "Meter", Subsystem.I18n.AltitudeUnit) % 1000 / 100);
				PFD0.Stats.Altitude.BalloonDisplay[4] = ConvertUnit(PFD0.Stats.Altitude.TapeDisplay, "Meter", Subsystem.I18n.AltitudeUnit) % 100;
				if(System.Display.Anim > 0) {
					if(PFD0.Stats.Altitude.BalloonDisplay[4] > 80) {PFD0.Stats.Altitude.BalloonDisplay[3] += ((PFD0.Stats.Altitude.BalloonDisplay[4] - 80) / 20);} // Imitating the cockpit PFD rolling digits.
					if(PFD0.Stats.Altitude.BalloonDisplay[4] < -80) {PFD0.Stats.Altitude.BalloonDisplay[3] += ((PFD0.Stats.Altitude.BalloonDisplay[4] + 80) / 20);}
					if(PFD0.Stats.Altitude.BalloonDisplay[3] > 9) {PFD0.Stats.Altitude.BalloonDisplay[2] += (PFD0.Stats.Altitude.BalloonDisplay[3] - 9);}
					if(PFD0.Stats.Altitude.BalloonDisplay[3] < -9) {PFD0.Stats.Altitude.BalloonDisplay[2] += (PFD0.Stats.Altitude.BalloonDisplay[3] + 9);}
					if(PFD0.Stats.Altitude.BalloonDisplay[2] > 9) {PFD0.Stats.Altitude.BalloonDisplay[1] += (PFD0.Stats.Altitude.BalloonDisplay[2] - 9);}
					if(PFD0.Stats.Altitude.BalloonDisplay[2] < -9) {PFD0.Stats.Altitude.BalloonDisplay[1] += (PFD0.Stats.Altitude.BalloonDisplay[2] + 9);}
				} else {
					PFD0.Stats.Altitude.BalloonDisplay[4] = Math.trunc(PFD0.Stats.Altitude.BalloonDisplay[4] / 20) * 20;
				}

			// Heading (Updated before speed because speed data relies on heading)
			if(PFD0.Status.GPS.IsHeadingAvailable == true) {
				PFD0.Stats.Heading.Heading = PFD0.RawData.GPS.Heading;
			}
			PFD0.Stats.Heading.Display += (PFD0.Stats.Heading.Heading - PFD0.Stats.Heading.Display) / 50;

			// Speed
			switch(true) {
				case PFD.Speed.Mode == "GPS" && PFD0.Status.GPS.IsSpeedAvailable == true:
					PFD0.Stats.Speed.Speed = PFD0.RawData.GPS.Speed;
					break;
				case PFD.Speed.Mode == "Accel" && PFD0.Status.IsAccelAvailable == true:
				case PFD.Speed.Mode == "DualChannel" && (PFD0.Status.GPS.IsSpeedAvailable == true || PFD0.Status.IsAccelAvailable == true):
					PFD0.Stats.Speed.Speed = PFD0.RawData.Accel.Speed.Speed;
					break;
				case PFD.Speed.Mode == "Manual":
					PFD0.Stats.Speed.Speed = PFD0.RawData.Manual.Speed;
					break;
				default:
					break;
			}
				// Pitch
				if(PFD0.Stats.Speed.Speed > 0) {
					let Calc = PFD0.Stats.Speed.Vertical / PFD0.Stats.Speed.Speed;
					if(Calc < -1) {
						Calc = -1;
					}
					if(Calc > 1) {
						Calc = 1;
					}
					PFD0.Stats.Speed.Pitch = Math.asin(Calc) / (Math.PI / 180);
				} else {
					PFD0.Stats.Speed.Pitch = 90;
				}

				// GS
				PFD0.Stats.Speed.GS = Math.sqrt(Math.max(Math.pow(PFD0.Stats.Speed.Speed, 2) - Math.pow(PFD0.Stats.Speed.Vertical, 2), 0));
				PFD0.Stats.Speed.GSDisplay += (PFD0.Stats.Speed.GS - PFD0.Stats.Speed.GSDisplay) / 50 * ((PFD0.Stats.ClockTime - PFD0.Stats.PreviousClockTime) / 30);

				// Avg GS
				PFD0.Stats.Speed.AvgGSDisplay += (PFD0.Stats.Speed.AvgGS - PFD0.Stats.Speed.AvgGSDisplay) / 50 * ((PFD0.Stats.ClockTime - PFD0.Stats.PreviousClockTime) / 30);

				// TAS
				if(PFD0.Status.GPS.IsHeadingAvailable == true) {
					PFD0.Stats.Speed.Wind.Heading = PFD.Speed.Wind.Direction + 180;
					if(PFD0.Stats.Speed.Wind.Heading >= 360) {
						PFD0.Stats.Speed.Wind.Heading -= 360;
					}
					PFD0.Stats.Speed.Wind.RelativeHeading = PFD0.Stats.Speed.Wind.Heading - PFD0.Stats.Heading.Display;
					PFD0.Stats.Speed.TAS = CalcTAS(PFD0.Stats.Speed.GS, PFD0.Stats.Speed.Wind.RelativeHeading, PFD.Speed.Wind.Speed, PFD0.Stats.Speed.Vertical);
				} else {
					PFD0.Stats.Speed.TAS = CalcTAS(PFD0.Stats.Speed.GS, null, null, PFD0.Stats.Speed.Vertical);
				}
				PFD0.Stats.Speed.TASDisplay += (PFD0.Stats.Speed.TAS - PFD0.Stats.Speed.TASDisplay) / 50 * ((PFD0.Stats.ClockTime - PFD0.Stats.PreviousClockTime) / 30);

				// IAS
				switch(PFD.FlightMode.FlightMode) {
					case "DepartureGround":
					case "TakeOff":
					case "EmergencyReturn":
						PFD0.Stats.Speed.IAS = CalcIAS(PFD.Speed.IASAlgorithm, PFD0.Stats.Speed.TAS, PFD0.Stats.Altitude.TapeDisplay,
							PFD.Altitude.AirportElevation.Departure, PFD.Speed.AirportTemperature.Departure, PFD.Speed.RelativeHumidity.Departure, PFD.Speed.QNH.Departure,
							PFD.Attitude.IsEnabled, Math.abs(PFD0.Stats.Attitude.Pitch - PFD0.Stats.Speed.Pitch));
						break;
					case "Cruise":
					case "Land":
					case "ArrivalGround":
						PFD0.Stats.Speed.IAS = CalcIAS(PFD.Speed.IASAlgorithm, PFD0.Stats.Speed.TAS, PFD0.Stats.Altitude.TapeDisplay,
							PFD.Altitude.AirportElevation.Arrival, PFD.Speed.AirportTemperature.Arrival, PFD.Speed.RelativeHumidity.Arrival, PFD.Speed.QNH.Arrival,
							PFD.Attitude.IsEnabled, Math.abs(PFD0.Stats.Attitude.Pitch - PFD0.Stats.Speed.Pitch));
						break;
					default:
						AlertSystemError("The value of PFD.FlightMode.FlightMode \"" + PFD.FlightMode.FlightMode + "\" in function RefreshPFDData is invalid.");
						break;
				}
					// Tape
					PFD0.Stats.Speed.TapeDisplay += (PFD0.Stats.Speed.IAS - PFD0.Stats.Speed.TapeDisplay) / 50 * ((PFD0.Stats.ClockTime - PFD0.Stats.PreviousClockTime) / 30);
					if(PFD0.Stats.Speed.TapeDisplay < 0) {
						PFD0.Stats.Speed.TapeDisplay = 0;
					}
					if(PFD0.Stats.Speed.TapeDisplay > 277.5) {
						PFD0.Stats.Speed.TapeDisplay = 277.5;
					}

					// Additional indicators
						// Speed trend
						PFD0.Stats.Speed.Trend = (PFD0.Stats.Speed.TapeDisplay - PFD0.Stats.Speed.PreviousTapeDisplay) * (10000 / Math.max(PFD0.Stats.ClockTime - PFD0.Stats.PreviousClockTime, 1)); // Speed trend shows target speed in 10 sec.
						PFD0.Stats.Speed.TrendDisplay += (PFD0.Stats.Speed.Trend - PFD0.Stats.Speed.TrendDisplay) / 5;

						// Avg IAS
						PFD0.Stats.Speed.AvgIASDisplay += (PFD0.Stats.Speed.AvgIAS - PFD0.Stats.Speed.AvgIASDisplay) / 50 * ((PFD0.Stats.ClockTime - PFD0.Stats.PreviousClockTime) / 30);

					// Balloon
					PFD0.Stats.Speed.BalloonDisplay[1] = Math.trunc(ConvertUnit(PFD0.Stats.Speed.TapeDisplay, "MeterPerSec", Subsystem.I18n.SpeedUnit) / 100);
					PFD0.Stats.Speed.BalloonDisplay[2] = Math.trunc(ConvertUnit(PFD0.Stats.Speed.TapeDisplay, "MeterPerSec", Subsystem.I18n.SpeedUnit) % 100 / 10);
					PFD0.Stats.Speed.BalloonDisplay[3] = ConvertUnit(PFD0.Stats.Speed.TapeDisplay, "MeterPerSec", Subsystem.I18n.SpeedUnit) % 10;
					if(System.Display.Anim > 0) {
						if(PFD0.Stats.Speed.BalloonDisplay[3] > 9) {PFD0.Stats.Speed.BalloonDisplay[2] += (PFD0.Stats.Speed.BalloonDisplay[3] - 9);}
						if(PFD0.Stats.Speed.BalloonDisplay[2] > 9) {PFD0.Stats.Speed.BalloonDisplay[1] += (PFD0.Stats.Speed.BalloonDisplay[2] - 9);}
					} else {
						PFD0.Stats.Speed.BalloonDisplay[3] = Math.trunc(PFD0.Stats.Speed.BalloonDisplay[3]);
					}

				// Mach number
				switch(PFD.FlightMode.FlightMode) {
					case "DepartureGround":
					case "TakeOff":
					case "EmergencyReturn":
						PFD0.Stats.Speed.MachNumber = CalcMachNumber(PFD0.Stats.Speed.TASDisplay, PFD0.Stats.Altitude.TapeDisplay, PFD.Altitude.AirportElevation.Departure, PFD.Speed.AirportTemperature.Departure);
						break;
					case "Cruise":
					case "Land":
					case "ArrivalGround":
						PFD0.Stats.Speed.MachNumber = CalcMachNumber(PFD0.Stats.Speed.TASDisplay, PFD0.Stats.Altitude.TapeDisplay, PFD.Altitude.AirportElevation.Arrival, PFD.Speed.AirportTemperature.Arrival);
						break;
					default:
						AlertSystemError("The value of PFD.FlightMode.FlightMode \"" + PFD.FlightMode.FlightMode + "\" in function RefreshPFDData is invalid.");
						break;
				}

			// DME
			if(PFD.DME.IsEnabled == true && PFD0.Status.GPS.IsPositionAvailable == true) {
				PFD0.Stats.DME.Lat = PFD0.RawData.GPS.Position.Lat;
				PFD0.Stats.DME.Lon = PFD0.RawData.GPS.Position.Lon;
				switch(PFD.FlightMode.FlightMode) {
					case "DepartureGround":
					case "TakeOff":
					case "EmergencyReturn":
						PFD0.Stats.DME.Distance = CalcDistance(PFD0.Stats.DME.Lat, PFD0.Stats.DME.Lon, PFD.DME.AirportCoordinates.Departure.Lat, PFD.DME.AirportCoordinates.Departure.Lon);
						break;
					case "Cruise":
					case "Land":
					case "ArrivalGround":
						PFD0.Stats.DME.Distance = CalcDistance(PFD0.Stats.DME.Lat, PFD0.Stats.DME.Lon, PFD.DME.AirportCoordinates.Arrival.Lat, PFD.DME.AirportCoordinates.Arrival.Lon);
						break;
					default:
						AlertSystemError("The value of PFD.FlightMode.FlightMode \"" + PFD.FlightMode.FlightMode + "\" in function RefreshPFDData is invalid.");
						break;
				}
				switch(PFD.DME.ETACalcMethod) {
					case "UseRealTimeGS":
						if(PFD0.Stats.Speed.GSDisplay > 0) {
							PFD0.Stats.DME.ETA = PFD0.Stats.DME.Distance / PFD0.Stats.Speed.GSDisplay * 1000; // (Meter / meter per sec) = sec, sec * 1000 = millisec.
						}
						break;
					case "UseAvgGS":
						if(PFD0.Stats.Speed.AvgGSDisplay > 0) {
							PFD0.Stats.DME.ETA = PFD0.Stats.DME.Distance / PFD0.Stats.Speed.AvgGSDisplay * 1000;
						}
						break;
					default:
						AlertSystemError("The value of PFD.DME.ETACalcMethod \"" + PFD.DME.ETACalcMethod + "\" in function RefreshPFDData is invalid.");
						break;
				}
			}

			// Radio altitude
			switch(PFD.FlightMode.FlightMode) {
				case "DepartureGround":
				case "TakeOff":
				case "EmergencyReturn":
					PFD0.Stats.Altitude.RadioDisplay = PFD0.Stats.Altitude.TapeDisplay - PFD.Altitude.AirportElevation.Departure;
					break;
				case "Cruise":
				case "Land":
				case "ArrivalGround":
					PFD0.Stats.Altitude.RadioDisplay = PFD0.Stats.Altitude.TapeDisplay - PFD.Altitude.AirportElevation.Arrival;
					break;
				default:
					AlertSystemError("The value of PFD.FlightMode.FlightMode \"" + PFD.FlightMode.FlightMode + "\" in function RefreshPFDData is invalid.");
					break;
			}

			// Decision altitude
			switch(PFD.FlightMode.FlightMode) {
				case "DepartureGround":
				case "TakeOff":
				case "Cruise":
				case "ArrivalGround":
					PFD0.Status.IsDecisionAltitudeActive = false;
					break;
				case "Land":
					if(PFD0.Stats.Altitude.TapeDisplay <= PFD.Altitude.AirportElevation.Arrival + PFD.Altitude.DecisionHeight) {
						PFD0.Status.IsDecisionAltitudeActive = true;
						if(PFD0.Stats.Altitude.PreviousTapeDisplay > PFD.Altitude.AirportElevation.Arrival + PFD.Altitude.DecisionHeight) {
							PFD0.Stats.Altitude.DecisionTimestamp = PFD0.Stats.ClockTime;
						}
					}
					break;
				case "EmergencyReturn":
					if(PFD0.Stats.Altitude.TapeDisplay <= PFD.Altitude.AirportElevation.Departure + PFD.Altitude.DecisionHeight) {
						PFD0.Status.IsDecisionAltitudeActive = true;
						if(PFD0.Stats.Altitude.PreviousTapeDisplay > PFD.Altitude.AirportElevation.Departure + PFD.Altitude.DecisionHeight) {
							PFD0.Stats.Altitude.DecisionTimestamp = PFD0.Stats.ClockTime;
						}
					}
					break;
				default:
					AlertSystemError("The value of PFD.FlightMode.FlightMode \"" + PFD.FlightMode.FlightMode + "\" in function RefreshPFDData is invalid.");
					break;
			}

			// Flight mode auto switch & airport data auto swap
			if(PFD.FlightMode.AutoSwitchFlightModeAndSwapAirportData == true) {
				switch(PFD.FlightMode.FlightMode) {
					case "DepartureGround":
						if(PFD0.Stats.Speed.TapeDisplay >= 41.152 &&
						PFD0.Stats.Altitude.TapeDisplay - PFD.Altitude.AirportElevation.Departure >= 9.144 &&
						PFD0.Stats.Altitude.PreviousTapeDisplay - PFD.Altitude.AirportElevation.Departure < 9.144) {
							PFD.FlightMode.FlightMode = "TakeOff";
							PFD0.Stats.FlightModeTimestamp = PFD0.Stats.ClockTime;
							setTimeout(RefreshPFD, 0);
						}
						break;
					case "TakeOff":
						if(PFD0.Stats.Altitude.TapeDisplay - PFD.Altitude.AirportElevation.Departure >= 914.4 &&
						PFD0.Stats.Altitude.PreviousTapeDisplay - PFD.Altitude.AirportElevation.Departure < 914.4) {
							PFD.FlightMode.FlightMode = "Cruise";
							PFD0.Stats.FlightModeTimestamp = PFD0.Stats.ClockTime;
							setTimeout(RefreshPFD, 0);
						}
						break;
					case "Cruise":
						if(PFD0.Stats.Altitude.TapeDisplay - PFD.Altitude.AirportElevation.Arrival <= 914.4 &&
						PFD0.Stats.Altitude.PreviousTapeDisplay - PFD.Altitude.AirportElevation.Arrival > 914.4) {
							PFD.FlightMode.FlightMode = "Land";
							PFD0.Stats.FlightModeTimestamp = PFD0.Stats.ClockTime;
							setTimeout(RefreshPFD, 0);
						}
						break;
					case "Land":
						if(PFD0.Stats.Altitude.TapeDisplay - PFD.Altitude.AirportElevation.Arrival <= 9.144 &&
						PFD0.Stats.Altitude.PreviousTapeDisplay - PFD.Altitude.AirportElevation.Arrival > 9.144) {
							PFD.FlightMode.FlightMode = "ArrivalGround";
							PFD0.Stats.FlightModeTimestamp = PFD0.Stats.ClockTime;
							setTimeout(RefreshPFD, 0);
						}
						break;
					case "ArrivalGround":
						if(PFD0.Stats.Speed.TapeDisplay <= 2.572 && PFD0.Stats.Speed.PreviousTapeDisplay > 2.572) {
							PFD.FlightMode.FlightMode = "DepartureGround";
							SwapAirportTemperatures();
							SwapRelativeHumidity();
							SwapQNHs();
							SwapAirportElevations();
							SwapAirportCoordinates();
							PFD0.Stats.FlightModeTimestamp = PFD0.Stats.ClockTime;
							setTimeout(RefreshPFD, 0);
						}
						break;
					case "EmergencyReturn":
						if(PFD0.Stats.Altitude.TapeDisplay - PFD.Altitude.AirportElevation.Departure <= 9.144 &&
						PFD0.Stats.Altitude.PreviousTapeDisplay - PFD.Altitude.AirportElevation.Departure > 9.144) {
							PFD.FlightMode.FlightMode = "DepartureGround";
							PFD0.Stats.FlightModeTimestamp = PFD0.Stats.ClockTime;
							setTimeout(RefreshPFD, 0);
						}
						break;
					default:
						AlertSystemError("The value of PFD.FlightMode.FlightMode \"" + PFD.FlightMode.FlightMode + "\" in function RefreshPFDData is invalid.");
						break;
				}
			}

			// Alerts
				// Initialize
				PFD0.Alert.Active = {
					AttitudeWarning: "", SpeedWarning: "", AltitudeCallout: "", AltitudeWarning: ""
				};

				// Attitude warning
				if(PFD.Attitude.IsEnabled == true) {
					if((PFD.Attitude.Mode == "Accel" && PFD0.Status.IsAccelAvailable == true) ||
					PFD.Attitude.Mode == "Manual") {
						if(IsExcessiveBankAngle() == true) {
							PFD0.Alert.Active.AttitudeWarning = "BankAngle";
						}
					}
				}

				// Speed warning
				if((PFD.Speed.Mode == "GPS" && PFD0.Status.GPS.IsSpeedAvailable == true) ||
				(PFD.Speed.Mode == "Accel" && PFD0.Status.IsAccelAvailable == true) ||
				(PFD.Speed.Mode == "DualChannel" && (PFD0.Status.GPS.IsSpeedAvailable == true || PFD0.Status.IsAccelAvailable == true)) ||
				PFD.Speed.Mode == "Manual") {
					if(IsAirspeedLow() == true) {
						PFD0.Alert.Active.SpeedWarning = "AirspeedLow";
					}
					if(IsOverspeed() == true) {
						PFD0.Alert.Active.SpeedWarning = "Overspeed";
					}
				}

				// Altitude callout
				if((PFD.Altitude.Mode == "GPS" && PFD0.Status.GPS.IsAltitudeAvailable == true) ||
				(PFD.Altitude.Mode == "Accel" && PFD0.Status.IsAccelAvailable == true) ||
				(PFD.Altitude.Mode == "DualChannel" && (PFD0.Status.GPS.IsAltitudeAvailable == true || PFD0.Status.IsAccelAvailable == true)) ||
				PFD.Altitude.Mode == "Manual") {
					switch(PFD.FlightMode.FlightMode) {
						case "DepartureGround":
						case "Land":
						case "ArrivalGround":
						case "EmergencyReturn":
							let ConvertedRadioAltitude = 0, ConvertedPreviousRadioAltitude = 0, ConvertedDecisionHeight = 0;
							switch(PFD.FlightMode.FlightMode) {
								case "DepartureGround":
								case "EmergencyReturn":
									ConvertedRadioAltitude = ConvertUnit(PFD0.Stats.Altitude.TapeDisplay - PFD.Altitude.AirportElevation.Departure, "Meter", Subsystem.I18n.AltitudeUnit);
									ConvertedPreviousRadioAltitude = ConvertUnit(PFD0.Stats.Altitude.PreviousTapeDisplay - PFD.Altitude.AirportElevation.Departure, "Meter", Subsystem.I18n.AltitudeUnit);
									break;
								case "Land":
								case "ArrivalGround":
									ConvertedRadioAltitude = ConvertUnit(PFD0.Stats.Altitude.TapeDisplay - PFD.Altitude.AirportElevation.Arrival, "Meter", Subsystem.I18n.AltitudeUnit);
									ConvertedPreviousRadioAltitude = ConvertUnit(PFD0.Stats.Altitude.PreviousTapeDisplay - PFD.Altitude.AirportElevation.Arrival, "Meter", Subsystem.I18n.AltitudeUnit);
									break;
								default:
									AlertSystemError("The value of PFD.FlightMode.FlightMode \"" + PFD.FlightMode.FlightMode + "\" in function RefreshPFDData is invalid.");
									break;
							}
							ConvertedDecisionHeight = ConvertUnit(PFD.Altitude.DecisionHeight, "Meter", Subsystem.I18n.AltitudeUnit);
							if(ConvertedRadioAltitude <= 2500 && ConvertedPreviousRadioAltitude > 2500) {
								PFD0.Alert.Active.AltitudeCallout = "2500";
							}
							if(ConvertedRadioAltitude <= 1000 && ConvertedPreviousRadioAltitude > 1000) {
								PFD0.Alert.Active.AltitudeCallout = "1000";
							}
							if(ConvertedRadioAltitude <= 500 && ConvertedPreviousRadioAltitude > 500) {
								PFD0.Alert.Active.AltitudeCallout = "500";
							}
							if(ConvertedRadioAltitude <= 400 && ConvertedPreviousRadioAltitude > 400) {
								PFD0.Alert.Active.AltitudeCallout = "400";
							}
							if(ConvertedRadioAltitude <= 300 && ConvertedPreviousRadioAltitude > 300) {
								PFD0.Alert.Active.AltitudeCallout = "300";
							}
							if(ConvertedRadioAltitude <= 200 && ConvertedPreviousRadioAltitude > 200) {
								PFD0.Alert.Active.AltitudeCallout = "200";
							}
							if(ConvertedRadioAltitude <= 100 && ConvertedPreviousRadioAltitude > 100) {
								PFD0.Alert.Active.AltitudeCallout = "100";
							}
							if(ConvertedRadioAltitude <= 50 && ConvertedPreviousRadioAltitude > 50) {
								PFD0.Alert.Active.AltitudeCallout = "50";
							}
							if(ConvertedRadioAltitude <= 40 && ConvertedPreviousRadioAltitude > 40) {
								PFD0.Alert.Active.AltitudeCallout = "40";
							}
							if(ConvertedRadioAltitude <= 30 && ConvertedPreviousRadioAltitude > 30) {
								PFD0.Alert.Active.AltitudeCallout = "30";
							}
							if(ConvertedRadioAltitude <= 20 && ConvertedPreviousRadioAltitude > 20) {
								PFD0.Alert.Active.AltitudeCallout = "20";
							}
							if(ConvertedRadioAltitude <= 10 && ConvertedPreviousRadioAltitude > 10) {
								PFD0.Alert.Active.AltitudeCallout = "10";
							}
							if(ConvertedRadioAltitude <= (ConvertedDecisionHeight + 100) && ConvertedPreviousRadioAltitude > (ConvertedDecisionHeight + 100)) {
								PFD0.Alert.Active.AltitudeCallout = "HundredAbove";
							}
							if(ConvertedRadioAltitude <= (ConvertedDecisionHeight + 80) && ConvertedPreviousRadioAltitude > (ConvertedDecisionHeight + 80)) {
								PFD0.Alert.Active.AltitudeCallout = "ApproachingMinimums";
							}
							if(ConvertedRadioAltitude <= ConvertedDecisionHeight && ConvertedPreviousRadioAltitude > ConvertedDecisionHeight) {
								PFD0.Alert.Active.AltitudeCallout = "Minimums";
							}
							if(ConvertedRadioAltitude <= 15 && ConvertedPreviousRadioAltitude > 15) {
								PFD0.Alert.Active.AltitudeCallout = "Retard";
							}
							break;
						case "TakeOff":
						case "Cruise":
							break;
						default:
							AlertSystemError("The value of PFD.FlightMode.FlightMode \"" + PFD.FlightMode.FlightMode + "\" in function RefreshPFDData is invalid.");
							break;
					}
				}

				// Altitude warning
				if((PFD.Altitude.Mode == "GPS" && PFD0.Status.GPS.IsAltitudeAvailable == true) ||
				(PFD.Altitude.Mode == "Accel" && PFD0.Status.IsAccelAvailable == true) ||
				(PFD.Altitude.Mode == "DualChannel" && (PFD0.Status.GPS.IsAltitudeAvailable == true || PFD0.Status.IsAccelAvailable == true)) ||
				PFD.Altitude.Mode == "Manual") {
					if(IsDontSink() == true) {
						PFD0.Alert.Active.AltitudeWarning = "DontSink";
					}
					if(PFD.DME.IsEnabled == true && PFD0.Status.GPS.IsPositionAvailable == true) {
						if(IsExcessivelyBelowGlideSlope() == true) {
							PFD0.Alert.Active.AltitudeWarning = "GlideSlope";
						}
					}
					if(IsSinkRate() == true) {
						PFD0.Alert.Active.AltitudeWarning = "SinkRate";
					}
					if(IsSinkRatePullUp() == true) {
						PFD0.Alert.Active.AltitudeWarning = "PullUp";
					}
				}
		}
		function RefreshScale() {
			let Elements = document.getElementsByClassName("PFDPanel"), ActivePFDPanelID = "Unknown";
			for(let Looper = 0; Looper < Elements.length; Looper++) {
				if(Elements[Looper].classList.contains("HiddenHorizontally") == false) {
					ActivePFDPanelID = Elements[Looper].id;
					break;
				}
			}
			if(ActivePFDPanelID == "Unknown") {
				AlertSystemError("There is not an active PFD panel.");
			}
			let PFDScale = Math.min((ReadWidth("PFDViewport") + 30) / ReadWidth(ActivePFDPanelID), (ReadHeight("PFDViewport") + 30) / ReadHeight(ActivePFDPanelID));
			if(Subsystem.Display.FlipPFDVertically == false) {
				ChangeScale(ActivePFDPanelID, PFDScale);
			} else {
				ChangeScale(ActivePFDPanelID, PFDScale + ", " + (-PFDScale));
			}
		}
		function RefreshPanel() {
			switch(Subsystem.Display.PFDStyle) {
				case "Default":
					RefreshDefaultPanel();
					break;
				case "HUD":
				case "Bocchi737":
				case "AnalogGauges":
				case "AutomobileSpeedometer":
					AlertSystemError("A PFD style which is still under construction was selected.");
					break;
				default:
					AlertSystemError("The value of Subsystem.Display.PFDStyle \"" + Subsystem.Display.PFDStyle + "\" in function RefreshPFDPanel is invalid.");
					break;
			}
		}
			// Sub-functions
			function RefreshDefaultPanel() {
				// Info bar
				if(PFD0.Status.GPS.IsPositionAvailable == true) {
					if(PFD0.Status.GPS.IsPositionAccurate == true && PFD0.Status.GPS.IsAltitudeAvailable == true && PFD0.Status.GPS.IsAltitudeAccurate == true) {
						ChangeText("Label_PFDDefaultPanelGPSStatusValue", Translate("Normal"));
					} else {
						ChangeText("Label_PFDDefaultPanelGPSStatusValue", Translate("SignalWeak"));
					}
					RemoveClass("Label_PFDDefaultPanelGPSStatusTitle", "OrangeText");
					RemoveClass("Label_PFDDefaultPanelGPSStatusValue", "OrangeText");
				} else {
					ChangeText("Label_PFDDefaultPanelGPSStatusValue", Translate("Unavailable"));
					AddClass("Label_PFDDefaultPanelGPSStatusTitle", "OrangeText");
					AddClass("Label_PFDDefaultPanelGPSStatusValue", "OrangeText");
				}
				if(PFD0.Status.IsAccelAvailable == true) {
					ChangeText("Label_PFDDefaultPanelAccelStatusValue", Translate("Normal"));
					RemoveClass("Label_PFDDefaultPanelAccelStatusTitle", "OrangeText");
					RemoveClass("Label_PFDDefaultPanelAccelStatusValue", "OrangeText");
				} else {
					ChangeText("Label_PFDDefaultPanelAccelStatusValue", Translate("Unavailable"));
					AddClass("Label_PFDDefaultPanelAccelStatusTitle", "OrangeText");
					AddClass("Label_PFDDefaultPanelAccelStatusValue", "OrangeText");
				}
				if((PFD.Speed.Mode == "GPS" && PFD0.Status.GPS.IsSpeedAvailable == true) ||
				(PFD.Speed.Mode == "Accel" && PFD0.Status.IsAccelAvailable == true) ||
				(PFD.Speed.Mode == "DualChannel" && (PFD0.Status.GPS.IsSpeedAvailable == true || PFD0.Status.IsAccelAvailable == true)) ||
				PFD.Speed.Mode == "Manual") {
					ChangeText("Label_PFDDefaultPanelGSValue", ConvertUnit(PFD0.Stats.Speed.GSDisplay, "MeterPerSec", Subsystem.I18n.SpeedUnit).toFixed(0));
					ChangeText("Label_PFDDefaultPanelAvgGSValue", ConvertUnit(PFD0.Stats.Speed.AvgGSDisplay, "MeterPerSec", Subsystem.I18n.SpeedUnit).toFixed(0));
					ChangeText("Label_PFDDefaultPanelTASValue", ConvertUnit(PFD0.Stats.Speed.TASDisplay, "MeterPerSec", Subsystem.I18n.SpeedUnit).toFixed(0));
				} else {
					ChangeText("Label_PFDDefaultPanelGSValue", "---");
					ChangeText("Label_PFDDefaultPanelAvgGSValue", "---");
					ChangeText("Label_PFDDefaultPanelTASValue", "---");
				}
				if(PFD.Speed.Wind.Speed > 0) {
					ChangeText("Label_PFDDefaultPanelWindValue", PFD.Speed.Wind.Direction.toString().padStart(3, "0") + "°/" + ConvertUnit(PFD.Speed.Wind.Speed, "MeterPerSec", Subsystem.I18n.SpeedUnit).toFixed(0));
					if(PFD0.Status.GPS.IsHeadingAvailable == true) {
						Show("PFDDefaultPanelWindDirection");
						ChangeRotate("Needle_PFDDefaultPanelWindDirection", PFD0.Stats.Speed.Wind.RelativeHeading);
					} else {
						Fade("PFDDefaultPanelWindDirection");
					}
				} else {
					ChangeText("Label_PFDDefaultPanelWindValue", Translate("NoWind"));
					Fade("PFDDefaultPanelWindDirection");
				}

				// FMA
				ChangeText("Label_PFDDefaultPanelFlightMode", Translate(PFD.FlightMode.FlightMode));
				if(PFD0.Stats.ClockTime - PFD0.Stats.FlightModeTimestamp < 10000) {
					AddClass("Ctnr_PFDDefaultPanelFMA2", "ModeChanged");
				} else {
					RemoveClass("Ctnr_PFDDefaultPanelFMA2", "ModeChanged");
				}

				// Attitude
				Fade("Ctrl_PFDDefaultPanelAttitudeStatus");
				Fade("Ctrl_PFDDefaultPanelAttitudeBg");
				Fade("Ctrl_PFDDefaultPanelAttitudePitch");
				Fade("Ctrl_PFDDefaultPanelAttitudeRoll");
				Fade("Ctrl_PFDDefaultPanelAttitudeAircraftSymbol");
				if(PFD.Attitude.IsEnabled == true) {
					if((PFD.Attitude.Mode == "Accel" && PFD0.Status.IsAccelAvailable == true) ||
					PFD.Attitude.Mode == "Manual") {
						Show("Ctrl_PFDDefaultPanelAttitudeBg");
						Show("Ctrl_PFDDefaultPanelAttitudePitch");
						Show("Ctrl_PFDDefaultPanelAttitudeRoll");
						Show("Ctrl_PFDDefaultPanelAttitudeAircraftSymbol");
						if(System.Display.Anim > 0) {
							ChangeAnim("Ctrl_PFDDefaultPanelAttitudeBg", "100ms");
							ChangeAnim("Ctrl_PFDDefaultPanelAttitudePitch", "100ms");
							ChangeAnim("Ctrl_PFDDefaultPanelAttitudeRoll", "100ms");
						} else {
							ChangeAnim("Ctrl_PFDDefaultPanelAttitudeBg", "");
							ChangeAnim("Ctrl_PFDDefaultPanelAttitudePitch", "");
							ChangeAnim("Ctrl_PFDDefaultPanelAttitudeRoll", "");
						}
						ChangeTop("Ctrl_PFDDefaultPanelAttitudeBg", "calc(50% - 2000px + " + 10 * PFD0.Stats.Attitude.Pitch2 * Math.cos(Math.abs(PFD0.Stats.Attitude.Roll) * (Math.PI / 180)) + "px)");
						ChangeLeft("Ctrl_PFDDefaultPanelAttitudeBg", "calc(50% - 2000px + " + 10 * PFD0.Stats.Attitude.Pitch2 * Math.sin(PFD0.Stats.Attitude.Roll * (Math.PI / 180)) + "px)");
						ChangeRotate("Ctrl_PFDDefaultPanelAttitudeBg", -PFD0.Stats.Attitude.Roll);
						ChangeTop("CtrlGroup_PFDDefaultPanelAttitudePitch", "calc(50% - 900px + " + 10 * PFD0.Stats.Attitude.Pitch + "px)");
						ChangeRotate("Ctrl_PFDDefaultPanelAttitudePitch", -PFD0.Stats.Attitude.Roll);
						ChangeRotate("CtrlGroup_PFDDefaultPanelAttitudeRollScale", -PFD0.Stats.Attitude.Roll);
						if(PFD0.Stats.Attitude.Roll <= 0) {
							document.getElementById("ProgringFg_PFDDefaultPanelAttitudeRoll").style.strokeDasharray = (Math.PI * 420) * (-PFD0.Stats.Attitude.Roll / 360) + "px, " + (Math.PI * 420) * (1 + PFD0.Stats.Attitude.Roll / 360) + "px";
						} else {
							document.getElementById("ProgringFg_PFDDefaultPanelAttitudeRoll").style.strokeDasharray = "0, " + (Math.PI * 420) * (1 - PFD0.Stats.Attitude.Roll / 360) + "px, " + (Math.PI * 420) * (PFD0.Stats.Attitude.Roll / 360) + "px";
						}
						if(PFD0.Alert.Active.AttitudeWarning == "BankAngle") {
							AddClass("ProgringFg_PFDDefaultPanelAttitudeRoll", "BankAngleWarning");
							AddClass("PFDDefaultPanelAttitudeRollPointer", "BankAngleWarning");
						} else {
							RemoveClass("ProgringFg_PFDDefaultPanelAttitudeRoll", "BankAngleWarning");
							RemoveClass("PFDDefaultPanelAttitudeRollPointer", "BankAngleWarning");
						}
					} else {
						Show("Ctrl_PFDDefaultPanelAttitudeStatus");
						ChangeText("Label_PFDDefaultPanelAttitudeStatus", Translate("AttitudeUnavailable"));
						AddClass("Label_PFDDefaultPanelAttitudeStatus", "OrangeText");
					}
				} else {
					Show("Ctrl_PFDDefaultPanelAttitudeStatus");
					ChangeText("Label_PFDDefaultPanelAttitudeStatus", Translate("AttitudeDisabled"));
					RemoveClass("Label_PFDDefaultPanelAttitudeStatus", "OrangeText");
				}

				// Speed
				Fade("Ctrl_PFDDefaultPanelSpeedStatus");
				Fade("Ctrl_PFDDefaultPanelSpeedTape");
				Fade("Ctrl_PFDDefaultPanelSpeedAdditionalIndicators");
				Fade("Ctrl_PFDDefaultPanelSpeedBalloon");
				Fade("Ctrl_PFDDefaultPanelSpeedMachNumber");
				if((PFD.Speed.Mode == "GPS" && PFD0.Status.GPS.IsSpeedAvailable == true) ||
				(PFD.Speed.Mode == "Accel" && PFD0.Status.IsAccelAvailable == true) ||
				(PFD.Speed.Mode == "DualChannel" && (PFD0.Status.GPS.IsSpeedAvailable == true || PFD0.Status.IsAccelAvailable == true)) ||
				PFD.Speed.Mode == "Manual") {
					// Show ctrls
					Show("Ctrl_PFDDefaultPanelSpeedTape");
					Show("Ctrl_PFDDefaultPanelSpeedAdditionalIndicators");
					Show("Ctrl_PFDDefaultPanelSpeedBalloon");
					if(System.Display.Anim > 0) {
						ChangeAnim("Ctrl_PFDDefaultPanelSpeedTape", "100ms");
						ChangeAnim("Ctrl_PFDDefaultPanelSpeedAdditionalIndicators", "100ms");
					} else {
						ChangeAnim("Ctrl_PFDDefaultPanelSpeedTape", "");
						ChangeAnim("Ctrl_PFDDefaultPanelSpeedAdditionalIndicators", "");
					}

					// Tape
					ChangeTop("CtrlGroup_PFDDefaultPanelSpeedTape", "calc(50% - 5000px + " + 5 * ConvertUnit(PFD0.Stats.Speed.TapeDisplay, "MeterPerSec", Subsystem.I18n.SpeedUnit) + "px)");

					// Additional indicators
						// Speed trend
						if(Math.abs(ConvertUnit(PFD0.Stats.Speed.TrendDisplay, "MeterPerSec", Subsystem.I18n.SpeedUnit)) >= 3) {
							Show("Needle_PFDDefaultPanelSpeedTrend");
						} else {
							Fade("Needle_PFDDefaultPanelSpeedTrend");
						}
						ChangeTop("Needle_PFDDefaultPanelSpeedTrend", "calc(50% - " + 5 * Math.abs(ConvertUnit(PFD0.Stats.Speed.TrendDisplay, "MeterPerSec", Subsystem.I18n.SpeedUnit)) + "px)");
						ChangeHeight("Needle_PFDDefaultPanelSpeedTrend", 10 * Math.abs(ConvertUnit(PFD0.Stats.Speed.TrendDisplay, "MeterPerSec", Subsystem.I18n.SpeedUnit)) + "px");
						if(PFD0.Stats.Speed.TrendDisplay >= 0) {
							RemoveClass("Needle_PFDDefaultPanelSpeedTrend", "Decreasing");
						} else {
							AddClass("Needle_PFDDefaultPanelSpeedTrend", "Decreasing");
						}

						// Other speeds
						ChangeTop("CtrlGroup_PFDDefaultPanelOtherSpeeds", "calc(50% - 5000px + " + 5 * ConvertUnit(PFD0.Stats.Speed.TapeDisplay, "MeterPerSec", Subsystem.I18n.SpeedUnit) + "px)");
							// Speed limits
							switch(PFD.FlightMode.FlightMode) {
								case "DepartureGround":
								case "ArrivalGround":
									Hide("Ctrl_PFDDefaultPanelSpeedLimitMin");
									break;
								case "TakeOff":
								case "Cruise":
								case "Land":
								case "EmergencyReturn":
									Show("Ctrl_PFDDefaultPanelSpeedLimitMin");
									ChangeHeight("Ctrl_PFDDefaultPanelSpeedLimitMin", 5 * ConvertUnit(PFD.Speed.SpeedLimit.Min, "MeterPerSec", Subsystem.I18n.SpeedUnit) + "px");
									break;
								default:
									AlertSystemError("The value of PFD.FlightMode.FlightMode \"" + PFD.FlightMode.FlightMode + "\" in function RefreshPFDPanel is invalid.");
									break;
							}
							ChangeHeight("Ctrl_PFDDefaultPanelSpeedLimitMax", 5 * (1000 - ConvertUnit(CalcMaxSpeedLimit(PFD.Speed.SpeedLimit.MaxOnFlapsUp, PFD.Speed.SpeedLimit.MaxOnFlapsFull, PFD.Flaps), "MeterPerSec", Subsystem.I18n.SpeedUnit)) + "px");

							// Avg IAS
							ChangeBottom("Ctrl_PFDDefaultPanelAvgIAS", 5 * ConvertUnit(PFD0.Stats.Speed.AvgIASDisplay, "MeterPerSec", Subsystem.I18n.SpeedUnit) - 10 + "px");

					// Balloon
					ChangeTop("RollingDigit_PFDDefaultPanelSpeed1", -45 * (9 - PFD0.Stats.Speed.BalloonDisplay[1]) + "px");
					ChangeTop("RollingDigit_PFDDefaultPanelSpeed2", -45 * (10 - PFD0.Stats.Speed.BalloonDisplay[2]) + "px");
					switch(true) {
						case ConvertUnit(PFD0.Stats.Speed.TapeDisplay, "MeterPerSec", Subsystem.I18n.SpeedUnit) < 1:
							ChangeTop("RollingDigit_PFDDefaultPanelSpeed3", 15 - 30 * (18 - PFD0.Stats.Speed.BalloonDisplay[3]) + "px");
							break;
						case ConvertUnit(PFD0.Stats.Speed.TapeDisplay, "MeterPerSec", Subsystem.I18n.SpeedUnit) > 998:
							ChangeTop("RollingDigit_PFDDefaultPanelSpeed3", 15 - 30 * (9 - PFD0.Stats.Speed.BalloonDisplay[3]) + "px");
							break;
						default:
							ChangeTop("RollingDigit_PFDDefaultPanelSpeed3", 15 - 30 * (14 - PFD0.Stats.Speed.BalloonDisplay[3]) + "px");
							break;
					}
					if(PFD0.Alert.Active.SpeedWarning != "") {
						AddClass("Ctrl_PFDDefaultPanelSpeedBalloonBalloon", "Warning");
					} else {
						RemoveClass("Ctrl_PFDDefaultPanelSpeedBalloonBalloon", "Warning");
					}

					// Mach number
					if(PFD0.Stats.Speed.MachNumber >= 0.5) {
						Show("Ctrl_PFDDefaultPanelSpeedMachNumber");
						ChangeText("Label_PFDDefaultPanelSpeedMachNumber", PFD0.Stats.Speed.MachNumber.toFixed(3).replace("0.", "."));
					}
				} else {
					Show("Ctrl_PFDDefaultPanelSpeedStatus");
					ChangeText("Label_PFDDefaultPanelSpeedStatus", Translate("SpeedUnavailable"));
					AddClass("Label_PFDDefaultPanelSpeedStatus", "OrangeText");
				}

				// Altitude
				Fade("Ctrl_PFDDefaultPanelAltitudeStatus");
				Fade("Ctrl_PFDDefaultPanelAltitudeTape");
				Fade("Ctrl_PFDDefaultPanelAltitudeAdditionalIndicators");
				Fade("Ctrl_PFDDefaultPanelAltitudeBalloon");
				Fade("Ctrl_PFDDefaultPanelAltitudeMetric");
				if((PFD.Altitude.Mode == "GPS" && PFD0.Status.GPS.IsAltitudeAvailable == true) ||
				(PFD.Altitude.Mode == "Accel" && PFD0.Status.IsAccelAvailable == true) ||
				(PFD.Altitude.Mode == "DualChannel" && (PFD0.Status.GPS.IsAltitudeAvailable == true || PFD0.Status.IsAccelAvailable == true)) ||
				PFD.Altitude.Mode == "Manual") {
					// Show ctrls
					Show("Ctrl_PFDDefaultPanelAltitudeTape");
					Show("Ctrl_PFDDefaultPanelAltitudeAdditionalIndicators");
					Show("Ctrl_PFDDefaultPanelAltitudeBalloon");
					if(System.Display.Anim > 0) {
						ChangeAnim("Ctrl_PFDDefaultPanelAltitudeTape", "100ms");
						ChangeAnim("Ctrl_PFDDefaultPanelAltitudeAdditionalIndicators", "100ms");
					} else {
						ChangeAnim("Ctrl_PFDDefaultPanelAltitudeTape", "");
						ChangeAnim("Ctrl_PFDDefaultPanelAltitudeAdditionalIndicators", "");
					}

					// Tape
					ChangeTop("CtrlGroup_PFDDefaultPanelAltitudeTape", "calc(50% - 37500px + " + 0.75 * ConvertUnit(PFD0.Stats.Altitude.TapeDisplay, "Meter", Subsystem.I18n.AltitudeUnit) + "px)");

					// Additional indicators
						// Altitude trend
						if(Math.abs(ConvertUnit(PFD0.Stats.Altitude.TrendDisplay, "Meter", Subsystem.I18n.AltitudeUnit)) >= 20) {
							Show("Needle_PFDDefaultPanelAltitudeTrend");
						} else {
							Fade("Needle_PFDDefaultPanelAltitudeTrend");
						}
						ChangeTop("Needle_PFDDefaultPanelAltitudeTrend", "calc(50% - " + 0.75 * Math.abs(ConvertUnit(PFD0.Stats.Altitude.TrendDisplay, "Meter", Subsystem.I18n.AltitudeUnit)) + "px)");
						ChangeHeight("Needle_PFDDefaultPanelAltitudeTrend", 1.5 * Math.abs(ConvertUnit(PFD0.Stats.Altitude.TrendDisplay, "Meter", Subsystem.I18n.AltitudeUnit)) + "px");
						if(PFD0.Stats.Altitude.TrendDisplay >= 0) {
							RemoveClass("Needle_PFDDefaultPanelAltitudeTrend", "Decreasing");
						} else {
							AddClass("Needle_PFDDefaultPanelAltitudeTrend", "Decreasing");
						}

						// Other altitudes
						ChangeTop("CtrlGroup_PFDDefaultPanelOtherAltitudes", "calc(50% - 37500px + " + 0.75 * ConvertUnit(PFD0.Stats.Altitude.TapeDisplay, "Meter", Subsystem.I18n.AltitudeUnit) + "px)");
							// Decision altitude
							switch(PFD.FlightMode.FlightMode) {
								case "DepartureGround":
								case "TakeOff":
								case "Cruise":
									Fade("Ctrl_PFDDefaultPanelDecisionAltitude");
									break;
								case "Land":
								case "ArrivalGround":
									Show("Ctrl_PFDDefaultPanelDecisionAltitude");
									ChangeBottom("Ctrl_PFDDefaultPanelDecisionAltitude", 0.75 * (ConvertUnit(PFD.Altitude.AirportElevation.Arrival + PFD.Altitude.DecisionHeight, "Meter", Subsystem.I18n.AltitudeUnit) + 2000) - 10 + "px");
									if(PFD0.Status.IsDecisionAltitudeActive == true) {
										AddClass("Ctrl_PFDDefaultPanelDecisionAltitude", "Active");
									} else {
										RemoveClass("Ctrl_PFDDefaultPanelDecisionAltitude", "Active");
									}
									break;
								case "EmergencyReturn":
									Show("Ctrl_PFDDefaultPanelDecisionAltitude");
									ChangeBottom("Ctrl_PFDDefaultPanelDecisionAltitude", 0.75 * (ConvertUnit(PFD.Altitude.AirportElevation.Departure + PFD.Altitude.DecisionHeight, "Meter", Subsystem.I18n.AltitudeUnit) + 2000) - 10 + "px");
									if(PFD0.Status.IsDecisionAltitudeActive == true) {
										AddClass("Ctrl_PFDDefaultPanelDecisionAltitude", "Active");
									} else {
										RemoveClass("Ctrl_PFDDefaultPanelDecisionAltitude", "Active");
									}
									break;
								default:
									AlertSystemError("The value of PFD.FlightMode.FlightMode \"" + PFD.FlightMode.FlightMode + "\" in function RefreshPFDPanel is invalid.");
									break;
							}

							// Ground altitude
							switch(PFD.FlightMode.FlightMode) {
								case "DepartureGround":
								case "TakeOff":
								case "EmergencyReturn":
									ChangeBottom("Ctrl_PFDDefaultPanelGroundAltitude", 0.75 * (ConvertUnit(PFD.Altitude.AirportElevation.Departure, "Meter", Subsystem.I18n.AltitudeUnit) + 2000) - 40 + "px");
									break;
								case "Cruise":
								case "Land":
								case "ArrivalGround":
									ChangeBottom("Ctrl_PFDDefaultPanelGroundAltitude", 0.75 * (ConvertUnit(PFD.Altitude.AirportElevation.Arrival, "Meter", Subsystem.I18n.AltitudeUnit) + 2000) - 40 + "px");
									break;
								default:
									AlertSystemError("The value of PFD.FlightMode.FlightMode \"" + PFD.FlightMode.FlightMode + "\" in function RefreshPFDPanel is invalid.");
									break;
							}

					// Balloon
					if(PFD0.Stats.Altitude.TapeDisplay >= 0) {
						ChangeTop("RollingDigit_PFDDefaultPanelAltitude1", -45 * (5 - PFD0.Stats.Altitude.BalloonDisplay[1]) + "px");
					} else {
						ChangeTop("RollingDigit_PFDDefaultPanelAltitude1", "-270px");
					}
					ChangeTop("RollingDigit_PFDDefaultPanelAltitude2", -45 * (10 - PFD0.Stats.Altitude.BalloonDisplay[2]) + "px");
					ChangeTop("RollingDigit_PFDDefaultPanelAltitude3", -45 * (10 - PFD0.Stats.Altitude.BalloonDisplay[3]) + "px");
					switch(true) {
						case ConvertUnit(PFD0.Stats.Altitude.TapeDisplay, "Meter", Subsystem.I18n.AltitudeUnit) < -1980:
							ChangeTop("RollingDigit_PFDDefaultPanelAltitude4", 17.5 - 25 * (21 - PFD0.Stats.Altitude.BalloonDisplay[4] / 20) + "px");
							break;
						case ConvertUnit(PFD0.Stats.Altitude.TapeDisplay, "Meter", Subsystem.I18n.AltitudeUnit) >= -1980 &&
						ConvertUnit(PFD0.Stats.Altitude.TapeDisplay, "Meter", Subsystem.I18n.AltitudeUnit) <= -20:
							ChangeTop("RollingDigit_PFDDefaultPanelAltitude4", 17.5 - 25 * (17 - PFD0.Stats.Altitude.BalloonDisplay[4] / 20) + "px");
							break;
						case ConvertUnit(PFD0.Stats.Altitude.TapeDisplay, "Meter", Subsystem.I18n.AltitudeUnit) > -20 &&
						ConvertUnit(PFD0.Stats.Altitude.TapeDisplay, "Meter", Subsystem.I18n.AltitudeUnit) < 20:
							ChangeTop("RollingDigit_PFDDefaultPanelAltitude4", 17.5 - 25 * (13 - PFD0.Stats.Altitude.BalloonDisplay[4] / 20) + "px");
							break;
						case ConvertUnit(PFD0.Stats.Altitude.TapeDisplay, "Meter", Subsystem.I18n.AltitudeUnit) >= 20 &&
						ConvertUnit(PFD0.Stats.Altitude.TapeDisplay, "Meter", Subsystem.I18n.AltitudeUnit) <= 49980:
							ChangeTop("RollingDigit_PFDDefaultPanelAltitude4", 17.5 - 25 * (9 - PFD0.Stats.Altitude.BalloonDisplay[4] / 20) + "px");
							break;
						case ConvertUnit(PFD0.Stats.Altitude.TapeDisplay, "Meter", Subsystem.I18n.AltitudeUnit) > 49980:
							ChangeTop("RollingDigit_PFDDefaultPanelAltitude4", 17.5 - 25 * (5 - PFD0.Stats.Altitude.BalloonDisplay[4] / 20) + "px");
							break;
						default:
							AlertSystemError("The value of ConvertUnit(PFD0.Stats.Altitude.TapeDisplay, \"Meter\", Subsystem.I18n.AltitudeUnit) \"" + ConvertUnit(PFD0.Stats.Altitude.TapeDisplay, "Meter", Subsystem.I18n.AltitudeUnit) + "\" in function RefreshPFDPanel is invalid.");
							break;
					}
					if(PFD0.Alert.Active.AltitudeWarning != "") {
						AddClass("Ctrl_PFDDefaultPanelAltitudeBalloonBalloon", "Warning");
					} else {
						RemoveClass("Ctrl_PFDDefaultPanelAltitudeBalloonBalloon", "Warning");
					}

					// Metric
					switch(Subsystem.I18n.AltitudeUnit) {
						case "Meter":
						case "Feet":
							break;
						case "FeetButShowMeterBeside":
							Show("Ctrl_PFDDefaultPanelAltitudeMetric");
							ChangeText("Label_PFDDefaultPanelAltitudeMetric", PFD0.Stats.Altitude.TapeDisplay.toFixed(0) + "<span class=\"SmallerText\">" + Translate("MetricAltitude") + "</span>");
							break;
						default:
							AlertSystemError("The value of Subsystem.I18n.AltitudeUnit \"" + Subsystem.I18n.AltitudeUnit + "\" in function RefreshPFDPanel is invalid.");
							break;
					}
				} else {
					Show("Ctrl_PFDDefaultPanelAltitudeStatus");
					ChangeText("Label_PFDDefaultPanelAltitudeStatus", Translate("AltitudeUnavailable"));
					AddClass("Label_PFDDefaultPanelAltitudeStatus", "OrangeText");
				}

				// Vertical speed
				Fade("Ctrl_PFDDefaultPanelVerticalSpeedStatus");
				Fade("Ctrl_PFDDefaultPanelVerticalSpeedTape");
				Fade("Ctrl_PFDDefaultPanelVerticalSpeedNeedle");
				Fade("Ctrl_PFDDefaultPanelVerticalSpeedBalloon");
				if((PFD.Altitude.Mode == "GPS" && PFD0.Status.GPS.IsAltitudeAvailable == true) ||
				(PFD.Altitude.Mode == "Accel" && PFD0.Status.IsAccelAvailable == true) ||
				(PFD.Altitude.Mode == "DualChannel" && (PFD0.Status.GPS.IsAltitudeAvailable == true || PFD0.Status.IsAccelAvailable == true)) ||
				PFD.Altitude.Mode == "Manual") {
					// Show ctrls
					Show("Ctrl_PFDDefaultPanelVerticalSpeedTape");
					Show("Ctrl_PFDDefaultPanelVerticalSpeedNeedle");
					if(System.Display.Anim > 0) {
						ChangeAnim("Ctrl_PFDDefaultPanelVerticalSpeedNeedle", "100ms");
					} else {
						ChangeAnim("Ctrl_PFDDefaultPanelVerticalSpeedNeedle", "");
					}

					// Needle
						// Calc needle angle
						let ConvertedVerticalSpeed = ConvertUnit(PFD0.Stats.Speed.Vertical, "MeterPerSec", Subsystem.I18n.VerticalSpeedUnit),
						VerticalPixels = 0, NeedleAngle = 0;
						switch(Subsystem.I18n.VerticalSpeedUnit) {
							case "MeterPerSec":
								switch(true) {
									case ConvertedVerticalSpeed <= -6:
										VerticalPixels = -180;
										break;
									case ConvertedVerticalSpeed > -6 && ConvertedVerticalSpeed <= -2:
										VerticalPixels = -120 + 60 * ((ConvertedVerticalSpeed + 2) / 4);
										break;
									case ConvertedVerticalSpeed > -2 && ConvertedVerticalSpeed < 2:
										VerticalPixels = 120 * (ConvertedVerticalSpeed / 2);
										break;
									case ConvertedVerticalSpeed >= 2 && ConvertedVerticalSpeed < 6:
										VerticalPixels = 120 + 60 * ((ConvertedVerticalSpeed - 2) / 4);
										break;
									case ConvertedVerticalSpeed >= 6:
										VerticalPixels = 180;
										break;
									default:
										AlertSystemError("The value of ConvertedVerticalSpeed \"" + ConvertedVerticalSpeed + "\" in function RefreshPFDPanel is invalid.");
										break;
								}
								break;
							case "FeetPerMin":
								switch(true) {
									case ConvertedVerticalSpeed <= -6000:
										VerticalPixels = -180;
										break;
									case ConvertedVerticalSpeed > -6000 && ConvertedVerticalSpeed <= -2000:
										VerticalPixels = -120 + 60 * ((ConvertedVerticalSpeed + 2000) / 4000);
										break;
									case ConvertedVerticalSpeed > -2000 && ConvertedVerticalSpeed < 2000:
										VerticalPixels = 120 * (ConvertedVerticalSpeed / 2000);
										break;
									case ConvertedVerticalSpeed >= 2000 && ConvertedVerticalSpeed < 6000:
										VerticalPixels = 120 + 60 * ((ConvertedVerticalSpeed - 2000) / 4000);
										break;
									case ConvertedVerticalSpeed >= 6000:
										VerticalPixels = 180;
										break;
									default:
										AlertSystemError("The value of ConvertedVerticalSpeed \"" + ConvertedVerticalSpeed + "\" in function RefreshPFDPanel is invalid.");
										break;
								}
								break;
							default:
								AlertSystemError("The value of Subsystem.I18n.VerticalSpeedUnit \"" + Subsystem.I18n.VerticalSpeedUnit + "\" in function RefreshPFDPanel is invalid.");
								break;
						}
						NeedleAngle = Math.atan(VerticalPixels / 100) / (Math.PI / 180);

						// Refresh needle
						let NeedleLength = 100 / Math.cos(NeedleAngle * (Math.PI / 180));
						ChangeRotate("Needle_PFDDefaultPanelVerticalSpeed", -90 + NeedleAngle);
						ChangeTop("Needle_PFDDefaultPanelVerticalSpeed", "calc(50% - " + NeedleLength + "px)");
						ChangeHeight("Needle_PFDDefaultPanelVerticalSpeed", NeedleLength * 2 + "px");

					// Balloon
					if((Subsystem.I18n.VerticalSpeedUnit == "MeterPerSec" && Math.abs(ConvertedVerticalSpeed) >= 1) ||
					(Subsystem.I18n.VerticalSpeedUnit == "FeetPerMin" && Math.abs(ConvertedVerticalSpeed) >= 400)) {
						Show("Ctrl_PFDDefaultPanelVerticalSpeedBalloon");
						let VerticalSpeedDisplay = 0;
						switch(Subsystem.I18n.VerticalSpeedUnit) {
							case "MeterPerSec":
								VerticalSpeedDisplay = Math.trunc(ConvertedVerticalSpeed / 0.2) * 0.2;
								if(VerticalSpeedDisplay < -50) {
									VerticalSpeedDisplay = -50;
								}
								if(VerticalSpeedDisplay > 50) {
									VerticalSpeedDisplay = 50;
								}
								if(VerticalSpeedDisplay > 0) {
									ChangeText("Label_PFDDefaultPanelVerticalSpeedBalloon", "+" + VerticalSpeedDisplay.toFixed(1));
								} else {
									ChangeText("Label_PFDDefaultPanelVerticalSpeedBalloon", VerticalSpeedDisplay.toFixed(1));
								}
								break;
							case "FeetPerMin":
								VerticalSpeedDisplay = Math.trunc(ConvertedVerticalSpeed / 50) * 50;
								if(VerticalSpeedDisplay < -9999) {
									VerticalSpeedDisplay = -9999;
								}
								if(VerticalSpeedDisplay > 9999) {
									VerticalSpeedDisplay = 9999;
								}
								if(VerticalSpeedDisplay > 0) {
									ChangeText("Label_PFDDefaultPanelVerticalSpeedBalloon", "+" + VerticalSpeedDisplay);
								} else {
									ChangeText("Label_PFDDefaultPanelVerticalSpeedBalloon", VerticalSpeedDisplay);
								}
								break;
							default:
								AlertSystemError("The value of Subsystem.I18n.VerticalSpeedUnit \"" + Subsystem.I18n.VerticalSpeedUnit + "\" in function RefreshPFDPanel is invalid.");
								break;
						}
					}
				} else {
					Show("Ctrl_PFDDefaultPanelVerticalSpeedStatus");
					ChangeText("Label_PFDDefaultPanelVerticalSpeedStatus", Translate("VerticalSpeedUnavailable"));
					AddClass("Label_PFDDefaultPanelVerticalSpeedStatus", "OrangeText");
				}

				// Heading
				Fade("Ctrl_PFDDefaultPanelHeadingStatus");
				Fade("Ctrl_PFDDefaultPanelHeadingTape");
				Fade("Ctrl_PFDDefaultPanelHeadingBalloon");
				if(PFD0.Status.GPS.IsHeadingAvailable == true) {
					Show("Ctrl_PFDDefaultPanelHeadingTape");
					Show("Ctrl_PFDDefaultPanelHeadingBalloon");
					if(System.Display.Anim > 0) {
						ChangeAnim("Ctrl_PFDDefaultPanelHeadingTape", "100ms");
					} else {
						ChangeAnim("Ctrl_PFDDefaultPanelHeadingTape", "");
					}
					ChangeRotate("CtrlGroup_PFDDefaultPanelHeadingTape", -PFD0.Stats.Heading.Display);
					ChangeText("Label_PFDDefaultPanelHeadingBalloon", Math.trunc(PFD0.Stats.Heading.Display).toString().padStart(3, "0"));
				} else {
					Show("Ctrl_PFDDefaultPanelHeadingStatus");
					ChangeText("Label_PFDDefaultPanelHeadingStatus", Translate("HeadingUnavailable"));
					AddClass("Label_PFDDefaultPanelHeadingStatus", "OrangeText");
				}

				// DME
				if(PFD.DME.IsEnabled == true && PFD0.Status.GPS.IsPositionAvailable == true) {
					Show("Ctnr_PFDDefaultPanelDME");
					if(PFD0.Stats.DME.Distance < 10000000) { // Max 10000 kilometers.
						ChangeText("Label_PFDDefaultPanelDMEDistance", ConvertUnit(PFD0.Stats.DME.Distance, "Meter", Subsystem.I18n.DistanceUnit).toFixed(1));
						if(PFD0.Stats.Speed.GSDisplay > 0 && PFD0.Stats.DME.ETA < 360000000) { // Max 100 hours.
							ChangeText("Label_PFDDefaultPanelDMEETA",
								Math.trunc(PFD0.Stats.DME.ETA / 3600000) + "<span class=\"SmallerText\">" + Translate("Hour") + "</span>" +
								Math.trunc(PFD0.Stats.DME.ETA % 3600000 / 60000).toString().padStart(2, "0") + "<span class=\"SmallerText\">" + Translate("Minute") + "</span>");
						} else {
							ChangeText("Label_PFDDefaultPanelDMEETA", "--<span class=\"SmallerText\">" + Translate("Hour") + "</span>--<span class=\"SmallerText\">" + Translate("Minute") + "</span>");
						}
					} else {
						ChangeText("Label_PFDDefaultPanelDMEDistance", Translate("DistanceTooFar"));
						ChangeText("Label_PFDDefaultPanelDMEETA", "--<span class=\"SmallerText\">" + Translate("Hour") + "</span>--<span class=\"SmallerText\">" + Translate("Minute") + "</span>");
					}
				} else {
					Fade("Ctnr_PFDDefaultPanelDME");
				}

				// Radio altitude
				if((
					(PFD.Altitude.Mode == "GPS" && PFD0.Status.GPS.IsAltitudeAvailable == true) ||
					(PFD.Altitude.Mode == "Accel" && PFD0.Status.IsAccelAvailable == true) ||
					(PFD.Altitude.Mode == "DualChannel" && (PFD0.Status.GPS.IsAltitudeAvailable == true || PFD0.Status.IsAccelAvailable == true)) ||
					PFD.Altitude.Mode == "Manual"
				) &&
				PFD0.Stats.Altitude.RadioDisplay <= 762) {
					Show("Ctnr_PFDDefaultPanelRadioAltitude");
					let ConvertedRadioAltitude = ConvertUnit(PFD0.Stats.Altitude.RadioDisplay, "Meter", Subsystem.I18n.AltitudeUnit),
					ConvertedRadioAltitudeDisplay = 0;
					switch(true) {
						case Math.abs(ConvertedRadioAltitude) >= 500:
							switch(Subsystem.I18n.AltitudeUnit) {
								case "Meter":
									ConvertedRadioAltitudeDisplay = Math.round(ConvertedRadioAltitude / 10) * 10;
									break;
								case "Feet":
								case "FeetButShowMeterBeside":
									ConvertedRadioAltitudeDisplay = Math.round(ConvertedRadioAltitude / 20) * 20;
									break;
								default:
									AlertSystemError("The value of Subsystem.I18n.AltitudeUnit \"" + Subsystem.I18n.AltitudeUnit + "\" in function RefreshPFDPanel is invalid.");
									break;
							}
							break;
						case Math.abs(ConvertedRadioAltitude) >= 100 && Math.abs(ConvertedRadioAltitude) < 500:
							switch(Subsystem.I18n.AltitudeUnit) {
								case "Meter":
									ConvertedRadioAltitudeDisplay = Math.round(ConvertedRadioAltitude / 5) * 5;
									break;
								case "Feet":
								case "FeetButShowMeterBeside":
									ConvertedRadioAltitudeDisplay = Math.round(ConvertedRadioAltitude / 10) * 10;
									break;
								default:
									AlertSystemError("The value of Subsystem.I18n.AltitudeUnit \"" + Subsystem.I18n.AltitudeUnit + "\" in function RefreshPFDPanel is invalid.");
									break;
							}
							break;
						case Math.abs(ConvertedRadioAltitude) < 100:
							switch(Subsystem.I18n.AltitudeUnit) {
								case "Meter":
									ConvertedRadioAltitudeDisplay = Math.round(ConvertedRadioAltitude);
									break;
								case "Feet":
								case "FeetButShowMeterBeside":
									ConvertedRadioAltitudeDisplay = Math.round(ConvertedRadioAltitude / 2) * 2;
									break;
								default:
									AlertSystemError("The value of Subsystem.I18n.AltitudeUnit \"" + Subsystem.I18n.AltitudeUnit + "\" in function RefreshPFDPanel is invalid.");
									break;
							}
							break;
						default:
							AlertSystemError("The value of Math.abs(ConvertedRadioAltitude) \"" + Math.abs(ConvertedRadioAltitude) + "\" in function RefreshPFDPanel is invalid.");
							break;
					}
					ChangeText("ProgringText_PFDDefaultPanelRadioAltitude", ConvertedRadioAltitudeDisplay);
					Fade("CtrlGroup_PFDDefaultPanelRadioAltitudeDialScale");
					Fade("Progring_PFDDefaultPanelRadioAltitude");
					if(Math.abs(ConvertedRadioAltitudeDisplay) < 1000) {
						Show("CtrlGroup_PFDDefaultPanelRadioAltitudeDialScale");
						if(ConvertedRadioAltitude >= 0) {
							Show("Progring_PFDDefaultPanelRadioAltitude");
							document.getElementById("ProgringFg_PFDDefaultPanelRadioAltitude").style.strokeDasharray = (Math.PI * 82) * (ConvertedRadioAltitude / 1000) + "px, " + (Math.PI * 82) * (1 - ConvertedRadioAltitude / 1000) + "px";
							if(System.Display.Anim > 0) {
								ChangeAnim("ProgringFg_PFDDefaultPanelRadioAltitude", "100ms");
							} else {
								ChangeAnim("ProgringFg_PFDDefaultPanelRadioAltitude", "");
							}
						}
					}
				} else {
					Fade("Ctnr_PFDDefaultPanelRadioAltitude");
				}

				// Decision altitude
				if((PFD.Altitude.Mode == "GPS" && PFD0.Status.GPS.IsAltitudeAvailable == true) ||
				(PFD.Altitude.Mode == "Accel" && PFD0.Status.IsAccelAvailable == true) ||
				(PFD.Altitude.Mode == "DualChannel" && (PFD0.Status.GPS.IsAltitudeAvailable == true || PFD0.Status.IsAccelAvailable == true)) ||
				PFD.Altitude.Mode == "Manual") {
					switch(PFD.FlightMode.FlightMode) {
						case "DepartureGround":
						case "TakeOff":
						case "Cruise":
							Fade("Ctnr_PFDDefaultPanelDecisionAltitude");
							break;
						case "Land":
						case "ArrivalGround":
							Show("Ctnr_PFDDefaultPanelDecisionAltitude");
							ChangeText("Label_PFDDefaultPanelDecisionAltitudeValue", Math.trunc(ConvertUnit(PFD.Altitude.AirportElevation.Arrival + PFD.Altitude.DecisionHeight, "Meter", Subsystem.I18n.AltitudeUnit)));
							if(PFD0.Status.IsDecisionAltitudeActive == true) {
								AddClass("Ctnr_PFDDefaultPanelDecisionAltitude", "Active");
								if(PFD0.Stats.ClockTime - PFD0.Stats.Altitude.DecisionTimestamp < 3000) {
									AddClass("Ctnr_PFDDefaultPanelDecisionAltitude", "Caution");
								} else {
									RemoveClass("Ctnr_PFDDefaultPanelDecisionAltitude", "Caution");
								}
							} else {
								RemoveClass("Ctnr_PFDDefaultPanelDecisionAltitude", "Active");
								RemoveClass("Ctnr_PFDDefaultPanelDecisionAltitude", "Caution");
							}
							break;
						case "EmergencyReturn":
							Show("Ctnr_PFDDefaultPanelDecisionAltitude");
							ChangeText("Label_PFDDefaultPanelDecisionAltitudeValue", Math.trunc(ConvertUnit(PFD.Altitude.AirportElevation.Departure + PFD.Altitude.DecisionHeight, "Meter", Subsystem.I18n.AltitudeUnit)));
							if(PFD0.Status.IsDecisionAltitudeActive == true) {
								AddClass("Ctnr_PFDDefaultPanelDecisionAltitude", "Active");
								if(PFD0.Stats.ClockTime - PFD0.Stats.Altitude.DecisionTimestamp < 3000) {
									AddClass("Ctnr_PFDDefaultPanelDecisionAltitude", "Caution");
								} else {
									RemoveClass("Ctnr_PFDDefaultPanelDecisionAltitude", "Caution");
								}
							} else {
								RemoveClass("Ctnr_PFDDefaultPanelDecisionAltitude", "Active");
								RemoveClass("Ctnr_PFDDefaultPanelDecisionAltitude", "Caution");
							}
							break;
						default:
							AlertSystemError("The value of PFD.FlightMode.FlightMode \"" + PFD.FlightMode.FlightMode + "\" in function RefreshPFDPanel is invalid.");
							break;
					}
				} else {
					Fade("Ctnr_PFDDefaultPanelDecisionAltitude");
				}

				// Warning
				Fade("Ctnr_PFDDefaultPanelWarning");
				if(PFD0.Alert.Active.AttitudeWarning != "") {
					Show("Ctnr_PFDDefaultPanelWarning");
					ChangeText("Label_PFDDefaultPanelWarning", Translate(PFD0.Alert.Active.AttitudeWarning));
				}
				if(PFD0.Alert.Active.SpeedWarning != "") {
					Show("Ctnr_PFDDefaultPanelWarning");
					ChangeText("Label_PFDDefaultPanelWarning", Translate(PFD0.Alert.Active.SpeedWarning));
				}
				if(PFD0.Alert.Active.AltitudeWarning != "") {
					Show("Ctnr_PFDDefaultPanelWarning");
					ChangeText("Label_PFDDefaultPanelWarning", Translate(PFD0.Alert.Active.AltitudeWarning));
				}
			}
			function RefreshHUDPanel() {
				// ???
			}
			function RefreshBocchi737Panel() {
				// ???
			}
			function RefreshAnalogGaugesPanel() {
				// ???
			}
			function RefreshAutomobileSpeedometerPanel() {
				// ???
			}

		function RefreshPFDAudio() {
			switch(Subsystem.Audio.Scheme) {
				case "Boeing":
					RefreshBoeingAudio();
					break;
				case "Airbus":
				case "Bocchi737":
					AlertSystemError("An audio scheme which is still under construction was selected.");
					break;
				default:
					AlertSystemError("The value of Subsystem.Audio.Scheme \"" + Subsystem.Audio.Scheme + "\" in function RefreshPFDAudio is invalid.");
					break;
			}
		}
			// Sub-functions
			function RefreshBoeingAudio() {
				// Attitude
				if(PFD0.Alert.Active.AttitudeWarning != PFD0.Alert.NowPlaying.AttitudeWarning) {
					switch(PFD0.Alert.Active.AttitudeWarning) {
						case "":
							StopAudio("Audio_AttitudeAlert");
							break;
						case "BankAngle":
							ChangeAudioLoop("Audio_AttitudeAlert", true);
							PlayAudio("Audio_AttitudeAlert", "audio/Common_" + PFD0.Alert.Active.AttitudeWarning + ".mp3");
							break;
						default:
							AlertSystemError("The value of PFD0.Alert.Active.AttitudeWarning \"" + PFD0.Alert.Active.AttitudeWarning + "\" in function RefreshPFDAudio is invalid.");
							break;
					}
					PFD0.Alert.NowPlaying.AttitudeWarning = PFD0.Alert.Active.AttitudeWarning;
				}

				// Speed
				if(PFD0.Alert.Active.SpeedWarning != PFD0.Alert.NowPlaying.SpeedWarning) {
					switch(PFD0.Alert.Active.SpeedWarning) {
						case "":
							StopAudio("Audio_SpeedAlert");
							break;
						case "AirspeedLow":
						case "Overspeed":
							ChangeAudioLoop("Audio_SpeedAlert", true);
							PlayAudio("Audio_SpeedAlert", "audio/Boeing_" + PFD0.Alert.Active.SpeedWarning + ".mp3");
							break;
						default:
							AlertSystemError("The value of PFD0.Alert.Active.SpeedWarning \"" + PFD0.Alert.Active.SpeedWarning + "\" in function RefreshPFDAudio is invalid.");
							break;
					}
					PFD0.Alert.NowPlaying.SpeedWarning = PFD0.Alert.Active.SpeedWarning;
				}

				// Altitude
				if(PFD0.Alert.Active.AltitudeWarning != PFD0.Alert.NowPlaying.AltitudeWarning) {
					switch(PFD0.Alert.Active.AltitudeWarning) {
						case "":
							StopAudio("Audio_AltitudeAlert");
							break;
						case "DontSink":
						case "GlideSlope":
						case "SinkRate":
						case "PullUp":
							ChangeAudioLoop("Audio_AltitudeAlert", true);
							PlayAudio("Audio_AltitudeAlert", "audio/Common_" + PFD0.Alert.Active.AltitudeWarning + ".mp3");
							break;
						default:
							AlertSystemError("The value of PFD0.Alert.Active.AltitudeWarning \"" + PFD0.Alert.Active.AltitudeWarning + "\" in function RefreshPFDAudio is invalid.");
							break;
					}
					PFD0.Alert.NowPlaying.AltitudeWarning = PFD0.Alert.Active.AltitudeWarning;
				}
				if(PFD0.Alert.Active.AltitudeCallout != PFD0.Alert.NowPlaying.AltitudeCallout && PFD0.Alert.Active.AltitudeWarning == "") {
					switch(PFD0.Alert.Active.AltitudeCallout) {
						case "":
						case "HundredAbove":
						case "Retard":
							break;
						case "2500":
						case "1000":
						case "500":
						case "400":
						case "300":
						case "200":
						case "100":
						case "50":
						case "40":
						case "30":
						case "20":
						case "10":
						case "ApproachingMinimums":
						case "Minimums":
							ChangeAudioLoop("Audio_AltitudeAlert", false);
							PlayAudio("Audio_AltitudeAlert", "audio/Boeing_" + PFD0.Alert.Active.AltitudeCallout + ".mp3");
							break;
						default:
							AlertSystemError("The value of PFD0.Alert.Active.AltitudeCallout \"" + PFD0.Alert.Active.AltitudeCallout + "\" in function RefreshPFDAudio is invalid.");
							break;
					}
					PFD0.Alert.NowPlaying.AltitudeCallout = PFD0.Alert.Active.AltitudeCallout;
				}
			}
			function RefreshAirbusAudio() {
				// ???
			}
			function RefreshBocchi737Audio() {
				// ???
			}

		function RefreshTechInfo() {
			// GPS
			if(PFD0.RawData.GPS.Position.Lat != null) {
				ChangeText("Label_PFDTechInfoLat", PFD0.RawData.GPS.Position.Lat.toFixed(5));
			} else {
				ChangeText("Label_PFDTechInfoLat", "N/A");
			}
			if(PFD0.RawData.GPS.Position.Lon != null) {
				ChangeText("Label_PFDTechInfoLon", PFD0.RawData.GPS.Position.Lon.toFixed(5));
			} else {
				ChangeText("Label_PFDTechInfoLon", "N/A");
			}
			if(PFD0.RawData.GPS.Position.Accuracy != null) {
				ChangeText("Label_PFDTechInfoPositionAccuracy", PFD0.RawData.GPS.Position.Accuracy.toFixed(2) + "米");
			} else {
				ChangeText("Label_PFDTechInfoPositionAccuracy", "N/A");
			}
			if(PFD0.RawData.GPS.Speed != null) {
				ChangeText("Label_PFDTechInfoGPSSpeed", PFD0.RawData.GPS.Speed.toFixed(2) + "米/秒");
			} else {
				ChangeText("Label_PFDTechInfoGPSSpeed", "N/A");
			}
			if(PFD0.RawData.GPS.Altitude.Altitude != null) {
				ChangeText("Label_PFDTechInfoGPSAltitude", PFD0.RawData.GPS.Altitude.Altitude.toFixed(2) + "米");
			} else {
				ChangeText("Label_PFDTechInfoGPSAltitude", "N/A");
			}
			if(PFD0.RawData.GPS.Altitude.Accuracy != null) {
				ChangeText("Label_PFDTechInfoAltitudeAccuracy", PFD0.RawData.GPS.Altitude.Accuracy.toFixed(2) + "米");
			} else {
				ChangeText("Label_PFDTechInfoAltitudeAccuracy", "N/A");
			}
			if(PFD0.RawData.GPS.Heading != null) {
				ChangeText("Label_PFDTechInfoHeading", PFD0.RawData.GPS.Heading.toFixed(2) + "度");
			} else {
				ChangeText("Label_PFDTechInfoHeading", "N/A");
			}
			ChangeText("Label_PFDTechInfoGPSTimestamp", PFD0.RawData.GPS.Timestamp + " (+" + (PFD0.Stats.ClockTime - PFD0.RawData.GPS.Timestamp) + ")");

			// Accel
			if(PFD0.RawData.Accel.Accel.Absolute.X != null) {
				ChangeText("Label_PFDTechInfoAbsoluteXAxis", PFD0.RawData.Accel.Accel.Absolute.X.toFixed(2) + "m/s²");
			} else {
				ChangeText("Label_PFDTechInfoAbsoluteXAxis", "N/A");
			}
			if(PFD0.RawData.Accel.Accel.Absolute.Y != null) {
				ChangeText("Label_PFDTechInfoAbsoluteYAxis", PFD0.RawData.Accel.Accel.Absolute.Y.toFixed(2) + "m/s²");
			} else {
				ChangeText("Label_PFDTechInfoAbsoluteYAxis", "N/A");
			}
			if(PFD0.RawData.Accel.Accel.Absolute.Z != null) {
				ChangeText("Label_PFDTechInfoAbsoluteZAxis", PFD0.RawData.Accel.Accel.Absolute.Z.toFixed(2) + "m/s²");
			} else {
				ChangeText("Label_PFDTechInfoAbsoluteZAxis", "N/A");
			}
			if(PFD0.RawData.Accel.Accel.AbsoluteWithGravity.X != null) {
				ChangeText("Label_PFDTechInfoAbsoluteXAxisWithGravity", PFD0.RawData.Accel.Accel.AbsoluteWithGravity.X.toFixed(2) + "m/s²");
			} else {
				ChangeText("Label_PFDTechInfoAbsoluteXAxisWithGravity", "N/A");
			}
			if(PFD0.RawData.Accel.Accel.AbsoluteWithGravity.Y != null) {
				ChangeText("Label_PFDTechInfoAbsoluteYAxisWithGravity", PFD0.RawData.Accel.Accel.AbsoluteWithGravity.Y.toFixed(2) + "m/s²");
			} else {
				ChangeText("Label_PFDTechInfoAbsoluteYAxisWithGravity", "N/A");
			}
			if(PFD0.RawData.Accel.Accel.AbsoluteWithGravity.Z != null) {
				ChangeText("Label_PFDTechInfoAbsoluteZAxisWithGravity", PFD0.RawData.Accel.Accel.AbsoluteWithGravity.Z.toFixed(2) + "m/s²");
			} else {
				ChangeText("Label_PFDTechInfoAbsoluteZAxisWithGravity", "N/A");
			}
			ChangeText("Label_PFDTechInfoScreenOrientation", screen.orientation.type);
			ChangeText("Label_PFDTechInfoRelativeForward", PFD0.RawData.Accel.Accel.Relative.Forward.toFixed(2) + "m/s²");
			ChangeText("Label_PFDTechInfoRelativeRight", PFD0.RawData.Accel.Accel.Relative.Right.toFixed(2) + "m/s²");
			ChangeText("Label_PFDTechInfoRelativeUpward", PFD0.RawData.Accel.Accel.Relative.Upward.toFixed(2) + "m/s²");
			ChangeText("Label_PFDTechInfoRelativeForwardWithGravity", PFD0.RawData.Accel.Accel.RelativeWithGravity.Forward.toFixed(2) + "m/s²");
			ChangeText("Label_PFDTechInfoRelativeRightWithGravity", PFD0.RawData.Accel.Accel.RelativeWithGravity.Right.toFixed(2) + "m/s²");
			ChangeText("Label_PFDTechInfoRelativeUpwardWithGravity", PFD0.RawData.Accel.Accel.RelativeWithGravity.Upward.toFixed(2) + "m/s²");
			ChangeText("Label_PFDTechInfoAlignedForward", PFD0.RawData.Accel.Accel.Aligned.Forward.toFixed(2) + "m/s²");
			ChangeText("Label_PFDTechInfoAlignedRight", PFD0.RawData.Accel.Accel.Aligned.Right.toFixed(2) + "m/s²");
			ChangeText("Label_PFDTechInfoAlignedUpward", PFD0.RawData.Accel.Accel.Aligned.Upward.toFixed(2) + "m/s²");
			ChangeText("Label_PFDTechInfoAccelPitch", PFD0.RawData.Accel.Attitude.Original.Pitch.toFixed(2) + "度");
			ChangeText("Label_PFDTechInfoAccelRoll", PFD0.RawData.Accel.Attitude.Original.Roll.toFixed(2) + "度");
			ChangeText("Label_PFDTechInfoAlignedPitch", PFD0.RawData.Accel.Attitude.Aligned.Pitch.toFixed(2) + "度");
			ChangeText("Label_PFDTechInfoAlignedRoll", PFD0.RawData.Accel.Attitude.Aligned.Roll.toFixed(2) + "度");
			ChangeText("Label_PFDTechInfoSpeedVectorForward", PFD0.RawData.Accel.Speed.Vector.Forward.toFixed(2) + "米/秒");
			ChangeText("Label_PFDTechInfoSpeedVectorRight", PFD0.RawData.Accel.Speed.Vector.Right.toFixed(2) + "米/秒");
			ChangeText("Label_PFDTechInfoSpeedVectorUpward", PFD0.RawData.Accel.Speed.Vector.Upward.toFixed(2) + "米/秒");
			let NeedleAngle = 0, NeedleLength = 0;
			NeedleAngle = Math.atan2(PFD0.RawData.Accel.Speed.Vector.Forward, PFD0.RawData.Accel.Speed.Vector.Right) / (Math.PI / 180);
			NeedleLength = Math.sqrt(Math.pow(PFD0.RawData.Accel.Speed.Vector.Right, 2) + Math.pow(PFD0.RawData.Accel.Speed.Vector.Forward, 2)) * 5;
			ChangeTop("Needle_PFDTechInfoSpeedVectorGraph", "calc(50% - " + NeedleLength + "px)");
			ChangeRotate("Needle_PFDTechInfoSpeedVectorGraph", 90 - NeedleAngle);
			ChangeHeight("Needle_PFDTechInfoSpeedVectorGraph", NeedleLength * 2 + "px");
			ChangeText("Label_PFDTechInfoAccelSpeed", PFD0.RawData.Accel.Speed.Speed.toFixed(2) + "米/秒");
			ChangeText("Label_PFDTechInfoAccelAltitude", PFD0.RawData.Accel.Altitude.toFixed(2) + "米");
			if(PFD0.RawData.Accel.Interval != null) {
				ChangeText("Label_PFDTechInfoAccelInterval", PFD0.RawData.Accel.Interval + "毫秒");
			} else {
				ChangeText("Label_PFDTechInfoAccelInterval", "N/A");
			}
			ChangeText("Label_PFDTechInfoAccelTimestamp", PFD0.RawData.Accel.Timestamp + " (+" + (PFD0.Stats.ClockTime - PFD0.RawData.Accel.Timestamp) + ")");

			// Manual
			ChangeText("Label_PFDTechInfoManualPitch", PFD0.RawData.Manual.Attitude.Pitch.toFixed(2) + "度");
			ChangeText("Label_PFDTechInfoManualRoll", PFD0.RawData.Manual.Attitude.Roll.toFixed(2) + "度");
			ChangeText("Label_PFDTechInfoManualSpeed", PFD0.RawData.Manual.Speed.toFixed(2) + "米/秒");
			ChangeText("Label_PFDTechInfoManualAltitude", PFD0.RawData.Manual.Altitude.toFixed(2) + "米");
		}

	function RefreshPFD() {
		// Call
		ClockPFD();

		// PFD
			// Panel
			switch(Subsystem.Display.PFDStyle) {
				case "Default":
					if(PFD.Flaps > 0) {
						ChangeText("Label_PFDDefaultPanelFlapsValue", PFD.Flaps + "%");
					} else {
						ChangeText("Label_PFDDefaultPanelFlapsValue", Translate("FlapsUp"));
					}
					ChangeProgbar("ProgbarFg_PFDDefaultPanelFlaps", "Vertical", PFD.Flaps);
					if(PFD.Attitude.IsEnabled == true) {
						Show("Ctrl_PFDDefaultPanelAttitudeMode");
						ChangeText("Label_PFDDefaultPanelAttitudeModeValue", Translate(PFD.Attitude.Mode));
					} else {
						Hide("Ctrl_PFDDefaultPanelAttitudeMode");
					}
					ChangeText("Label_PFDDefaultPanelSpeedModeValue", Translate(PFD.Speed.Mode));
					ChangeText("Label_PFDDefaultPanelAltitudeModeValue", Translate(PFD.Altitude.Mode));
					break;
				case "HUD":
				case "Bocchi737":
				case "AnalogGauges":
				case "AutomobileSpeedometer":
					AlertSystemError("A PFD style which is still under construction was selected.");
					break;
				default:
					AlertSystemError("The value of Subsystem.Display.PFDStyle \"" + Subsystem.Display.PFDStyle + "\" in function RefreshPFD is invalid.");
					break;
			}

			// Menu
				// Ctrl
				if(PFD.Attitude.Mode == "Manual" || PFD.Speed.Mode == "Manual" || PFD.Altitude.Mode == "Manual") {
					Show("Ctrl_PFDManualManeuver");
					if(PFD.Attitude.Mode == "Manual") {
						ChangeDisabled("Button_PFDPitchDown", false);
						ChangeDisabled("Button_PFDPitchUp", false);
						ChangeDisabled("Button_PFDRollLeft", false);
						ChangeDisabled("Button_PFDRollRight", false);
					} else {
						ChangeDisabled("Button_PFDPitchDown", true);
						ChangeDisabled("Button_PFDPitchUp", true);
						ChangeDisabled("Button_PFDRollLeft", true);
						ChangeDisabled("Button_PFDRollRight", true);
					}
					if(PFD.Speed.Mode == "Manual") {
						ChangeDisabled("Button_PFDSpeedUp", false);
						ChangeDisabled("Button_PFDSpeedDown", false);
					} else {
						ChangeDisabled("Button_PFDSpeedUp", true);
						ChangeDisabled("Button_PFDSpeedDown", true);
					}
					if(PFD.Altitude.Mode == "Manual") {
						ChangeDisabled("Button_PFDAltitudeUp", false);
						ChangeDisabled("Button_PFDAltitudeDown", false);
					} else {
						ChangeDisabled("Button_PFDAltitudeUp", true);
						ChangeDisabled("Button_PFDAltitudeDown", true);
					}
				} else {
					Hide("Ctrl_PFDManualManeuver");
				}
				if(PFD.Flaps > 0) {
					ChangeText("Label_PFDFlaps", PFD.Flaps + "%");
				} else {
					ChangeText("Label_PFDFlaps", Translate("FlapsUp"));
				}
				ChangeValue("Slider_PFDFlaps", PFD.Flaps);

				// Options
				ChangeChecked("Checkbox_PFDOptionsEnableAttitudeIndicator", PFD.Attitude.IsEnabled);
				if(PFD.Attitude.IsEnabled == true) {
					Show("Ctrl_PFDOptionsAttitudeMode");
				} else {
					Hide("Ctrl_PFDOptionsAttitudeMode");
				}
				ChangeValue("Combobox_PFDOptionsAttitudeMode", PFD.Attitude.Mode);
				ChangeValue("Combobox_PFDOptionsSpeedMode", PFD.Speed.Mode);
				ChangeValue("Combobox_PFDOptionsAltitudeMode", PFD.Altitude.Mode);
				ChangeChecked("Checkbox_PFDOptionsEnableDME", PFD.DME.IsEnabled);
				ChangeValue("Combobox_PFDOptionsFlightMode", PFD.FlightMode.FlightMode);
				ChangeChecked("Checkbox_PFDOptionsFlipPFDVertically", Subsystem.Display.FlipPFDVertically);
				ChangeChecked("Checkbox_PFDOptionsKeepScreenOn", Subsystem.Display.KeepScreenOn);

		// Settings
			// Attitude
			ChangeChecked("Checkbox_SettingsEnableAttitudeIndicator", PFD.Attitude.IsEnabled);
			if(PFD.Attitude.IsEnabled == true) {
				Show("Ctrl_SettingsAttitudeMode");
				Show("Label_SettingsAttitudeOffset");
				Show("Label_SettingsAttitudeOffsetInfo");
				Show("Ctrl_SettingsAttitudeOffsetPitch");
				Show("Ctrl_SettingsAttitudeOffsetRoll");
				ChangeValue("Combobox_SettingsAttitudeMode", PFD.Attitude.Mode);
				ChangeValue("Textbox_SettingsAttitudeOffsetPitch", PFD.Attitude.Offset.Pitch);
				ChangeValue("Textbox_SettingsAttitudeOffsetRoll", PFD.Attitude.Offset.Roll);
			} else {
				Hide("Ctrl_SettingsAttitudeMode");
				Hide("Label_SettingsAttitudeOffset");
				Hide("Label_SettingsAttitudeOffsetInfo");
				Hide("Ctrl_SettingsAttitudeOffsetPitch");
				Hide("Ctrl_SettingsAttitudeOffsetRoll");
			}

			// Speed
			ChangeValue("Combobox_SettingsSpeedMode", PFD.Speed.Mode);
			ChangeValue("Combobox_SettingsIASAlgorithm", PFD.Speed.IASAlgorithm);
			ChangeValue("Textbox_SettingsAirportTemperatureDeparture", ConvertUnit(PFD.Speed.AirportTemperature.Departure, "Kelvin", Subsystem.I18n.TemperatureUnit).toFixed(0));
			ChangeValue("Textbox_SettingsAirportTemperatureArrival", ConvertUnit(PFD.Speed.AirportTemperature.Arrival, "Kelvin", Subsystem.I18n.TemperatureUnit).toFixed(0));
			if(PFD.Speed.AirportTemperature.Departure != PFD.Speed.AirportTemperature.Arrival) {
				ChangeDisabled("Button_SettingsAirportTemperatureSwap", false);
			} else {
				ChangeDisabled("Button_SettingsAirportTemperatureSwap", true);
			}
			switch(PFD.Speed.IASAlgorithm) {
				case "SimpleAlgorithm":
				case "UseTASDirectly":
					Hide("Ctrl_SettingsRelativeHumidity");
					Hide("Ctrl_SettingsRelativeHumiditySwap");
					Hide("Ctrl_SettingsQNH");
					Hide("Ctrl_SettingsQNHSwap");
					break;
				case "AdvancedAlgorithmA":
				case "AdvancedAlgorithmB":
					Show("Ctrl_SettingsRelativeHumidity");
					Show("Ctrl_SettingsRelativeHumiditySwap");
					Show("Ctrl_SettingsQNH");
					Show("Ctrl_SettingsQNHSwap");
					ChangeValue("Textbox_SettingsRelativeHumidityDeparture", PFD.Speed.RelativeHumidity.Departure);
					ChangeValue("Textbox_SettingsRelativeHumidityArrival", PFD.Speed.RelativeHumidity.Arrival);
					if(PFD.Speed.RelativeHumidity.Departure != PFD.Speed.RelativeHumidity.Arrival) {
						ChangeDisabled("Button_SettingsRelativeHumiditySwap", false);
					} else {
						ChangeDisabled("Button_SettingsRelativeHumiditySwap", true);
					}
					ChangeValue("Textbox_SettingsQNHDeparture", ConvertUnit(PFD.Speed.QNH.Departure, "Hectopascal", Subsystem.I18n.PressureUnit).toFixed(2));
					ChangeValue("Textbox_SettingsQNHArrival", ConvertUnit(PFD.Speed.QNH.Arrival, "Hectopascal", Subsystem.I18n.PressureUnit).toFixed(2));
					if(PFD.Speed.QNH.Departure != PFD.Speed.QNH.Arrival) {
						ChangeDisabled("Button_SettingsQNHSwap", false);
					} else {
						ChangeDisabled("Button_SettingsQNHSwap", true);
					}
					break;
				default:
					AlertSystemError("The value of PFD.Speed.IASAlgorithm \"" + PFD.Speed.IASAlgorithm + "\" in function RefreshPFD is invalid.");
					break;
			}
			ChangeValue("Textbox_SettingsWindDirection", PFD.Speed.Wind.Direction);
			ChangeValue("Textbox_SettingsWindSpeed", ConvertUnit(PFD.Speed.Wind.Speed, "MeterPerSec", Subsystem.I18n.SpeedUnit).toFixed(0));
			if(PFD.Speed.Wind.Direction > 0 || PFD.Speed.Wind.Speed > 0) {
				ChangeDisabled("Button_SettingsWindReset", false);
			} else {
				ChangeDisabled("Button_SettingsWindReset", true);
			}
			switch(true) {
				case PFD.Speed.SpeedLimit.Min == 0 && PFD.Speed.SpeedLimit.MaxOnFlapsUp == 277.5 && PFD.Speed.SpeedLimit.MaxOnFlapsFull == 277.5:
					ChangeValue("Combobox_SettingsSpeedLimitPreset", "NoSpeedLimits");
					break;
				case PFD.Speed.SpeedLimit.Min == 61.728 && PFD.Speed.SpeedLimit.MaxOnFlapsUp == 174.896 && PFD.Speed.SpeedLimit.MaxOnFlapsFull == 83.3328:
					ChangeValue("Combobox_SettingsSpeedLimitPreset", "Boeing737-800");
					break;
				case PFD.Speed.SpeedLimit.Min == 61.728 && PFD.Speed.SpeedLimit.MaxOnFlapsUp == 180.04 && PFD.Speed.SpeedLimit.MaxOnFlapsFull == 91.0488:
					ChangeValue("Combobox_SettingsSpeedLimitPreset", "AirbusA320");
					break;
				case PFD.Speed.SpeedLimit.Min == 0 && PFD.Speed.SpeedLimit.MaxOnFlapsUp == 33.33333 && PFD.Speed.SpeedLimit.MaxOnFlapsFull == 33.33333:
					ChangeValue("Combobox_SettingsSpeedLimitPreset", "GroundVehicle");
					break;
				default:
					ChangeValue("Combobox_SettingsSpeedLimitPreset", "");
					break;
			}
			ChangeValue("Textbox_SettingsSpeedLimitMin", ConvertUnit(PFD.Speed.SpeedLimit.Min, "MeterPerSec", Subsystem.I18n.SpeedUnit).toFixed(0));
			ChangeValue("Textbox_SettingsSpeedLimitMaxOnFlapsUp", ConvertUnit(PFD.Speed.SpeedLimit.MaxOnFlapsUp, "MeterPerSec", Subsystem.I18n.SpeedUnit).toFixed(0));
			ChangeValue("Textbox_SettingsSpeedLimitMaxOnFlapsFull", ConvertUnit(PFD.Speed.SpeedLimit.MaxOnFlapsFull, "MeterPerSec", Subsystem.I18n.SpeedUnit).toFixed(0));

			// Altitude
			ChangeValue("Combobox_SettingsAltitudeMode", PFD.Altitude.Mode);
			ChangeValue("Textbox_SettingsAirportElevationDeparture", ConvertUnit(PFD.Altitude.AirportElevation.Departure, "Meter", Subsystem.I18n.AltitudeUnit).toFixed(0));
			ChangeValue("Textbox_SettingsAirportElevationArrival", ConvertUnit(PFD.Altitude.AirportElevation.Arrival, "Meter", Subsystem.I18n.AltitudeUnit).toFixed(0));
			if(PFD.Altitude.AirportElevation.Departure != PFD.Altitude.AirportElevation.Arrival) {
				ChangeDisabled("Button_SettingsAirportElevationSwap", false);
			} else {
				ChangeDisabled("Button_SettingsAirportElevationSwap", true);
			}
			ChangeValue("Textbox_SettingsDecisionHeight", ConvertUnit(PFD.Altitude.DecisionHeight, "Meter", Subsystem.I18n.AltitudeUnit).toFixed(0));

			// DME
			ChangeChecked("Checkbox_SettingsEnableDME", PFD.DME.IsEnabled);
			if(PFD.DME.IsEnabled == true) {
				Show("Label_SettingsAirportCoordinates");
				Show("Label_SettingsAirportCoordinatesInfo");
				Show("Ctrl_SettingsAirportCoordinatesDeparture");
				Show("Ctrl_SettingsAirportCoordinatesArrival");
				Show("Ctrl_SettingsAirportCoordinatesSwap");
				Show("Label_SettingsETA");
				Show("Ctrl_SettingsETACalcMethod");
				Show("Ctrl_SettingsSwitchDistanceUnit");
				ChangeValue("Textbox_SettingsAirportCoordinatesDepartureLat", PFD.DME.AirportCoordinates.Departure.Lat.toFixed(5));
				ChangeValue("Textbox_SettingsAirportCoordinatesDepartureLon", PFD.DME.AirportCoordinates.Departure.Lon.toFixed(5));
				ChangeValue("Textbox_SettingsAirportCoordinatesArrivalLat", PFD.DME.AirportCoordinates.Arrival.Lat.toFixed(5));
				ChangeValue("Textbox_SettingsAirportCoordinatesArrivalLon", PFD.DME.AirportCoordinates.Arrival.Lon.toFixed(5));
				if(PFD.DME.AirportCoordinates.Departure.Lat != PFD.DME.AirportCoordinates.Arrival.Lat || PFD.DME.AirportCoordinates.Departure.Lon != PFD.DME.AirportCoordinates.Arrival.Lon) {
					ChangeDisabled("Button_SettingsAirportCoordinatesSwap", false);
				} else {
					ChangeDisabled("Button_SettingsAirportCoordinatesSwap", true);
				}
				ChangeValue("Combobox_SettingsETACalcMethod", PFD.DME.ETACalcMethod);
			} else {
				Hide("Label_SettingsAirportCoordinates");
				Hide("Label_SettingsAirportCoordinatesInfo");
				Hide("Ctrl_SettingsAirportCoordinatesDeparture");
				Hide("Ctrl_SettingsAirportCoordinatesArrival");
				Hide("Ctrl_SettingsAirportCoordinatesSwap");
				Hide("Label_SettingsETA");
				Hide("Ctrl_SettingsETACalcMethod");
				Hide("Ctrl_SettingsSwitchDistanceUnit");
			}

			// Flight mode
			ChangeValue("Combobox_SettingsFlightMode", PFD.FlightMode.FlightMode);
			ChangeChecked("Checkbox_SettingsAutoSwitchFlightModeAndSwapAirportData", PFD.FlightMode.AutoSwitchFlightModeAndSwapAirportData);

		// Save user data
		localStorage.setItem("GPSPFD_PFD", JSON.stringify(PFD));
	}
	function RefreshGPSData(GeolocationAPIData) { // https://www.freecodecamp.org/news/how-to-use-the-javascript-geolocation-api/
		// GPS data
		PFD0.RawData.GPS = {
			Position: {
				Lat: GeolocationAPIData.coords.latitude,
				Lon: GeolocationAPIData.coords.longitude,
				Accuracy: GeolocationAPIData.coords.accuracy
			},
			Speed: GeolocationAPIData.coords.speed,
			Altitude: {
				Altitude: GeolocationAPIData.coords.altitude,
				Accuracy: GeolocationAPIData.coords.altitudeAccuracy
			},
			Heading: GeolocationAPIData.coords.heading,
			Timestamp: GeolocationAPIData.timestamp
		};

		// Replace accel data
		switch(PFD.Speed.Mode) {
			case "GPS":
			case "Accel":
			case "Manual":
				break;
			case "DualChannel":
				if(PFD0.RawData.GPS.Speed != null) {
					let ProportionVertor = 0;
					if(PFD0.RawData.Accel.Speed.Speed > 0) {
						ProportionVertor = {
							Forward: PFD0.RawData.Accel.Speed.Vector.Forward / PFD0.RawData.Accel.Speed.Speed,
							Right: PFD0.RawData.Accel.Speed.Vector.Right / PFD0.RawData.Accel.Speed.Speed,
							Upward: PFD0.RawData.Accel.Speed.Vector.Upward / PFD0.RawData.Accel.Speed.Speed
						};
					} else {
						ProportionVertor = {
							Forward: 0, Right: 0, Upward: 0
						};
					}
					PFD0.RawData.Accel.Speed.Speed = PFD0.RawData.GPS.Speed;
					PFD0.RawData.Accel.Speed.Vector = {
						Forward: PFD0.RawData.Accel.Speed.Speed * ProportionVertor.Forward,
						Right: PFD0.RawData.Accel.Speed.Speed * ProportionVertor.Right,
						Upward: PFD0.RawData.Accel.Speed.Speed * ProportionVertor.Upward
					};
				}
				break;
			default:
				AlertSystemError("The value of PFD.Speed.Mode \"" + PFD.Speed.Mode + "\" in function RefreshGPSData is invalid.");
				break;
		}
		switch(PFD.Altitude.Mode) {
			case "GPS":
			case "Accel":
			case "Manual":
				break;
			case "DualChannel":
				if(PFD0.RawData.GPS.Altitude.Altitude != null) {
					PFD0.RawData.Accel.Altitude = PFD0.RawData.GPS.Altitude.Altitude;
				}
				break;
			default:
				AlertSystemError("The value of PFD.Altitude.Mode \"" + PFD.Altitude.Mode + "\" in function RefreshGPSData is invalid.");
				break;
		}
	}
	function RefreshAccelData(DeviceMotionAPIData) { // https://medium.com/@kamresh485/understanding-the-device-motion-event-api-0ce5b3e252f1
		// Absolute accel
		PFD0.RawData.Accel.Accel.Absolute = {
			X: DeviceMotionAPIData.acceleration.x,
			Y: DeviceMotionAPIData.acceleration.y,
			Z: DeviceMotionAPIData.acceleration.z
		};
		PFD0.RawData.Accel.Accel.AbsoluteWithGravity = {
			X: DeviceMotionAPIData.accelerationIncludingGravity.x,
			Y: DeviceMotionAPIData.accelerationIncludingGravity.y,
			Z: DeviceMotionAPIData.accelerationIncludingGravity.z
		};

		// Interval
		PFD0.RawData.Accel.Interval = DeviceMotionAPIData.interval;

		// Relative accel
		switch(screen.orientation.type) {
			case "landscape-primary":
				PFD0.RawData.Accel.Accel.Relative = {
					Forward: PFD0.RawData.Accel.Accel.Absolute.Z,
					Right: PFD0.RawData.Accel.Accel.Absolute.Y,
					Upward: -PFD0.RawData.Accel.Accel.Absolute.X
				};
				PFD0.RawData.Accel.Accel.RelativeWithGravity = {
					Forward: PFD0.RawData.Accel.Accel.AbsoluteWithGravity.Z,
					Right: PFD0.RawData.Accel.Accel.AbsoluteWithGravity.Y,
					Upward: -PFD0.RawData.Accel.Accel.AbsoluteWithGravity.X
				};
				break;
			case "landscape-secondary":
				PFD0.RawData.Accel.Accel.Relative = {
					Forward: PFD0.RawData.Accel.Accel.Absolute.Z,
					Right: -PFD0.RawData.Accel.Accel.Absolute.Y,
					Upward: PFD0.RawData.Accel.Accel.Absolute.X
				};
				PFD0.RawData.Accel.Accel.RelativeWithGravity = {
					Forward: PFD0.RawData.Accel.Accel.AbsoluteWithGravity.Z,
					Right: -PFD0.RawData.Accel.Accel.AbsoluteWithGravity.Y,
					Upward: PFD0.RawData.Accel.Accel.AbsoluteWithGravity.X
				};
				break;
			case "portrait-primary":
				PFD0.RawData.Accel.Accel.Relative = {
					Forward: PFD0.RawData.Accel.Accel.Absolute.Z,
					Right: -PFD0.RawData.Accel.Accel.Absolute.X,
					Upward: -PFD0.RawData.Accel.Accel.Absolute.Y
				};
				PFD0.RawData.Accel.Accel.RelativeWithGravity = {
					Forward: PFD0.RawData.Accel.Accel.AbsoluteWithGravity.Z,
					Right: -PFD0.RawData.Accel.Accel.AbsoluteWithGravity.X,
					Upward: -PFD0.RawData.Accel.Accel.AbsoluteWithGravity.Y
				};
				break;
			case "portrait-secondary":
				PFD0.RawData.Accel.Accel.Relative = {
					Forward: PFD0.RawData.Accel.Accel.Absolute.Z,
					Right: PFD0.RawData.Accel.Accel.Absolute.X,
					Upward: PFD0.RawData.Accel.Accel.Absolute.Y
				};
				PFD0.RawData.Accel.Accel.RelativeWithGravity = {
					Forward: PFD0.RawData.Accel.Accel.AbsoluteWithGravity.Z,
					Right: PFD0.RawData.Accel.Accel.AbsoluteWithGravity.X,
					Upward: PFD0.RawData.Accel.Accel.AbsoluteWithGravity.Y
				};
				break;
			default:
				AlertSystemError("The value of screen.orientation.type \"" + screen.orientation.type + "\" in function RefreshAccelData is invalid.");
				break;
		}

		// Attitude
		PFD0.RawData.Accel.Attitude.Original = CalcAttitude(PFD0.RawData.Accel.Accel.Relative, PFD0.RawData.Accel.Accel.RelativeWithGravity);
		PFD0.RawData.Accel.Attitude.Aligned = {
			Pitch: PFD0.RawData.Accel.Attitude.Original.Pitch + PFD.Attitude.Offset.Pitch,
			Roll: PFD0.RawData.Accel.Attitude.Original.Roll + PFD.Attitude.Offset.Roll
		};

		// Aligned accel
			// Convert to opposite and align orientation
			PFD0.RawData.Accel.Accel.Aligned = {
				Forward: -PFD0.RawData.Accel.Accel.Relative.Forward * Math.cos(Math.abs(PFD0.RawData.Accel.Attitude.Original.Pitch * (Math.PI / 180))),
				Right: -PFD0.RawData.Accel.Accel.Relative.Right * Math.cos(Math.abs(PFD0.RawData.Accel.Attitude.Original.Roll * (Math.PI / 180))),
				Upward: -PFD0.RawData.Accel.Accel.Relative.Upward * Math.cos(Math.abs(PFD0.RawData.Accel.Attitude.Original.Roll * (Math.PI / 180))) * Math.cos(Math.abs(PFD0.RawData.Accel.Attitude.Original.Pitch * (Math.PI / 180)))
			};

			// Reduce sensitivity to prevent incorrect speed inflation
			if(Math.abs(PFD0.RawData.Accel.Accel.Aligned.Forward) < 1) {
				PFD0.RawData.Accel.Accel.Aligned.Forward = 0;
			}
			if(Math.abs(PFD0.RawData.Accel.Accel.Aligned.Right) < 1) {
				PFD0.RawData.Accel.Accel.Aligned.Right = 0;
			}
			if(Math.abs(PFD0.RawData.Accel.Accel.Aligned.Upward) < 1) {
				PFD0.RawData.Accel.Accel.Aligned.Upward = 0;
			}

		// Speed and altitude
		PFD0.RawData.Accel.Speed.Vector = {
			Forward: PFD0.RawData.Accel.Speed.Vector.Forward + PFD0.RawData.Accel.Accel.Aligned.Forward * (PFD0.RawData.Accel.Interval / 1000),
			Right: PFD0.RawData.Accel.Speed.Vector.Right + PFD0.RawData.Accel.Accel.Aligned.Right * (PFD0.RawData.Accel.Interval / 1000),
			Upward: PFD0.RawData.Accel.Speed.Vector.Upward + PFD0.RawData.Accel.Accel.Aligned.Upward * (PFD0.RawData.Accel.Interval / 1000)
		}
		PFD0.RawData.Accel.Speed.Speed = Math.sqrt(Math.pow(PFD0.RawData.Accel.Speed.Vector.Forward, 2) + Math.pow(PFD0.RawData.Accel.Speed.Vector.Right, 2) + Math.pow(PFD0.RawData.Accel.Speed.Vector.Upward, 2));
		PFD0.RawData.Accel.Altitude += PFD0.RawData.Accel.Speed.Vector.Upward * (PFD0.RawData.Accel.Interval / 1000);

		// Timestamp
		PFD0.RawData.Accel.Timestamp = Date.now();
	}
	function ClockAvgSpeeds() {
		// Automation
		clearTimeout(Automation.ClockAvgSpeeds);
		Automation.ClockAvgSpeeds = setTimeout(ClockAvgSpeeds, 20);

		// Main
		if((PFD.Speed.Mode == "GPS" && PFD0.Status.GPS.IsSpeedAvailable == true) ||
		(PFD.Speed.Mode == "Accel" && PFD0.Status.IsAccelAvailable == true) ||
		(PFD.Speed.Mode == "DualChannel" && (PFD0.Status.GPS.IsSpeedAvailable == true || PFD0.Status.IsAccelAvailable == true)) ||
		PFD.Speed.Mode == "Manual") {
			PFD0.Stats.Speed.SampleCount++;
			PFD0.Stats.Speed.AvgGS = (PFD0.Stats.Speed.AvgGS * (PFD0.Stats.Speed.SampleCount - 1) + PFD0.Stats.Speed.GS) / PFD0.Stats.Speed.SampleCount;
			PFD0.Stats.Speed.AvgIAS = (PFD0.Stats.Speed.AvgIAS * (PFD0.Stats.Speed.SampleCount - 1) + PFD0.Stats.Speed.IAS) / PFD0.Stats.Speed.SampleCount;
		}
	}

// Cmds
	// PFD
		// Menu
		function ForceHidePFDMenu() {
			setTimeout(function() { // Because the close button is inside the window, clicking the close button also triggers showing the window. So a delay should be set here.
				HideToCorner("Window_PFDMenu");
			}, 40);
		}
		function TogglePFDMenuCollapse(Name) {
			if(IsClassContained("CtrlGroup_PFD" + Name, "Hidden") == true) {
				Show("CtrlGroup_PFD" + Name);
			} else {
				Hide("CtrlGroup_PFD" + Name);
			}
		}
			// Ctrl
			function PitchDown() {
				PFD0.RawData.Manual.Attitude.Pitch -= 0.5;
				if(PFD0.RawData.Manual.Attitude.Pitch < -90) {
					PFD0.RawData.Manual.Attitude.Pitch = -90;
				}
				if(PFD0.RawData.Manual.Attitude.Pitch > 90) {
					PFD0.RawData.Manual.Attitude.Pitch = 90;
				}
				RefreshPFD();
			}
			function PitchUp() {
				PFD0.RawData.Manual.Attitude.Pitch += 0.5;
				if(PFD0.RawData.Manual.Attitude.Pitch < -90) {
					PFD0.RawData.Manual.Attitude.Pitch = -90;
				}
				if(PFD0.RawData.Manual.Attitude.Pitch > 90) {
					PFD0.RawData.Manual.Attitude.Pitch = 90;
				}
				RefreshPFD();
			}
			function RollLeft() {
				PFD0.RawData.Manual.Attitude.Roll -= 0.5;
				if(PFD0.RawData.Manual.Attitude.Roll < -180) {
					PFD0.RawData.Manual.Attitude.Roll += 360;
				}
				if(PFD0.RawData.Manual.Attitude.Roll > 180) {
					PFD0.RawData.Manual.Attitude.Roll -= 360;
				}
				RefreshPFD();
			}
			function RollRight() {
				PFD0.RawData.Manual.Attitude.Roll += 0.5;
				if(PFD0.RawData.Manual.Attitude.Roll < -180) {
					PFD0.RawData.Manual.Attitude.Roll += 360;
				}
				if(PFD0.RawData.Manual.Attitude.Roll > 180) {
					PFD0.RawData.Manual.Attitude.Roll -= 360;
				}
				RefreshPFD();
			}
			function SpeedUp() {
				PFD0.RawData.Manual.Speed += 0.5;
				if(PFD0.RawData.Manual.Speed < 0) {
					PFD0.RawData.Manual.Speed = 0;
				}
				if(PFD0.RawData.Manual.Speed > 555.55556) {
					PFD0.RawData.Manual.Speed = 555.55556;
				}
				RefreshPFD();
			}
			function SpeedDown() {
				PFD0.RawData.Manual.Speed -= 0.5;
				if(PFD0.RawData.Manual.Speed < 0) {
					PFD0.RawData.Manual.Speed = 0;
				}
				if(PFD0.RawData.Manual.Speed > 555.55556) {
					PFD0.RawData.Manual.Speed = 555.55556;
				}
				RefreshPFD();
			}
			function AltitudeUp() {
				PFD0.RawData.Manual.Altitude += 2;
				if(PFD0.RawData.Manual.Altitude < -609.6) {
					PFD0.RawData.Manual.Altitude = -609.6;
				}
				if(PFD0.RawData.Manual.Altitude > 15240) {
					PFD0.RawData.Manual.Altitude = 15240;
				}
				RefreshPFD();
			}
			function AltitudeDown() {
				PFD0.RawData.Manual.Altitude -= 2;
				if(PFD0.RawData.Manual.Altitude < -609.6) {
					PFD0.RawData.Manual.Altitude = -609.6;
				}
				if(PFD0.RawData.Manual.Altitude > 15240) {
					PFD0.RawData.Manual.Altitude = 15240;
				}
				RefreshPFD();
			}
			function SetFlaps() {
				PFD.Flaps = ReadValue("Slider_PFDFlaps");
				RefreshPFD();
			}
			function ResetAccelSpeed() {
				PFD0.RawData.Accel.Speed.Vector = {
					Forward: 0, Right: 0, Upward: 0
				};
				RefreshPFD();
			}
			function ResetAvgSpeeds() {
				PFD0.Stats.Speed.SampleCount = 0;
				PFD0.Stats.Speed.AvgGS = 0;
				PFD0.Stats.Speed.AvgIAS = 0;
				RefreshPFD();
			}

			// Options
			function SetEnableAttitudeIndicatorAtPFDOptions() {
				PFD.Attitude.IsEnabled = IsChecked("Checkbox_PFDOptionsEnableAttitudeIndicator");
				RefreshPFD();
			}
			function SetAttitudeModeAtPFDOptions() {
				PFD.Attitude.Mode = ReadValue("Combobox_PFDOptionsAttitudeMode");
				RefreshPFD();
			}
			function SetSpeedModeAtPFDOptions() {
				PFD.Speed.Mode = ReadValue("Combobox_PFDOptionsSpeedMode");
				RefreshPFD();
			}
			function SetAltitudeModeAtPFDOptions() {
				PFD.Altitude.Mode = ReadValue("Combobox_PFDOptionsAltitudeMode");
				RefreshPFD();
			}
			function SetEnableDMEAtPFDOptions() {
				PFD.DME.IsEnabled = IsChecked("Checkbox_PFDOptionsEnableDME");
				RefreshPFD();
			}
			function SetFlightModeAtPFDOptions() {
				PFD.FlightMode.FlightMode = ReadValue("Combobox_PFDOptionsFlightMode");
				PFD0.Stats.FlightModeTimestamp = Date.now();
				RefreshPFD();
			}
			function SetFlipPFDVerticallyAtPFDOptions() {
				Subsystem.Display.FlipPFDVertically = IsChecked("Checkbox_PFDOptionsFlipPFDVertically");
				RefreshSubsystem();
			}
			function SetKeepScreenOnAtPFDOptions() {
				Subsystem.Display.KeepScreenOn = IsChecked("Checkbox_PFDOptionsKeepScreenOn");
				RefreshSubsystem();
			}

	// Settings
		// Attitude
		function SetEnableAttitudeIndicator() {
			PFD.Attitude.IsEnabled = IsChecked("Checkbox_SettingsEnableAttitudeIndicator");
			RefreshPFD();
		}
		function SetAttitudeMode() {
			PFD.Attitude.Mode = ReadValue("Combobox_SettingsAttitudeMode");
			RefreshPFD();
		}
		function SetAttitudeOffsetPitch() {
			PFD.Attitude.Offset.Pitch = Math.trunc(ReadValue("Textbox_SettingsAttitudeOffsetPitch"));
			if(PFD.Attitude.Offset.Pitch < -90) {
				PFD.Attitude.Offset.Pitch = -90;
			}
			if(PFD.Attitude.Offset.Pitch > 90) {
				PFD.Attitude.Offset.Pitch = 90;
			}
			RefreshPFD();
		}
		function SetAttitudeOffsetRoll() {
			PFD.Attitude.Offset.Roll = Math.trunc(ReadValue("Textbox_SettingsAttitudeOffsetRoll"));
			if(PFD.Attitude.Offset.Roll < -90) {
				PFD.Attitude.Offset.Roll = -90;
			}
			if(PFD.Attitude.Offset.Roll > 90) {
				PFD.Attitude.Offset.Roll = 90;
			}
			RefreshPFD();
		}

		// Speed
		function SetSpeedMode() {
			PFD.Speed.Mode = ReadValue("Combobox_SettingsSpeedMode");
			RefreshPFD();
		}
		function SetIASAlgorithm() {
			PFD.Speed.IASAlgorithm = ReadValue("Combobox_SettingsIASAlgorithm");
			RefreshPFD();
		}
		function SetAirportTemperatureDeparture() {
			PFD.Speed.AirportTemperature.Departure = ConvertUnit(Math.trunc(ReadValue("Textbox_SettingsAirportTemperatureDeparture")), Subsystem.I18n.TemperatureUnit, "Kelvin");
			if(PFD.Speed.AirportTemperature.Departure < 223.15) {
				PFD.Speed.AirportTemperature.Departure = 223.15;
			}
			if(PFD.Speed.AirportTemperature.Departure > 323.15) {
				PFD.Speed.AirportTemperature.Departure = 323.15;
			}
			RefreshPFD();
		}
		function SetAirportTemperatureArrival() {
			PFD.Speed.AirportTemperature.Arrival = ConvertUnit(Math.trunc(ReadValue("Textbox_SettingsAirportTemperatureArrival")), Subsystem.I18n.TemperatureUnit, "Kelvin");
			if(PFD.Speed.AirportTemperature.Arrival < 223.15) {
				PFD.Speed.AirportTemperature.Arrival = 223.15;
			}
			if(PFD.Speed.AirportTemperature.Arrival > 323.15) {
				PFD.Speed.AirportTemperature.Arrival = 323.15;
			}
			RefreshPFD();
		}
		function SwapAirportTemperatures() {
			let Swapper = PFD.Speed.AirportTemperature.Departure;
			PFD.Speed.AirportTemperature.Departure = PFD.Speed.AirportTemperature.Arrival;
			PFD.Speed.AirportTemperature.Arrival = Swapper;
			RefreshPFD();
		}
		function SetRelativeHumidityDeparture() {
			PFD.Speed.RelativeHumidity.Departure = Math.trunc(ReadValue("Textbox_SettingsRelativeHumidityDeparture"));
			if(PFD.Speed.RelativeHumidity.Departure < 0) {
				PFD.Speed.RelativeHumidity.Departure = 0;
			}
			if(PFD.Speed.RelativeHumidity.Departure > 100) {
				PFD.Speed.RelativeHumidity.Departure = 100;
			}
			RefreshPFD();
		}
		function SetRelativeHumidityArrival() {
			PFD.Speed.RelativeHumidity.Arrival = Math.trunc(ReadValue("Textbox_SettingsRelativeHumidityArrival"));
			if(PFD.Speed.RelativeHumidity.Arrival < 0) {
				PFD.Speed.RelativeHumidity.Arrival = 0;
			}
			if(PFD.Speed.RelativeHumidity.Arrival > 100) {
				PFD.Speed.RelativeHumidity.Arrival = 100;
			}
			RefreshPFD();
		}
		function SwapRelativeHumidity() {
			let Swapper = PFD.Speed.RelativeHumidity.Departure;
			PFD.Speed.RelativeHumidity.Departure = PFD.Speed.RelativeHumidity.Arrival;
			PFD.Speed.RelativeHumidity.Arrival = Swapper;
			RefreshPFD();
		}
		function SetQNHDeparture() {
			PFD.Speed.QNH.Departure = ConvertUnit(Math.trunc(ReadValue("Textbox_SettingsQNHDeparture") * 100) / 100, Subsystem.I18n.PressureUnit, "Hectopascal");
			if(PFD.Speed.QNH.Departure < 900) {
				PFD.Speed.QNH.Departure = 900;
			}
			if(PFD.Speed.QNH.Departure > 1100) {
				PFD.Speed.QNH.Departure = 1100;
			}
			RefreshPFD();
		}
		function SetQNHArrival() {
			PFD.Speed.QNH.Arrival = ConvertUnit(Math.trunc(ReadValue("Textbox_SettingsQNHArrival") * 100) / 100, Subsystem.I18n.PressureUnit, "Hectopascal");
			if(PFD.Speed.QNH.Arrival < 900) {
				PFD.Speed.QNH.Arrival = 900;
			}
			if(PFD.Speed.QNH.Arrival > 1100) {
				PFD.Speed.QNH.Arrival = 1100;
			}
			RefreshPFD();
		}
		function SwapQNHs() {
			let Swapper = PFD.Speed.QNH.Departure;
			PFD.Speed.QNH.Departure = PFD.Speed.QNH.Arrival;
			PFD.Speed.QNH.Arrival = Swapper;
			RefreshPFD();
		}
		function SetWindDirection() {
			PFD.Speed.Wind.Direction = Math.trunc(ReadValue("Textbox_SettingsWindDirection"));
			if(PFD.Speed.Wind.Direction < 0) {
				PFD.Speed.Wind.Direction = 0;
			}
			if(PFD.Speed.Wind.Direction > 359) {
				PFD.Speed.Wind.Direction = 359;
			}
			RefreshPFD();
		}
		function SetWindSpeed() {
			PFD.Speed.Wind.Speed = ConvertUnit(Math.trunc(ReadValue("Textbox_SettingsWindSpeed")), Subsystem.I18n.SpeedUnit, "MeterPerSec");
			if(PFD.Speed.Wind.Speed < 0) {
				PFD.Speed.Wind.Speed = 0;
			}
			if(PFD.Speed.Wind.Speed > 277.5) {
				PFD.Speed.Wind.Speed = 277.5;
			}
			RefreshPFD();
		}
		function ResetWind() {
			PFD.Speed.Wind = {
				Direction: 0, Speed: 0
			};
			RefreshPFD();
		}
		function SetSpeedLimitPreset() {
			switch(ReadValue("Combobox_SettingsSpeedLimitPreset")) {
				case "NoSpeedLimits":
					PFD.Speed.SpeedLimit = {
						Min: 0, MaxOnFlapsUp: 277.5, MaxOnFlapsFull: 277.5
					};
					break;
				case "Boeing737-800":
					PFD.Speed.SpeedLimit = {
						Min: 61.728, MaxOnFlapsUp: 174.896, MaxOnFlapsFull: 83.3328
					};
					break;
				case "AirbusA320":
					PFD.Speed.SpeedLimit = {
						Min: 61.728, MaxOnFlapsUp: 180.04, MaxOnFlapsFull: 91.0488
					};
					break;
				case "GroundVehicle":
					PFD.Speed.SpeedLimit = {
						Min: 0, MaxOnFlapsUp: 33.33333, MaxOnFlapsFull: 33.33333
					};
					break;
				default:
					AlertSystemError("The value of ReadValue(\"Combobox_SettingsSpeedLimitPreset\") \"" + ReadValue("Combobox_SettingsSpeedLimitPreset") + "\" in function SetSpeedLimitPreset is invalid.");
					break;
			}
			RefreshPFD();
		}
		function SetSpeedLimitMin() {
			PFD.Speed.SpeedLimit.Min = ConvertUnit(Math.trunc(ReadValue("Textbox_SettingsSpeedLimitMin")), Subsystem.I18n.SpeedUnit, "MeterPerSec");
			if(PFD.Speed.SpeedLimit.Min < 0) {
				PFD.Speed.SpeedLimit.Min = 0;
			}
			if(PFD.Speed.SpeedLimit.Min > 272.5) {
				PFD.Speed.SpeedLimit.Min = 272.5;
			}
			if(PFD.Speed.SpeedLimit.Min > PFD.Speed.SpeedLimit.MaxOnFlapsFull - 5) {
				PFD.Speed.SpeedLimit.MaxOnFlapsFull = PFD.Speed.SpeedLimit.Min + 5;
				if(PFD.Speed.SpeedLimit.MaxOnFlapsFull > PFD.Speed.SpeedLimit.MaxOnFlapsUp) {
					PFD.Speed.SpeedLimit.MaxOnFlapsUp = PFD.Speed.SpeedLimit.MaxOnFlapsFull;
				}
			}
			RefreshPFD();
		}
		function SetSpeedLimitMaxOnFlapsUp() {
			PFD.Speed.SpeedLimit.MaxOnFlapsUp = ConvertUnit(Math.trunc(ReadValue("Textbox_SettingsSpeedLimitMaxOnFlapsUp")), Subsystem.I18n.SpeedUnit, "MeterPerSec");
			if(PFD.Speed.SpeedLimit.MaxOnFlapsUp < 5) {
				PFD.Speed.SpeedLimit.MaxOnFlapsUp = 5;
			}
			if(PFD.Speed.SpeedLimit.MaxOnFlapsUp > 277.5) {
				PFD.Speed.SpeedLimit.MaxOnFlapsUp = 277.5;
			}
			if(PFD.Speed.SpeedLimit.MaxOnFlapsUp < PFD.Speed.SpeedLimit.MaxOnFlapsFull) {
				PFD.Speed.SpeedLimit.MaxOnFlapsFull = PFD.Speed.SpeedLimit.MaxOnFlapsUp;
				if(PFD.Speed.SpeedLimit.MaxOnFlapsFull < PFD.Speed.SpeedLimit.Min + 5) {
					PFD.Speed.SpeedLimit.Min = PFD.Speed.SpeedLimit.MaxOnFlapsFull - 5;
				}
			}
			RefreshPFD();
		}
		function SetSpeedLimitMaxOnFlapsFull() {
			PFD.Speed.SpeedLimit.MaxOnFlapsFull = ConvertUnit(Math.trunc(ReadValue("Textbox_SettingsSpeedLimitMaxOnFlapsFull")), Subsystem.I18n.SpeedUnit, "MeterPerSec");
			if(PFD.Speed.SpeedLimit.MaxOnFlapsFull < 5) {
				PFD.Speed.SpeedLimit.MaxOnFlapsFull = 5;
			}
			if(PFD.Speed.SpeedLimit.MaxOnFlapsFull > 277.5) {
				PFD.Speed.SpeedLimit.MaxOnFlapsFull = 277.5;
			}
			if(PFD.Speed.SpeedLimit.MaxOnFlapsFull < PFD.Speed.SpeedLimit.Min + 5) {
				PFD.Speed.SpeedLimit.Min = PFD.Speed.SpeedLimit.MaxOnFlapsFull - 5;
			}
			if(PFD.Speed.SpeedLimit.MaxOnFlapsFull > PFD.Speed.SpeedLimit.MaxOnFlapsUp) {
				PFD.Speed.SpeedLimit.MaxOnFlapsUp = PFD.Speed.SpeedLimit.MaxOnFlapsFull;
			}
			RefreshPFD();
		}

		// Altitude
		function SetAltitudeMode() {
			PFD.Altitude.Mode = ReadValue("Combobox_SettingsAltitudeMode");
			RefreshPFD();
		}
		function SetAirportElevationDeparture() {
			PFD.Altitude.AirportElevation.Departure = ConvertUnit(Math.trunc(ReadValue("Textbox_SettingsAirportElevationDeparture")), Subsystem.I18n.AltitudeUnit, "Meter");
			if(PFD.Altitude.AirportElevation.Departure < -500) {
				PFD.Altitude.AirportElevation.Departure = 500;
			}
			if(PFD.Altitude.AirportElevation.Departure > 5000) {
				PFD.Altitude.AirportElevation.Departure = 5000;
			}
			RefreshPFD();
		}
		function SetAirportElevationArrival() {
			PFD.Altitude.AirportElevation.Arrival = ConvertUnit(Math.trunc(ReadValue("Textbox_SettingsAirportElevationArrival")), Subsystem.I18n.AltitudeUnit, "Meter");
			if(PFD.Altitude.AirportElevation.Arrival < -500) {
				PFD.Altitude.AirportElevation.Arrival = 500;
			}
			if(PFD.Altitude.AirportElevation.Arrival > 5000) {
				PFD.Altitude.AirportElevation.Arrival = 5000;
			}
			RefreshPFD();
		}
		function SwapAirportElevations() {
			let Swapper = PFD.Altitude.AirportElevation.Departure;
			PFD.Altitude.AirportElevation.Departure = PFD.Altitude.AirportElevation.Arrival;
			PFD.Altitude.AirportElevation.Arrival = Swapper;
			RefreshPFD();
		}
		function SetDecisionHeight() {
			PFD.Altitude.DecisionHeight = ConvertUnit(Math.trunc(ReadValue("Textbox_SettingsDecisionHeight")), Subsystem.I18n.AltitudeUnit, "Meter");
			if(PFD.Altitude.DecisionHeight < 15) {
				PFD.Altitude.DecisionHeight = 15;
			}
			if(PFD.Altitude.DecisionHeight > 750) {
				PFD.Altitude.DecisionHeight = 750;
			}
			RefreshPFD();
		}

		// DME
		function SetEnableDME() {
			PFD.DME.IsEnabled = IsChecked("Checkbox_SettingsEnableDME");
			RefreshPFD();
		}
		function SetAirportCoordinatesDeparture() {
			PFD.DME.AirportCoordinates.Departure = {
				Lat: Math.trunc(ReadValue("Textbox_SettingsAirportCoordinatesDepartureLat") * 100000) / 100000,
				Lon: Math.trunc(ReadValue("Textbox_SettingsAirportCoordinatesDepartureLon") * 100000) / 100000
			};
			if(PFD.DME.AirportCoordinates.Departure.Lat < -90) {
				PFD.DME.AirportCoordinates.Departure.Lat = -90;
			}
			if(PFD.DME.AirportCoordinates.Departure.Lat > 90) {
				PFD.DME.AirportCoordinates.Departure.Lat = 90;
			}
			if(PFD.DME.AirportCoordinates.Departure.Lon < -180) {
				PFD.DME.AirportCoordinates.Departure.Lon = -180;
			}
			if(PFD.DME.AirportCoordinates.Departure.Lon > 180) {
				PFD.DME.AirportCoordinates.Departure.Lon = 180;
			}
			RefreshPFD();
		}
		function SetAirportCoordinatesArrival() {
			PFD.DME.AirportCoordinates.Arrival = {
				Lat: Math.trunc(ReadValue("Textbox_SettingsAirportCoordinatesArrivalLat") * 100000) / 100000,
				Lon: Math.trunc(ReadValue("Textbox_SettingsAirportCoordinatesArrivalLon") * 100000) / 100000
			};
			if(PFD.DME.AirportCoordinates.Arrival.Lat < -90) {
				PFD.DME.AirportCoordinates.Arrival.Lat = -90;
			}
			if(PFD.DME.AirportCoordinates.Arrival.Lat > 90) {
				PFD.DME.AirportCoordinates.Arrival.Lat = 90;
			}
			if(PFD.DME.AirportCoordinates.Arrival.Lon < -180) {
				PFD.DME.AirportCoordinates.Arrival.Lon = -180;
			}
			if(PFD.DME.AirportCoordinates.Arrival.Lon > 180) {
				PFD.DME.AirportCoordinates.Arrival.Lon = 180;
			}
			RefreshPFD();
		}
		function SwapAirportCoordinates() {
			let Swapper = structuredClone(PFD.DME.AirportCoordinates.Departure);
			PFD.DME.AirportCoordinates.Departure = structuredClone(PFD.DME.AirportCoordinates.Arrival);
			PFD.DME.AirportCoordinates.Arrival = structuredClone(Swapper);
			RefreshPFD();
		}
		function SetETACalcMethod() {
			PFD.DME.ETACalcMethod = ReadValue("Combobox_SettingsETACalcMethod");
			RefreshPFD();
		}

		// Flight mode
		function SetFlightMode() {
			PFD.FlightMode.FlightMode = ReadValue("Combobox_SettingsFlightMode");
			PFD0.Stats.FlightModeTimestamp = Date.now();
			RefreshPFD();
		}
		function SetAutoSwitchFlightModeAndSwapAirportData() {
			PFD.FlightMode.AutoSwitchFlightModeAndSwapAirportData = IsChecked("Checkbox_SettingsAutoSwitchFlightModeAndSwapAirportData");
			RefreshPFD();
		}

		// Display
		function SetPFDStyle() {
			Subsystem.Display.PFDStyle = ReadValue("Combobox_SettingsPFDStyle");
			RefreshSubsystem();
		}
		function SetFlipPFDVertically() {
			Subsystem.Display.FlipPFDVertically = IsChecked("Checkbox_SettingsFlipPFDVertically");
			RefreshSubsystem();
			RefreshPFD();
		}
		function SetKeepScreenOn() {
			Subsystem.Display.KeepScreenOn = IsChecked("Checkbox_SettingsKeepScreenOn");
			RefreshSubsystem();
		}

		// Audio
		function SetAudioScheme() {
			Subsystem.Audio.Scheme = ReadValue("Combobox_SettingsAudioScheme");
			RefreshSubsystem();
		}
		function SetAttitudeAlertVolume() {
			Subsystem.Audio.AttitudeAlertVolume = ReadValue("Slider_SettingsAttitudeAlertVolume");
			RefreshSubsystem();
		}
		function PreviewAttitudeAlertVolume() {
			ChangeAudioLoop("Audio_AttitudeAlert", false);
			PlayAudio("Audio_AttitudeAlert", "../audio/Beep.mp3");
			PFD0.Alert.NowPlaying.AttitudeWarning = "";
		}
		function SetSpeedAlertVolume() {
			Subsystem.Audio.SpeedAlertVolume = ReadValue("Slider_SettingsSpeedAlertVolume");
			RefreshSubsystem();
		}
		function PreviewSpeedAlertVolume() {
			ChangeAudioLoop("Audio_SpeedAlert", false);
			PlayAudio("Audio_SpeedAlert", "../audio/Beep.mp3");
			PFD0.Alert.NowPlaying.SpeedWarning = "";
		}
		function SetAltitudeAlertVolume() {
			Subsystem.Audio.AltitudeAlertVolume = ReadValue("Slider_SettingsAltitudeAlertVolume");
			RefreshSubsystem();
		}
		function PreviewAltitudeAlertVolume() {
			ChangeAudioLoop("Audio_AltitudeAlert", false);
			PlayAudio("Audio_AltitudeAlert", "../audio/Beep.mp3");
			PFD0.Alert.NowPlaying.AltitudeCallout = "";
			PFD0.Alert.NowPlaying.AltitudeWarning = "";
		}

		// I18n
		function SetAlwaysUseEnglishTerminologyOnPFD() {
			Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD = IsChecked("Checkbox_SettingsAlwaysUseEnglishTerminologyOnPFD");
			RefreshSubsystem();
			RefreshPFD();
		}
		function SetMeasurementUnitsPreset() {
			switch(ReadValue("Combobox_SettingsMeasurementUnitsPreset")) {
				case "AllMetric":
					Subsystem.I18n.SpeedUnit = "KilometerPerHour";
					Subsystem.I18n.DistanceUnit = "Kilometer";
					Subsystem.I18n.AltitudeUnit = "Meter";
					Subsystem.I18n.VerticalSpeedUnit = "MeterPerSec";
					Subsystem.I18n.PressureUnit = "Hectopascal";
					Subsystem.I18n.TemperatureUnit = "Celsius";
					break;
				case "CivilAviation":
					Subsystem.I18n.SpeedUnit = "Knot";
					Subsystem.I18n.DistanceUnit = "NauticalMile";
					Subsystem.I18n.AltitudeUnit = "Feet";
					Subsystem.I18n.VerticalSpeedUnit = "FeetPerMin";
					Subsystem.I18n.PressureUnit = "Hectopascal";
					Subsystem.I18n.TemperatureUnit = "Celsius";
					break;
				default:
					AlertSystemError("The value of ReadValue(\"Combobox_SettingsMeasurementUnitsPreset\") \"" + ReadValue("Combobox_SettingsMeasurementUnitsPreset") + "\" in function SetMeasurementUnitsPreset is invalid.");
					break;
			}
			RefreshSubsystem();
			RefreshPFD();
		}
		function SetSpeedUnit() {
			Subsystem.I18n.SpeedUnit = ReadValue("Combobox_SettingsSpeedUnit");
			RefreshSubsystem();
			RefreshPFD();
		}
		function SetDistanceUnit() {
			Subsystem.I18n.DistanceUnit = ReadValue("Combobox_SettingsDistanceUnit");
			RefreshSubsystem();
			RefreshPFD();
		}
		function SetAltitudeUnit() {
			Subsystem.I18n.AltitudeUnit = ReadValue("Combobox_SettingsAltitudeUnit");
			RefreshSubsystem();
			RefreshPFD();
		}
		function SetVerticalSpeedUnit() {
			Subsystem.I18n.VerticalSpeedUnit = ReadValue("Combobox_SettingsVerticalSpeedUnit");
			RefreshSubsystem();
			RefreshPFD();
		}
		function SetTemperatureUnit() {
			Subsystem.I18n.TemperatureUnit = ReadValue("Combobox_SettingsTemperatureUnit");
			RefreshSubsystem();
			RefreshPFD();
		}
		function SetPressureUnit() {
			Subsystem.I18n.PressureUnit = ReadValue("Combobox_SettingsPressureUnit");
			RefreshSubsystem();
			RefreshPFD();
		}

		// Misc
		function ResetAllDontShowAgainDialogs() {
			System.DontShowAgain = [0];
			RefreshSystem();
			ShowToast("已重置");
		}

		// User data
		function ImportUserData() {
			if(ReadValue("Textbox_SettingsUserDataImport") != "") {
				if(ReadValue("Textbox_SettingsUserDataImport").startsWith("{\"System\":{\"Display\":{\"Theme\":") == true) {
					let Objects = JSON.parse(ReadValue("Textbox_SettingsUserDataImport"));
					Object.keys(Objects).forEach(function(ObjectName) {
						localStorage.setItem(ObjectName, JSON.stringify(Objects[ObjectName]));
					});
					RefreshWebpage();
				} else {
					ShowDialog("System_JSONStringInvalid",
						"Error",
						"您键入的 JSON 字符串不合法。",
						"", "", "", "确定");
					RefreshSystem();
				}
			}
		}
		function ExportUserData() {
			navigator.clipboard.writeText("{" +
				"\"System\":" + JSON.stringify(System) + "," +
				"\"GPSPFD_Subsystem\":" + JSON.stringify(Subsystem) + "," +
				"\"GPSPFD_PFD\":" + JSON.stringify(PFD) +
				"}");
			ShowDialog("System_UserDataExported",
				"Info",
				"已导出本网页的用户数据至剪贴板。",
				"", "", "", "确定");
		}
		function ConfirmClearUserData() {
			ShowDialog("System_ConfirmClearUserData",
				"Caution",
				"您确认要清空用户数据？",
				"", "", "清空", "取消");
		}

	// Dialog
	function AnswerDialog(Selector) {
		let DialogEvent = Interaction.Dialog[Interaction.Dialog.length - 1].Event;
		ShowDialog("Previous");
		switch(DialogEvent) {
			case "System_LanguageUnsupported":
			case "System_MajorUpdateDetected":
			case "System_PWANewVersionReady":
			case "System_RefreshingWebpage":
			case "System_JSONStringInvalid":
			case "System_UserDataExported":
				switch(Selector) {
					case 3:
						break;
					default:
						AlertSystemError("The value of Selector \"" + Selector + "\" in function AnswerDialog is invalid.");
						break;
				}
				break;
			case "System_Welcome":
				switch(Selector) {
					case 2:
						if(IsChecked("Checkbox_DialogCheckboxOption") == true) {
							System.DontShowAgain[System.DontShowAgain.length] = "GPSPFD_System_Welcome";
							RefreshSystem();
						}
						ScrollIntoView("Item_HelpReadBeforeUse");
						ShowIAmHere("Item_HelpReadBeforeUse");
						break;
					case 3:
						if(IsChecked("Checkbox_DialogCheckboxOption") == true) {
							System.DontShowAgain[System.DontShowAgain.length] = "GPSPFD_System_Welcome";
							RefreshSystem();
						}
						break;
					default:
						AlertSystemError("The value of Selector \"" + Selector + "\" in function AnswerDialog is invalid.");
						break;
				}
				break;
			case "System_ConfirmGoToTutorial":
				switch(Selector) {
					case 2:
						ScrollIntoView("Item_HelpTutorial");
						ShowIAmHere("Item_HelpTutorial");
						break;
					case 3:
						break;
					default:
						AlertSystemError("The value of Selector \"" + Selector + "\" in function AnswerDialog is invalid.");
						break;
				}
				break;
			case "System_ConfirmClearUserData":
				switch(Selector) {
					case 2:
						localStorage.clear();
						RefreshWebpage();
						break;
					case 3:
						break;
					default:
						AlertSystemError("The value of Selector \"" + Selector + "\" in function AnswerDialog is invalid.");
						break;
				}
				break;
			case "System_Error":
				switch(Selector) {
					case 1:
						ScrollIntoView("Item_SettingsUserData");
						ShowIAmHere("Item_SettingsUserData");
						break;
					case 2:
						Object.keys(Automation).forEach(function(AutomationName) {
							clearTimeout(Automation[AutomationName]);
						});
						break;
					case 3:
						break;
					default:
						AlertSystemError("The value of Selector \"" + Selector + "\" in function AnswerDialog is invalid.");
						break;
				}
				break;
			default:
				AlertSystemError("The value of DialogEvent \"" + DialogEvent + "\" in function AnswerDialog is invalid.");
				break;
		}
	}

// Listeners
	// On click (mouse left button, Enter key or Space key)
	document.addEventListener("click", function() {
		setTimeout(function() {
			HideToCorner("Window_PFDMenu");
		}, 0);
	});

	// On keyboard
	document.addEventListener("keydown", function(Hotkey) {
		if(Hotkey.key == "Escape") {
			HideToCorner("Window_PFDMenu");
		}
		if(Hotkey.key == "F1") {
			ShowDialog("System_ConfirmGoToTutorial",
				"Question",
				"您按下了 F1 键。是否前往教程？",
				"", "", "前往", "取消");
			if(System.Display.HotkeyIndicators == "ShowOnAnyKeyPress" || System.Display.HotkeyIndicators == "AlwaysShow") {
				ShowHotkeyIndicators();
			}
		}
		if((document.activeElement.tagName.toLowerCase() != "input" && document.activeElement.tagName.toLowerCase() != "textarea")) { // Prevent hotkey activation when inputing text etc.
			switch(Hotkey.key.toUpperCase()) {
				case "M":
					Click("Button_PFDMenu");
					if(System.Display.HotkeyIndicators == "ShowOnAnyKeyPress" || System.Display.HotkeyIndicators == "AlwaysShow") {
						ShowHotkeyIndicators();
					}
					break;
				case "R":
					PFD.Flaps = PFD.Flaps - 5;
					if(PFD.Flaps < 0) {
						PFD.Flaps = 0;
					}
					if(PFD.Flaps > 100) {
						PFD.Flaps = 100;
					}
					RefreshPFD();
					if(System.Display.HotkeyIndicators == "ShowOnAnyKeyPress" || System.Display.HotkeyIndicators == "AlwaysShow") {
						ShowHotkeyIndicators();
					}
					break;
				case "F":
					PFD.Flaps = PFD.Flaps + 5;
					if(PFD.Flaps < 0) {
						PFD.Flaps = 0;
					}
					if(PFD.Flaps > 100) {
						PFD.Flaps = 100;
					}
					RefreshPFD();
					if(System.Display.HotkeyIndicators == "ShowOnAnyKeyPress" || System.Display.HotkeyIndicators == "AlwaysShow") {
						ShowHotkeyIndicators();
					}
					break;
				case "W":
					if(PFD.Attitude.Mode == "Manual") {
						PitchDown();
					}
					if(System.Display.HotkeyIndicators == "ShowOnAnyKeyPress" || System.Display.HotkeyIndicators == "AlwaysShow") {
						ShowHotkeyIndicators();
					}
					break;
				case "S":
					if(PFD.Attitude.Mode == "Manual") {
						PitchUp();
					}
					if(System.Display.HotkeyIndicators == "ShowOnAnyKeyPress" || System.Display.HotkeyIndicators == "AlwaysShow") {
						ShowHotkeyIndicators();
					}
					break;
				case "A":
					if(PFD.Attitude.Mode == "Manual") {
						RollLeft();
					}
					if(System.Display.HotkeyIndicators == "ShowOnAnyKeyPress" || System.Display.HotkeyIndicators == "AlwaysShow") {
						ShowHotkeyIndicators();
					}
					break;
				case "D":
					if(PFD.Attitude.Mode == "Manual") {
						RollRight();
					}
					if(System.Display.HotkeyIndicators == "ShowOnAnyKeyPress" || System.Display.HotkeyIndicators == "AlwaysShow") {
						ShowHotkeyIndicators();
					}
					break;
				case "U":
					if(PFD.Speed.Mode == "Manual") {
						SpeedUp();
					}
					if(System.Display.HotkeyIndicators == "ShowOnAnyKeyPress" || System.Display.HotkeyIndicators == "AlwaysShow") {
						ShowHotkeyIndicators();
					}
					break;
				case "J":
					if(PFD.Speed.Mode == "Manual") {
						SpeedDown();
					}
					if(System.Display.HotkeyIndicators == "ShowOnAnyKeyPress" || System.Display.HotkeyIndicators == "AlwaysShow") {
						ShowHotkeyIndicators();
					}
					break;
				case "O":
					if(PFD.Altitude.Mode == "Manual") {
						AltitudeUp();
					}
					if(System.Display.HotkeyIndicators == "ShowOnAnyKeyPress" || System.Display.HotkeyIndicators == "AlwaysShow") {
						ShowHotkeyIndicators();
					}
					break;
				case "L":
					if(PFD.Altitude.Mode == "Manual") {
						AltitudeDown();
					}
					if(System.Display.HotkeyIndicators == "ShowOnAnyKeyPress" || System.Display.HotkeyIndicators == "AlwaysShow") {
						ShowHotkeyIndicators();
					}
					break;
				default:
					if((System.Display.HotkeyIndicators == "ShowOnWrongKeyPress" && IsWrongKeyNegligible(Hotkey.key) == false && Hotkey.key != "F1") ||
					System.Display.HotkeyIndicators == "ShowOnAnyKeyPress" || System.Display.HotkeyIndicators == "AlwaysShow") {
						ShowHotkeyIndicators();
					}
					break;
			}
		}
	});

	// On resizing window
	window.addEventListener("resize", ClockPFD);

	// Geolocation API
	navigator.geolocation.watchPosition(RefreshGPSData, null, GeolocationAPIOptions);

	// Device motion API
	window.addEventListener("devicemotion", RefreshAccelData);

// Features
	// Converters
	function ConvertUnit(Value, InputUnit, OutputUnit) {
		if(InputUnit != OutputUnit) {
			switch(InputUnit) {
				case "Meter":
					switch(OutputUnit) {
						case "Kilometer":
							Value /= 1000;
							break;
						case "Feet":
						case "FeetButShowMeterBeside":
							Value *= 3.28084;
							break;
						case "Mile":
							Value /= 1609.344;
							break;
						case "NauticalMile":
							Value /= 1852;
							break;
						default:
							AlertSystemError("The value of OutputUnit \"" + OutputUnit + "\" in function ConvertUnit is invalid.");
							break;
					}
					break;
				case "Kilometer":
					switch(OutputUnit) {
						case "Meter":
							Value *= 1000;
							break;
						case "Feet":
						case "FeetButShowMeterBeside":
							Value *= 3280.83990;
							break;
						case "Mile":
							Value /= 1.60934;
							break;
						case "NauticalMile":
							Value /= 1.852;
							break;
						default:
							AlertSystemError("The value of OutputUnit \"" + OutputUnit + "\" in function ConvertUnit is invalid.");
							break;
					}
					break;
				case "Feet":
				case "FeetButShowMeterBeside":
					switch(OutputUnit) {
						case "Meter":
							Value /= 3.28084;
							break;
						case "Kilometer":
							Value /= 3280.83990;
							break;
						case "Mile":
							Value /= 5280;
							break;
						case "NauticalMile":
							Value /= 6076.11549;
							break;
						default:
							AlertSystemError("The value of OutputUnit \"" + OutputUnit + "\" in function ConvertUnit is invalid.");
							break;
					}
					break;
				case "Mile":
					switch(OutputUnit) {
						case "Meter":
							Value *= 1609.344;
							break;
						case "Kilometer":
							Value *= 1.60934;
							break;
						case "Feet":
						case "FeetButShowMeterBeside":
							Value *= 5280;
							break;
						case "NauticalMile":
							Value /= 1.15078;
							break;
						default:
							AlertSystemError("The value of OutputUnit \"" + OutputUnit + "\" in function ConvertUnit is invalid.");
							break;
					}
					break;
				case "NauticalMile":
					switch(OutputUnit) {
						case "Meter":
							Value *= 1852;
							break;
						case "Kilometer":
							Value *= 1.852;
							break;
						case "Feet":
						case "FeetButShowMeterBeside":
							Value *= 6076.11549;
							break;
						case "Mile":
							Value *= 1.15078;
							break;
						default:
							AlertSystemError("The value of OutputUnit \"" + OutputUnit + "\" in function ConvertUnit is invalid.");
							break;
					}
					break;
				case "MeterPerSec":
					switch(OutputUnit) {
						case "KilometerPerHour":
							Value *= 3.6;
							break;
						case "FeetPerMin":
							Value *= 196.85039;
							break;
						case "MilePerHour":
							Value *= 2.23694;
							break;
						case "Knot":
							Value *= 1.94384;
							break;
						default:
							AlertSystemError("The value of OutputUnit \"" + OutputUnit + "\" in function ConvertUnit is invalid.");
							break;
					}
					break;
				case "KilometerPerHour":
					switch(OutputUnit) {
						case "MeterPerSec":
							Value /= 3.6;
							break;
						case "FeetPerMin":
							Value *= 54.68066;
							break;
						case "MilePerHour":
							Value /= 1.60934;
							break;
						case "Knot":
							Value /= 1.852;
							break;
						default:
							AlertSystemError("The value of OutputUnit \"" + OutputUnit + "\" in function ConvertUnit is invalid.");
							break;
					}
					break;
				case "FeetPerMin":
					switch(OutputUnit) {
						case "MeterPerSec":
							Value /= 196.85039;
							break;
						case "KilometerPerHour":
							Value /= 54.68066;
							break;
						case "MilePerHour":
							Value /= 88;
							break;
						case "Knot":
							Value /= 101.26859;
							break;
						default:
							AlertSystemError("The value of OutputUnit \"" + OutputUnit + "\" in function ConvertUnit is invalid.");
							break;
					}
					break;
				case "MilePerHour":
					switch(OutputUnit) {
						case "MeterPerSec":
							Value /= 2.23694;
							break;
						case "KilometerPerHour":
							Value *= 1.60934;
							break;
						case "FeetPerMin":
							Value *= 88;
							break;
						case "Knot":
							Value /= 1.15078;
							break;
						default:
							AlertSystemError("The value of OutputUnit \"" + OutputUnit + "\" in function ConvertUnit is invalid.");
							break;
					}
					break;
				case "Knot":
					switch(OutputUnit) {
						case "MeterPerSec":
							Value /= 1.94384;
							break;
						case "KilometerPerHour":
							Value *= 1.852;
							break;
						case "FeetPerMin":
							Value *= 101.26859;
							break;
						case "MilePerHour":
							Value *= 1.15078;
							break;
						default:
							AlertSystemError("The value of OutputUnit \"" + OutputUnit + "\" in function ConvertUnit is invalid.");
							break;
					}
					break;
				case "Kelvin":
					switch(OutputUnit) {
						case "Celsius":
							Value -= 273.15;
							break;
						case "Fahrenheit":
							Value = (Value - 273.15) * 1.8 + 32;
							break;
						default:
							AlertSystemError("The value of OutputUnit \"" + OutputUnit + "\" in function ConvertUnit is invalid.");
							break;
					}
					break;
				case "Celsius":
					switch(OutputUnit) {
						case "Kelvin":
							Value += 273.15;
							break;
						case "Fahrenheit":
							Value = Value * 1.8 + 32;
							break;
						default:
							AlertSystemError("The value of OutputUnit \"" + OutputUnit + "\" in function ConvertUnit is invalid.");
							break;
					}
					break;
				case "Fahrenheit":
					switch(OutputUnit) {
						case "Kelvin":
							Value = (Value - 32) / 1.8 + 273.15;
							break;
						case "Celsius":
							Value = (Value - 32) / 1.8;
							break;
						default:
							AlertSystemError("The value of OutputUnit \"" + OutputUnit + "\" in function ConvertUnit is invalid.");
							break;
					}
					break;
				case "Hectopascal":
					switch(OutputUnit) {
						case "InchOfMercury":
							Value /= 33.86389;
							break;
						default:
							AlertSystemError("The value of OutputUnit \"" + OutputUnit + "\" in function ConvertUnit is invalid.");
							break;
					}
					break;
				case "InchOfMercury":
					switch(OutputUnit) {
						case "Hectopascal":
							Value *= 33.86389;
							break;
						default:
							AlertSystemError("The value of OutputUnit \"" + OutputUnit + "\" in function ConvertUnit is invalid.");
							break;
					}
					break;
				default:
					AlertSystemError("The value of InputUnit \"" + InputUnit + "\" in function ConvertUnit is invalid.");
					break;
			}
		}
		return Math.round(Value * 100000) / 100000;
	}
	function Translate(Value) {
		switch(Value) {
			case "Unknown":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "未知";
				} else {
					return "UNKNOWN";
				}
			case "Normal":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "正常";
				} else {
					return "NORM";
				}
			case "SignalWeak":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "信号弱";
				} else {
					return "WEAK";
				}
			case "Unavailable":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "不可用";
				} else {
					return "UNAVAIL";
				}
			case "NoWind":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "无风";
				} else {
					return "---°/---";
				}
			case "FlapsUp":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "收起";
				} else {
					return "UP";
				}
			case "GPS":
				return "GPS";
			case "Accel":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "加速计";
				} else {
					return "ACCEL";
				}
			case "DualChannel":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "双通道";
				} else {
					return "DUAL CH";
				}
			case "Manual":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "手动";
				} else {
					return "MAN";
				}
			case "DepartureGround":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "出发地面";
				} else {
					return "DEP GND";
				}
			case "TakeOff":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "起飞";
				} else {
					return "T/O";
				}
			case "Cruise":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "巡航";
				} else {
					return "CRZ";
				}
			case "Land":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "降落";
				} else {
					return "LAND";
				}
			case "ArrivalGround":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "到达地面";
				} else {
					return "ARR GND";
				}
			case "EmergencyReturn":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "紧急返航";
				} else {
					return "EMG RTN";
				}
			case "AttitudeUnavailable":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "姿态仪不可用";
				} else {
					return "ATT";
				}
			case "AttitudeDisabled":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "姿态仪已禁用";
				} else {
					return "ATT OFF";
				}
			case "SpeedUnavailable":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "空速表不可用";
				} else {
					return "SPD";
				}
			case "AltitudeUnavailable":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "高度表不可用";
				} else {
					return "ALT";
				}
			case "MetricAltitude":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "米";
				} else {
					return "M";
				}
			case "VerticalSpeedUnavailable":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "垂直速度表不可用";
				} else {
					return "V/S";
				}
			case "HeadingUnavailable":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "朝向指示器不可用";
				} else {
					return "HDG";
				}
			case "DistanceTooFar":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "距离过远";
				} else {
					return "---";
				}
			case "Hour":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "时";
				} else {
					return "H";
				}
			case "Minute":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "分";
				} else {
					return "M";
				}
			case "BankAngle":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "倾角过大";
				} else {
					return "BANK ANGLE";
				}
			case "AirspeedLow":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "空速过低";
				} else {
					return "SPD LOW";
				}
			case "Overspeed":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "超速";
				} else {
					return "OVERSPEED";
				}
			case "DontSink":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "不要下降";
				} else {
					return "DON'T SINK";
				}
			case "GlideSlope":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "偏离下滑道";
				} else {
					return "G/S";
				}
			case "SinkRate":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "下降率过大";
				} else {
					return "SINK RATE";
				}
			case "PullUp":
				if(Subsystem.I18n.AlwaysUseEnglishTerminologyOnPFD == false) {
					return "拉杆!";
				} else {
					return "PULL UP!";
				}
			case "KilometerPerHour":
				return "公里/小时";
			case "MilePerHour":
				return "英里/小时";
			case "Knot":
				return "节";
			case "Kilometer":
				return "公里";
			case "Mile":
				return "英里";
			case "NauticalMile":
				return "海里";
			case "Meter":
				return "米";
			case "Feet":
			case "FeetButShowMeterBeside":
				return "英尺";
			case "Celsius":
				return "℃";
			case "Fahrenheit":
				return "℉";
			case "Hectopascal":
				return "百帕";
			case "InchOfMercury":
				return "<span class=\"SmallerText\">英寸<br />汞柱</span>";
			default:
				AlertSystemError("The value of Value \"" + Value + "\" in function Translate is invalid.");
				break;
		}
	}

	// Maths
	function CalcAttitude(AccelVector, AccelVectorWithGravity) { // https://youtube.com/watch?v=p7tjtLkIlFo
		let Gravity = 9.80665,
		Calc = (AccelVectorWithGravity.Forward - AccelVector.Forward) / Gravity;
		if(Calc < -1) {
			Calc = -1;
		}
		if(Calc > 1) {
			Calc = 1;
		}
		return {
			Pitch: -Math.asin(Calc) / (Math.PI / 180),
			Roll: Math.atan2(AccelVectorWithGravity.Right - AccelVector.Right, AccelVector.Upward - AccelVectorWithGravity.Upward) / (Math.PI / 180)
		};
	}
	function CalcTAS(GS, WindRelativeHeading, WindSpeed, VerticalSpeed) {
		let HorizontalTAS = 0, TAS = 0;
		if(WindRelativeHeading != null) {
			HorizontalTAS = GS + WindSpeed * Math.cos(WindRelativeHeading * (Math.PI / 180));
		} else {
			HorizontalTAS = GS;
		}
		TAS = Math.sqrt(Math.pow(HorizontalTAS, 2) + Math.pow(VerticalSpeed, 2));
		return TAS;
	}
	function CalcOutsideAirTemperature(Altitude, AirportAltitude, AirportTemperature) { // Air temperature drops 2 Celsius for each 1000 feet. (https://aviation.stackexchange.com/a/44763)
		return AirportTemperature - 2 * ((Altitude - AirportAltitude) / 304.8);
	}
	function CalcOutsideAirPressure(Altitude, QNH, OutsideAirTemperature) { // https://www.omnicalculator.com/physics/air-pressure-at-altitude
		return QNH * Math.pow(Math.E, (-9.80665 * 0.0289644 * Altitude) / (8.31432 * OutsideAirTemperature));
	}
	function CalcOutsideAirDensity(OutsideAirTemperature, OutsideAirPressure, RelativeHumidity) { // https://www.omnicalculator.com/physics/air-density
		let WaterVaporPressure = 0, DryAirPressure = 0, CelsiusTemperature = 0, Calc = 0, Calc2 = 0;
		CelsiusTemperature = ConvertUnit(OutsideAirTemperature, "Kelvin", "Celsius");
		WaterVaporPressure = 6.1078 * Math.pow(10, (7.5 * CelsiusTemperature) / (CelsiusTemperature + 237.3)) * (RelativeHumidity / 100);
		DryAirPressure = OutsideAirPressure - WaterVaporPressure;
		Calc = (DryAirPressure * 100) / (287.058 * OutsideAirTemperature);
		Calc2 = (WaterVaporPressure * 100) / (461.495 * OutsideAirTemperature);
		return Calc + Calc2;
	}
	function CalcIAS(Algorithm, TAS, Altitude, AirportAltitude, AirportTemperature, RelativeHumidity, QNH, IsAttitudeConsidered, RelativePitch) { // https://aerotoolbox.com/airspeed-conversions/, https://aviation.stackexchange.com/a/25811
		let OutsideAirTemperature = 0, OutsideAirPressure = 0, OutsideAirDensity = 0, IAS = 0;
		switch(Algorithm) {
			case "SimpleAlgorithm":
				IAS = TAS / (1 + 0.02 * (Altitude / 304.8));
				break;
			case "AdvancedAlgorithmA":
				OutsideAirTemperature = CalcOutsideAirTemperature(Altitude, AirportAltitude, AirportTemperature);
				OutsideAirPressure = CalcOutsideAirPressure(Altitude, QNH, OutsideAirTemperature);
				OutsideAirDensity = CalcOutsideAirDensity(OutsideAirTemperature, OutsideAirPressure, RelativeHumidity);
				IAS = TAS * Math.sqrt(OutsideAirDensity / 1.225);
				break;
			case "AdvancedAlgorithmB":
				OutsideAirTemperature = CalcOutsideAirTemperature(Altitude, AirportAltitude, AirportTemperature);
				OutsideAirPressure = CalcOutsideAirPressure(Altitude, QNH, OutsideAirTemperature);
				OutsideAirDensity = CalcOutsideAirDensity(OutsideAirTemperature, OutsideAirPressure, RelativeHumidity);
				IAS = 340.3 * Math.sqrt(5 * (Math.pow(OutsideAirDensity / 2 * Math.pow(TAS, 2) / 101325 + 1, 2 / 7) - 1));
				break;
			case "UseTASDirectly":
				IAS = TAS;
				break;
			default:
				AlertSystemError("The value of Algorithm \"" + Algorithm + "\" in function CalcIAS is invalid.");
				break;
		}
		if(IsAttitudeConsidered == true) {
			return IAS * Math.cos(RelativePitch * (Math.PI / 180));
		} else {
			return IAS;
		}
	}
	function CalcMachNumber(TAS, Altitude, AirportAltitude, AirportTemperature) {
		let OutsideAirTemperature = 0, SoundSpeed = 0;
		OutsideAirTemperature = CalcOutsideAirTemperature(Altitude, AirportAltitude, AirportTemperature);
		SoundSpeed = 331.15 + 0.61 * ConvertUnit(OutsideAirTemperature, "Kelvin", "Celsius");
		return TAS / SoundSpeed;
	}
	function CalcMaxSpeedLimit(MaxSpeedOnFlapsUp, MaxSpeedOnFlapsFull, FlapsPercentage) {
		return MaxSpeedOnFlapsUp - (MaxSpeedOnFlapsUp - MaxSpeedOnFlapsFull) * (FlapsPercentage / 100);
	}
	function CalcDistance(Lat1, Lon1, Lat2, Lon2) { // Haversine formula (https://stackoverflow.com/a/27943)
		let EarthRadius = 6371008.8, LatDiffInRad = 0, LonDiffInRad = 0, Calc = 0, Distance = 0;
		LatDiffInRad = (Lat2 - Lat1) * (Math.PI / 180);
		LonDiffInRad = (Lon2 - Lon1) * (Math.PI / 180);
		Calc = Math.sin(LatDiffInRad / 2) * Math.sin(LatDiffInRad / 2) + Math.cos(Lat1 * (Math.PI / 180)) * Math.cos(Lat2 * (Math.PI / 180)) * Math.sin(LonDiffInRad / 2) * Math.sin(LonDiffInRad / 2);
		Distance = 2 * EarthRadius * Math.atan2(Math.sqrt(Calc), Math.sqrt(1 - Calc));
		return Distance;
	}

	// Alerts
	function IsExcessiveBankAngle() {
		if(PFD0.Stats.Altitude.RadioDisplay >= 9.144) { // https://skybrary.aero/articles/bank-angle-awareness
			let Threshold = 10 + 25 * ((PFD0.Stats.Altitude.RadioDisplay - 9.144) / 36.576);
			if(Threshold > 35) {
				Threshold = 35;
			}
			return Math.abs(PFD0.Stats.Attitude.Roll) >= Threshold;
		} else {
			return false;
		}
	}
	function IsAirspeedLow() {
		switch(PFD.FlightMode.FlightMode) {
			case "DepartureGround":
			case "ArrivalGround":
				return false;
			case "TakeOff":
			case "Cruise":
			case "Land":
			case "EmergencyReturn":
				return PFD0.Stats.Speed.TapeDisplay <= PFD.Speed.SpeedLimit.Min;
			default:
				AlertSystemError("The value of PFD.FlightMode.FlightMode \"" + PFD.FlightMode.FlightMode + "\" in function IsAirspeedLow is invalid.");
				break;
		}
	}
	function IsOverspeed() {
		return PFD0.Stats.Speed.TapeDisplay >= CalcMaxSpeedLimit(PFD.Speed.SpeedLimit.MaxOnFlapsUp, PFD.Speed.SpeedLimit.MaxOnFlapsFull, PFD.Flaps);
	}
	function IsDontSink() {
		switch(PFD.FlightMode.FlightMode) {
			case "DepartureGround":
			case "Cruise":
			case "Land":
			case "ArrivalGround":
			case "EmergencyReturn":
				return false;
			case "TakeOff":
				return PFD0.Stats.Speed.Vertical <= -0.508;
			default:
				AlertSystemError("The value of PFD.FlightMode.FlightMode \"" + PFD.FlightMode.FlightMode + "\" in function IsDontSink is invalid.");
				break;
		}
	}
	function IsExcessivelyBelowGlideSlope() {
		switch(PFD.FlightMode.FlightMode) {
			case "DepartureGround":
			case "TakeOff":
			case "Cruise":
			case "ArrivalGround":
				return false;
			case "Land":
			case "EmergencyReturn":
				return PFD0.Stats.Altitude.RadioDisplay <= PFD0.Stats.DME.Distance * Math.tan(3 * (Math.PI / 180)) - 60.96;
			default:
				AlertSystemError("The value of PFD.FlightMode.FlightMode \"" + PFD.FlightMode.FlightMode + "\" in function IsExcessivelyBelowGlideSlope is invalid.");
				break;
		}
	}
	function IsSinkRate() { // https://commons.wikimedia.org/wiki/File:FAA_excessive_sink_rate_graph.svg
		let HeightRange = {
			Min: 0, Max: 0
		};
		switch(true) {
			case PFD0.Stats.Speed.Vertical > -6:
				return false;
			case PFD0.Stats.Speed.Vertical <= -6 && PFD0.Stats.Speed.Vertical > -8:
				HeightRange.Min = 60 - 40 * ((-PFD0.Stats.Speed.Vertical - 6) / 2);
				HeightRange.Max = 60 + 90 * ((-PFD0.Stats.Speed.Vertical - 6) / 2);
				return PFD0.Stats.Altitude.RadioDisplay >= HeightRange.Min && PFD0.Stats.Altitude.RadioDisplay <= HeightRange.Max;
			case PFD0.Stats.Speed.Vertical <= -8 && PFD0.Stats.Speed.Vertical > -30:
				HeightRange.Min = 20 - 10 * ((-PFD0.Stats.Speed.Vertical - 8) / 22);
				HeightRange.Max = 150 + 850 * ((-PFD0.Stats.Speed.Vertical - 8) / 22);
				return PFD0.Stats.Altitude.RadioDisplay >= HeightRange.Min && PFD0.Stats.Altitude.RadioDisplay <= HeightRange.Max;
			case PFD0.Stats.Speed.Vertical <= -30 && PFD0.Stats.Speed.Vertical > -50:
				HeightRange.Min = 10 - 10 * ((-PFD0.Stats.Speed.Vertical - 30) / 20);
				HeightRange.Max = 1000 + 500 * ((-PFD0.Stats.Speed.Vertical - 30) / 20);
				return PFD0.Stats.Altitude.RadioDisplay >= HeightRange.Min && PFD0.Stats.Altitude.RadioDisplay <= HeightRange.Max;
			case PFD0.Stats.Speed.Vertical <= -50:
				HeightRange.Max = 1500 + 500 * ((-PFD0.Stats.Speed.Vertical - 50) / 20);
				return PFD0.Stats.Altitude.RadioDisplay <= HeightRange.Max;
		}
	}
	function IsSinkRatePullUp() {
		let HeightRange = {
			Min: 0, Max: 0
		};
		switch(true) {
			case PFD0.Stats.Speed.Vertical > -8:
				return false;
			case PFD0.Stats.Speed.Vertical <= -8 && PFD0.Stats.Speed.Vertical > -30:
				HeightRange.Min = 20 - 10 * ((-PFD0.Stats.Speed.Vertical - 8) / 22);
				HeightRange.Max = 60 + 740 * ((-PFD0.Stats.Speed.Vertical - 8) / 22);
				return PFD0.Stats.Altitude.RadioDisplay >= HeightRange.Min && PFD0.Stats.Altitude.RadioDisplay <= HeightRange.Max;
			case PFD0.Stats.Speed.Vertical <= -30 && PFD0.Stats.Speed.Vertical > -50:
				HeightRange.Min = 10 - 10 * ((-PFD0.Stats.Speed.Vertical - 30) / 20);
				HeightRange.Max = 800 + 400 * ((-PFD0.Stats.Speed.Vertical - 30) / 20);
				return PFD0.Stats.Altitude.RadioDisplay >= HeightRange.Min && PFD0.Stats.Altitude.RadioDisplay <= HeightRange.Max;
			case PFD0.Stats.Speed.Vertical <= -50:
				HeightRange.Max = 1200 + 400 * ((-PFD0.Stats.Speed.Vertical - 50) / 20);
				return PFD0.Stats.Altitude.RadioDisplay <= HeightRange.Max;
		}
	}

// Error handling
function AlertSystemError(Message) {
	console.error("● 系统错误\n" +
		Message);
	ShowDialog("System_Error",
		"Error",
		"抱歉，发生了系统错误。您可尝试清空用户数据来修复错误，或向我提供反馈。若无法关闭对话框，请点击「强制停止」。<br />" +
		"<br />" +
		"错误信息：" + Message,
		"", "了解更多", "强制停止", "关闭");
}
