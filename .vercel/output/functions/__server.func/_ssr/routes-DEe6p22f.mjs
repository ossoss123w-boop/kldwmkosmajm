import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as House, a as Trash2, c as Shuffle, d as Repeat1, f as Play, g as Library, h as ListPlus, l as Search, m as Palette, n as VolumeX, o as SkipForward, p as Pause, r as Volume2, s as SkipBack, t as X, u as Repeat, v as Heart, y as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as BRAND } from "./router-BDReDDEO.mjs";
import { a as DialogOverlay, c as DialogTrigger, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { n as searchCatalog, r as tracksFrom, t as PLAYLISTS } from "./catalog-ChAwHF6w.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DEe6p22f.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function artwork(id, quality = "hqdefault") {
	return `https://i.ytimg.com/vi/${encodeURIComponent(id)}/${quality}.jpg`;
}
function formatTime(seconds) {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	const total = Math.floor(seconds);
	const hours = Math.floor(total / 3600);
	const minutes = Math.floor(total % 3600 / 60);
	const secs = total % 60;
	const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
	const ss = String(secs).padStart(2, "0");
	return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}
function sessionArtwork(track) {
	return [
		{
			src: artwork(track.id, "default"),
			sizes: "120x90",
			type: "image/jpeg"
		},
		{
			src: artwork(track.id, "mqdefault"),
			sizes: "320x180",
			type: "image/jpeg"
		},
		{
			src: artwork(track.id, "hqdefault"),
			sizes: "480x360",
			type: "image/jpeg"
		}
	];
}
var usePlayer = create()((set) => ({
	view: "home",
	query: "",
	libraryFocus: null,
	queue: [],
	index: 0,
	playing: false,
	shuffle: false,
	repeat: "off",
	progress: 0,
	duration: 0,
	error: null,
	setView: (view) => set({ view }),
	setQuery: (query) => set({ query }),
	setLibraryFocus: (libraryFocus) => set({ libraryFocus })
}));
function useCurrentTrack() {
	return usePlayer((state) => state.queue[state.index] ?? null);
}
var MEMORY = {
	getItem: () => null,
	setItem: () => void 0,
	removeItem: () => void 0
};
function browserStorage() {
	if (typeof window === "undefined") return MEMORY;
	return {
		getItem: (name) => {
			try {
				return localStorage.getItem(name);
			} catch {
				return null;
			}
		},
		setItem: (name, value) => {
			try {
				localStorage.setItem(name, value);
			} catch {}
		},
		removeItem: (name) => {
			try {
				localStorage.removeItem(name);
			} catch {}
		}
	};
}
function rememberMap(known, tracks) {
	const next = { ...known };
	for (const item of tracks) {
		delete next[item.id];
		next[item.id] = item;
	}
	const ids = Object.keys(next);
	if (ids.length > 180) for (const id of ids.slice(0, ids.length - 180)) delete next[id];
	return next;
}
var usePrefs = create()(persist((set) => ({
	scene: "bruma",
	imageUrl: null,
	volume: 80,
	muted: false,
	liked: [],
	userPlaylists: [],
	recents: [],
	known: {},
	setScene: (scene) => set({ scene }),
	setImageUrl: (imageUrl) => set({ imageUrl }),
	setVolume: (volume) => set({ volume }),
	setMuted: (muted) => set({ muted }),
	toggleLike: (track) => set((state) => {
		return {
			liked: state.liked.includes(track.id) ? state.liked.filter((id) => id !== track.id) : [...state.liked, track.id],
			known: rememberMap(state.known, [track])
		};
	}),
	remember: (tracks) => set((state) => ({ known: rememberMap(state.known, tracks) })),
	pushRecent: (id) => set((state) => ({ recents: [id, ...state.recents.filter((item) => item !== id)].slice(0, 16) })),
	createPlaylist: (name) => {
		const trimmed = name.trim().slice(0, 40);
		if (!trimmed) return null;
		const playlist = {
			id: `p-${Date.now().toString(36)}`,
			name: trimmed,
			trackIds: []
		};
		set((state) => ({ userPlaylists: [...state.userPlaylists, playlist] }));
		return playlist.id;
	},
	deletePlaylist: (id) => set((state) => ({ userPlaylists: state.userPlaylists.filter((playlist) => playlist.id !== id) })),
	addTrack: (playlistId, track) => set((state) => ({
		known: rememberMap(state.known, [track]),
		userPlaylists: state.userPlaylists.map((playlist) => playlist.id === playlistId && !playlist.trackIds.includes(track.id) ? {
			...playlist,
			trackIds: [...playlist.trackIds, track.id]
		} : playlist)
	})),
	removeTrack: (playlistId, trackId) => set((state) => ({ userPlaylists: state.userPlaylists.map((playlist) => playlist.id === playlistId ? {
		...playlist,
		trackIds: playlist.trackIds.filter((id) => id !== trackId)
	} : playlist) }))
}), {
	name: "aurasound-prefs-v1",
	storage: createJSONStorage(browserStorage),
	skipHydration: true,
	partialize: (state) => ({
		scene: state.scene,
		imageUrl: state.imageUrl,
		volume: state.volume,
		muted: state.muted,
		liked: state.liked,
		userPlaylists: state.userPlaylists,
		recents: state.recents,
		known: state.known
	})
}));
var apiPromise = null;
var creating = null;
var player = null;
var pendingId = null;
var loadedId = null;
var hooks = {
	onState: () => void 0,
	onError: () => void 0
};
function setPlayerHooks(next) {
	hooks.onState = next.onState;
	hooks.onError = next.onError;
}
function preloadApi() {
	if (typeof window === "undefined") return Promise.resolve();
	if (window.YT?.Player) return Promise.resolve();
	if (apiPromise) return apiPromise;
	apiPromise = new Promise((resolve, reject) => {
		const previous = window.onYouTubeIframeAPIReady;
		window.onYouTubeIframeAPIReady = () => {
			previous?.();
			resolve();
		};
		const script = document.createElement("script");
		script.src = "https://www.youtube.com/iframe_api";
		script.async = true;
		script.onerror = () => {
			apiPromise = null;
			reject(/* @__PURE__ */ new Error("yt-script"));
		};
		document.head.appendChild(script);
	});
	return apiPromise;
}
function ensurePlayer() {
	if (player) return Promise.resolve();
	if (creating) return creating;
	creating = preloadApi().then(() => new Promise((resolve, reject) => {
		const host = document.createElement("div");
		host.id = "yt-audio-host";
		host.className = "yt-host";
		host.setAttribute("aria-hidden", "true");
		document.body.appendChild(host);
		const timeout = window.setTimeout(() => reject(/* @__PURE__ */ new Error("yt-timeout")), 15e3);
		const YT = window.YT;
		if (!YT?.Player) {
			window.clearTimeout(timeout);
			reject(/* @__PURE__ */ new Error("yt-missing"));
			return;
		}
		new YT.Player(host, {
			width: "1",
			height: "1",
			playerVars: {
				autoplay: 0,
				controls: 0,
				disablekb: 1,
				fs: 0,
				modestbranding: 1,
				rel: 0,
				playsinline: 1,
				iv_load_policy: 3,
				origin: window.location.origin
			},
			events: {
				onReady: (event) => {
					window.clearTimeout(timeout);
					player = event.target;
					const { volume, muted } = usePrefs.getState();
					applyVolume(muted ? 0 : volume);
					if (pendingId) player.loadVideoById(pendingId);
					resolve();
				},
				onStateChange: (event) => hooks.onState(event.data),
				onError: (event) => hooks.onError(event.data)
			}
		});
	})).catch((error) => {
		creating = null;
		throw error;
	});
	return creating;
}
function loadAndPlay(id) {
	loadedId = id;
	pendingId = id;
	try {
		player?.loadVideoById(id);
	} catch {}
}
function getLoadedId() {
	return loadedId;
}
function playVideo() {
	try {
		player?.playVideo();
	} catch {}
}
function pauseVideo() {
	try {
		player?.pauseVideo();
	} catch {}
}
function seekTo(seconds) {
	try {
		player?.seekTo(seconds, true);
	} catch {}
}
function applyVolume(volume) {
	if (!player) return;
	try {
		player.setVolume(volume);
		if (volume <= 0) player.mute();
		else player.unMute();
	} catch {}
}
function readTimes() {
	if (!player) return {
		progress: 0,
		duration: 0
	};
	try {
		return {
			progress: player.getCurrentTime() || 0,
			duration: player.getDuration() || 0
		};
	} catch {
		return {
			progress: 0,
			duration: 0
		};
	}
}
var ticker = 0;
var sessionReady = false;
var holdPauseUntil = 0;
function holdPause() {
	holdPauseUntil = Date.now() + 900;
}
function currentTrack() {
	const { queue, index } = usePlayer.getState();
	return queue[index] ?? null;
}
function syncSession(track, playing) {
	if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
	if (!track) {
		navigator.mediaSession.playbackState = "none";
		return;
	}
	navigator.mediaSession.metadata = new MediaMetadata({
		title: track.title,
		artist: track.artist,
		album: BRAND.name,
		artwork: sessionArtwork(track)
	});
	navigator.mediaSession.playbackState = playing ? "playing" : "paused";
}
function publishPosition(progress, duration) {
	if (typeof navigator === "undefined" || !("mediaSession" in navigator) || !(duration > 0)) return;
	const position = Math.min(Math.max(progress, 0), Math.max(duration - .05, 0));
	try {
		navigator.mediaSession.setPositionState({
			duration,
			playbackRate: 1,
			position
		});
	} catch {}
}
function stopTicker() {
	window.clearInterval(ticker);
	ticker = 0;
}
function startTicker() {
	stopTicker();
	ticker = window.setInterval(() => {
		const times = readTimes();
		const prev = usePlayer.getState();
		const duration = times.duration || prev.duration;
		if (Math.abs(times.progress - prev.progress) < .25 && duration === prev.duration) return;
		usePlayer.setState({
			progress: times.progress,
			duration
		});
		publishPosition(times.progress, duration);
	}, 500);
}
async function arm(track) {
	holdPause();
	usePrefs.getState().remember([track]);
	usePrefs.getState().pushRecent(track.id);
	syncSession(track, true);
	await ensurePlayer();
	installMediaSession();
	loadAndPlay(track.id);
}
async function playTrack(track, queue) {
	const list = queue && queue.length > 0 ? queue : [track];
	const index = Math.max(0, list.findIndex((item) => item.id === track.id));
	usePrefs.getState().remember(list);
	usePlayer.setState({
		queue: list,
		index,
		playing: true,
		error: null,
		progress: 0,
		duration: track.duration || 0
	});
	try {
		await arm(track);
	} catch {
		usePlayer.setState({
			playing: false,
			error: "No se pudo cargar el reproductor de YouTube. Inténtalo de nuevo."
		});
	}
}
async function playIndex(index) {
	const track = usePlayer.getState().queue[index];
	if (!track) return;
	usePlayer.setState({
		index,
		playing: true,
		error: null,
		progress: 0,
		duration: track.duration || 0
	});
	try {
		await arm(track);
	} catch {
		usePlayer.setState({
			playing: false,
			error: "No se pudo cambiar de pista."
		});
	}
}
async function togglePlay() {
	const track = currentTrack();
	if (!track) return;
	if (usePlayer.getState().playing) {
		pauseVideo();
		stopTicker();
		usePlayer.setState({ playing: false });
		syncSession(track, false);
		return;
	}
	usePlayer.setState({
		playing: true,
		error: null
	});
	try {
		holdPause();
		await ensurePlayer();
		installMediaSession();
		syncSession(track, true);
		if (getLoadedId() === track.id) playVideo();
		else loadAndPlay(track.id);
	} catch {
		usePlayer.setState({
			playing: false,
			error: "Pulsa reproducir otra vez para activar el audio."
		});
	}
}
async function next() {
	const { queue, index, repeat } = usePlayer.getState();
	if (!queue.length) return;
	if (index + 1 < queue.length) {
		await playIndex(index + 1);
		return;
	}
	if (repeat === "all") {
		await playIndex(0);
		return;
	}
	stopTicker();
	usePlayer.setState({
		playing: false,
		progress: 0
	});
	syncSession(currentTrack(), false);
}
async function prev() {
	const { queue, index, progress } = usePlayer.getState();
	if (!queue.length) return;
	if (progress > 3) {
		seek(0);
		return;
	}
	await playIndex(index <= 0 ? queue.length - 1 : index - 1);
}
function seek(seconds) {
	const duration = usePlayer.getState().duration;
	const nextTime = Math.min(Math.max(0, seconds), duration > 0 ? duration : seconds);
	usePlayer.setState({ progress: nextTime });
	seekTo(nextTime);
	publishPosition(nextTime, duration);
}
function setVolume(volume) {
	const next = Math.min(100, Math.max(0, Math.round(volume)));
	usePrefs.getState().setVolume(next);
	if (next > 0) usePrefs.getState().setMuted(false);
	applyVolume(next);
}
function toggleMute() {
	const { muted, volume } = usePrefs.getState();
	const next = !muted;
	usePrefs.getState().setMuted(next);
	applyVolume(next ? 0 : volume);
}
function toggleShuffle() {
	const { shuffle, queue, index } = usePlayer.getState();
	if (!shuffle && queue.length > 1) {
		const current = queue[index];
		const rest = queue.filter((_, itemIndex) => itemIndex !== index);
		for (let cursor = rest.length - 1; cursor > 0; cursor -= 1) {
			const swap = Math.floor(Math.random() * (cursor + 1));
			const left = rest[cursor];
			const right = rest[swap];
			if (left && right) {
				rest[cursor] = right;
				rest[swap] = left;
			}
		}
		usePlayer.setState({
			shuffle: true,
			queue: current ? [current, ...rest] : rest,
			index: 0
		});
		return;
	}
	usePlayer.setState({ shuffle: !shuffle });
}
function cycleRepeat() {
	const order = [
		"off",
		"all",
		"one"
	];
	const { repeat } = usePlayer.getState();
	const next = order[(order.indexOf(repeat) + 1) % order.length] ?? "off";
	usePlayer.setState({ repeat: next });
}
function onEnded() {
	const { repeat, index, queue } = usePlayer.getState();
	if (repeat === "one") {
		const track = queue[index];
		if (!track) return;
		holdPause();
		usePlayer.setState({
			playing: true,
			progress: 0,
			error: null
		});
		loadAndPlay(track.id);
		syncSession(track, true);
		return;
	}
	if (index + 1 < queue.length) {
		playIndex(index + 1);
		return;
	}
	if (repeat === "all" && queue.length) {
		playIndex(0);
		return;
	}
	stopTicker();
	usePlayer.setState({ playing: false });
	syncSession(currentTrack(), false);
}
function installMediaSession() {
	if (sessionReady || typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
	sessionReady = true;
	const bind = (action, run) => {
		try {
			navigator.mediaSession.setActionHandler(action, run);
		} catch {}
	};
	bind("play", () => {
		if (!usePlayer.getState().playing) togglePlay();
	});
	bind("pause", () => {
		if (usePlayer.getState().playing) togglePlay();
	});
	bind("previoustrack", () => void prev());
	bind("nexttrack", () => void next());
	bind("seekbackward", () => seek(usePlayer.getState().progress - 10));
	bind("seekforward", () => seek(usePlayer.getState().progress + 10));
	try {
		navigator.mediaSession.setActionHandler("seekto", (details) => {
			if (typeof details.seekTime === "number") seek(details.seekTime);
		});
	} catch {}
}
setPlayerHooks({
	onState: (code) => {
		const track = currentTrack();
		if (code === 1) {
			usePlayer.setState({
				playing: true,
				error: null
			});
			startTicker();
			syncSession(track, true);
			return;
		}
		if (code === 2) {
			if (Date.now() < holdPauseUntil) return;
			stopTicker();
			usePlayer.setState({ playing: false });
			syncSession(track, false);
			return;
		}
		if (code === 0) onEnded();
	},
	onError: (code) => {
		stopTicker();
		usePlayer.setState({
			playing: false,
			error: code === 101 || code === 150 ? "Este vídeo no permite reproducirse embebido. Prueba otro resultado." : "No se pudo reproducir esta pista."
		});
		syncSession(currentTrack(), false);
	}
});
var SCENES = /* @__PURE__ */ new Set([
	"bruma",
	"nocturno",
	"brasa",
	"niebla",
	"marea",
	"image"
]);
function Backdrop() {
	const scene = usePrefs((state) => state.scene);
	const imageUrl = usePrefs((state) => state.imageUrl);
	const safe = SCENES.has(scene) ? scene : "bruma";
	const image = safe === "image" && imageUrl ? imageUrl : null;
	const mode = image ? "image" : safe === "image" ? "bruma" : safe;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: mode === "image" ? "scene scene-image" : `scene scene-${mode}`,
		style: image ? { backgroundImage: `url(${JSON.stringify(image)})` } : void 0
	});
}
function TrackCard({ track, queue }) {
	const currentId = usePlayer((state) => state.queue[state.index]?.id ?? null);
	const playing = usePlayer((state) => state.playing);
	const isCurrent = currentId === track.id;
	const live = isCurrent && playing;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: isCurrent ? "track-card glass is-current" : "track-card glass",
		"aria-label": `${live ? "Pausar" : "Reproducir"} ${track.title} de ${track.artist}`,
		onClick: () => {
			if (isCurrent) togglePlay();
			else playTrack(track, queue);
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "cover",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: artwork(track.id),
					alt: "",
					draggable: false
				}),
				live ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "eq",
					"aria-hidden": "true",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: live ? "play-fab is-pause" : "play-fab",
					"aria-hidden": "true",
					children: live ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "track-title clamp-2",
			children: track.title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "track-artist truncate",
			children: track.artist
		})] })]
	});
}
function Rail({ title, tracks }) {
	if (!tracks.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "section",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "section-head",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "icon-btn",
				"aria-label": `Reproducir ${title}`,
				onClick: () => {
					const first = tracks[0];
					if (first) playTrack(first, tracks);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rail",
			children: tracks.map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackCard, {
				track,
				queue: tracks
			}, track.id))
		})]
	});
}
function HomeView() {
	const recents = usePrefs((state) => state.recents);
	const known = usePrefs((state) => state.known);
	const recentTracks = tracksFrom(recents, known);
	const featuredList = tracksFrom(PLAYLISTS[0]?.trackIds ?? []);
	const featured = featuredList[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		featured ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "feature glass",
			onClick: () => void playTrack(featured, featuredList),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: artwork(featured.id),
					alt: ""
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: "En rotación"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: featured.title }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: featured.artist })
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "play-btn",
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {})
				})
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rail, {
			title: "Sigue escuchando",
			tracks: recentTracks
		}),
		PLAYLISTS.map((playlist) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rail, {
			title: playlist.name,
			tracks: tracksFrom(playlist.trackIds)
		}, playlist.id))
	] });
}
function LibraryView() {
	const focus = usePlayer((state) => state.libraryFocus);
	const setFocus = usePlayer((state) => state.setLibraryFocus);
	const liked = usePrefs((state) => state.liked);
	const known = usePrefs((state) => state.known);
	const userPlaylists = usePrefs((state) => state.userPlaylists);
	const createPlaylist = usePrefs((state) => state.createPlaylist);
	const deletePlaylist = usePrefs((state) => state.deletePlaylist);
	const removeTrack = usePrefs((state) => state.removeTrack);
	const [name, setName] = (0, import_react.useState)("");
	if (!focus) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Tu biblioteca" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "note",
			children: "Playlists de AuraSound y las que guardes en este navegador."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "create-row",
			onSubmit: (event) => {
				event.preventDefault();
				const id = createPlaylist(name);
				if (id) {
					setName("");
					setFocus(id);
				}
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: name,
				onChange: (event) => setName(event.target.value),
				placeholder: "Nombre de la playlist",
				"aria-label": "Nombre de la playlist",
				maxLength: 40
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "submit",
				className: "solid-btn",
				children: "Crear"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "tile-grid",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "tile glass",
					onClick: () => setFocus("likes"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tile-mark",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Me gusta" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [liked.length, " canciones"] })] })]
				}),
				PLAYLISTS.map((playlist) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "tile glass",
					onClick: () => setFocus(playlist.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tile-mark",
						children: playlist.name.slice(0, 1)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: playlist.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: playlist.description })] })]
				}, playlist.id)),
				userPlaylists.map((playlist) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "tile glass",
					onClick: () => setFocus(playlist.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tile-mark",
						children: playlist.name.slice(0, 1)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: playlist.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [playlist.trackIds.length, " canciones"] })] })]
				}, playlist.id))
			]
		})
	] });
	const catalog = PLAYLISTS.find((playlist) => playlist.id === focus);
	const owned = userPlaylists.find((playlist) => playlist.id === focus);
	const title = focus === "likes" ? "Me gusta" : catalog?.name ?? owned?.name ?? "Playlist";
	const description = catalog?.description ?? (focus === "likes" ? "Tus canciones marcadas" : "Creada en este navegador");
	const ids = focus === "likes" ? liked : catalog?.trackIds ?? owned?.trackIds ?? [];
	const tracks = tracksFrom(ids, known);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "back-btn",
			onClick: () => setFocus(null),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {}), "Biblioteca"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "library-head",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: description })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "row-actions",
				children: [tracks[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "solid-btn",
					onClick: () => void playTrack(tracks[0], tracks),
					children: "Reproducir"
				}) : null, owned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "danger",
					"aria-label": "Eliminar playlist",
					onClick: () => {
						deletePlaylist(owned.id);
						setFocus(null);
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
				}) : null]
			})]
		}),
		tracks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "note",
			children: "Todavía no hay canciones aquí."
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "track-list",
			children: tracks.map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "track-line glass",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "result-row bare",
					onClick: () => void playTrack(track, tracks),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: artwork(track.id),
							alt: ""
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "result-title clamp-2",
							children: track.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "result-artist",
							children: track.artist
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "result-artist",
							children: formatTime(track.duration)
						})
					]
				}), owned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "danger",
					"aria-label": `Quitar ${track.title}`,
					onClick: () => removeTrack(owned.id, track.id),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
				}) : null]
			}) }, track.id))
		})
	] });
}
function PlayerBar() {
	const track = useCurrentTrack();
	const playing = usePlayer((state) => state.playing);
	const shuffle = usePlayer((state) => state.shuffle);
	const repeat = usePlayer((state) => state.repeat);
	const error = usePlayer((state) => state.error);
	const liked = usePrefs((state) => track ? state.liked.includes(track.id) : false);
	const toggleLike = usePrefs((state) => state.toggleLike);
	const volume = usePrefs((state) => state.volume);
	const muted = usePrefs((state) => state.muted);
	const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "player-bar glass",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "player-grid",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "player-meta",
					children: [
						track ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: artwork(track.id),
							alt: ""
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "cover-fallback" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "player-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: track ? track.title : "Elige una canción" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: track ? track.artist : BRAND.tagline }),
								error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "player-error",
									children: error
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-btn",
							"aria-label": liked ? "Quitar de me gusta" : "Me gusta",
							"aria-pressed": liked,
							disabled: !track,
							onClick: () => {
								if (track) toggleLike(track);
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: liked ? "is-fill" : void 0 })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SaveButton, {})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "player-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "transport",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-btn",
								"aria-label": "Aleatorio",
								"aria-pressed": shuffle,
								onClick: toggleShuffle,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-btn",
								"aria-label": "Anterior",
								disabled: !track,
								onClick: () => void prev(),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "play-btn",
								"aria-label": playing ? "Pausar" : "Reproducir",
								disabled: !track,
								onClick: () => void togglePlay(),
								children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-btn",
								"aria-label": "Siguiente",
								disabled: !track,
								onClick: () => void next(),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-btn",
								"aria-label": repeat === "one" ? "Repetir una" : repeat === "all" ? "Repetir todo" : "Repetir",
								"aria-pressed": repeat !== "off",
								onClick: cycleRepeat,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RepeatIcon, {})
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "player-vol",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "icon-btn",
						"aria-label": muted || volume === 0 ? "Activar sonido" : "Silenciar",
						onClick: toggleMute,
						children: muted || volume === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "range",
						type: "range",
						min: 0,
						max: 100,
						value: muted ? 0 : volume,
						"aria-label": "Volumen",
						onChange: (event) => setVolume(Number(event.target.value)),
						style: { background: `linear-gradient(to right, var(--color-accent) ${muted ? 0 : volume}%, color-mix(in oklab, var(--color-fg) 22%, transparent) ${muted ? 0 : volume}%)` }
					})]
				})
			]
		})
	});
}
function Progress() {
	const progress = usePlayer((state) => state.progress);
	const duration = usePlayer((state) => state.duration);
	const [drag, setDrag] = (0, import_react.useState)(null);
	const shown = drag ?? progress;
	const max = duration > 0 ? duration : 0;
	const pct = max > 0 ? Math.min(100, shown / max * 100) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "progress",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatTime(shown) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "range",
				type: "range",
				min: 0,
				max: max || 0,
				step: .1,
				value: max ? Math.min(shown, max) : 0,
				"aria-label": "Progreso",
				disabled: !max,
				onChange: (event) => setDrag(Number(event.target.value)),
				onPointerUp: () => {
					if (drag != null) seek(drag);
					setDrag(null);
				},
				onKeyUp: () => {
					if (drag != null) seek(drag);
					setDrag(null);
				},
				onBlur: () => setDrag(null),
				style: { background: `linear-gradient(to right, var(--color-accent) ${pct}%, color-mix(in oklab, var(--color-fg) 22%, transparent) ${pct}%)` }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatTime(max) })
		]
	});
}
function SaveButton() {
	const track = useCurrentTrack();
	const playlists = usePrefs((state) => state.userPlaylists);
	const addTrack = usePrefs((state) => state.addTrack);
	const createPlaylist = usePrefs((state) => state.createPlaylist);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const close = () => setOpen(false);
		window.addEventListener("pointerdown", close);
		return () => window.removeEventListener("pointerdown", close);
	}, [open]);
	if (!track) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: "icon-btn",
		"aria-label": "Añadir a playlist",
		disabled: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListPlus, {})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "save-wrap",
		onPointerDown: (event) => event.stopPropagation(),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "icon-btn",
			"aria-label": "Añadir a playlist",
			"aria-expanded": open,
			onClick: () => setOpen((value) => !value),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListPlus, {})
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "save-menu glass",
			role: "menu",
			children: [
				playlists.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "note",
					children: "Aún no tienes playlists."
				}) : null,
				playlists.map((playlist) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					role: "menuitem",
					onClick: () => {
						addTrack(playlist.id, track);
						setOpen(false);
					},
					children: [playlist.trackIds.includes(track.id) ? "Ya está en " : "Añadir a ", playlist.name]
				}, playlist.id)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
					className: "menu-create",
					onSubmit: (event) => {
						event.preventDefault();
						const id = createPlaylist(name);
						if (!id) return;
						addTrack(id, track);
						setName("");
						setOpen(false);
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: name,
						onChange: (event) => setName(event.target.value),
						placeholder: "Nueva playlist",
						"aria-label": "Nueva playlist",
						maxLength: 40
					})
				})
			]
		}) : null]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var searchTracks = createServerFn({ method: "GET" }).validator((data) => {
	const q = typeof data?.q === "string" ? data.q.trim().slice(0, 120) : "";
	if (q.length < 2) throw new Error("Escribe al menos 2 caracteres");
	return { q };
}).handler(createSsrRpc("64f9badfa647dd1a3797558def532083991ec157079cf45cb77d350391a58b9b"));
var SUGGESTIONS = [
	"Rosalía",
	"The Weeknd",
	"Queen",
	"Bad Bunny",
	"Dua Lipa",
	"Arctic Monkeys"
];
function SearchView() {
	const query = usePlayer((state) => state.query);
	const setQuery = usePlayer((state) => state.setQuery);
	const [results, setResults] = (0, import_react.useState)([]);
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [note, setNote] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const q = query.trim();
		if (q.length < 2) {
			setResults([]);
			setStatus("idle");
			setNote(null);
			return;
		}
		const controller = new AbortController();
		const timer = window.setTimeout(() => {
			setStatus("loading");
			searchTracks({
				data: { q },
				signal: controller.signal
			}).then((response) => {
				if (controller.signal.aborted) return;
				setResults(response.results);
				setNote(response.warning ?? null);
				setStatus("done");
			}).catch(() => {
				if (controller.signal.aborted) return;
				const local = searchCatalog(q);
				setResults(local);
				setNote(local.length ? "La búsqueda remota falló. Mostrando coincidencias del catálogo." : "No se pudo completar la búsqueda.");
				setStatus("done");
			});
		}, 360);
		return () => {
			window.clearTimeout(timer);
			controller.abort();
		};
	}, [query]);
	if (query.trim().length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Buscar" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "note",
			children: "Encuentra canciones en YouTube y reprodúcelas al momento, solo el audio."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "chips",
			children: SUGGESTIONS.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "chip",
				onClick: () => setQuery(name),
				children: name
			}, name))
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Resultados" }),
		status === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "note",
			children: "Buscando…"
		}) : null,
		note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "note",
			children: note
		}) : null,
		status === "done" && results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "note",
			children: [
				"Sin resultados para «",
				query.trim(),
				"»."
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "result-list",
			children: results.map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "result-row glass",
				onClick: () => void playTrack(track, results),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: artwork(track.id),
						alt: ""
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "result-title clamp-2",
						children: track.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "result-artist",
						children: track.artist
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "result-artist",
						children: track.duration ? formatTime(track.duration) : ""
					})
				]
			}) }, track.id))
		})
	] });
}
/**
* Isotipo de AuraSound.
* Para cambiar el logo, sustituye este SVG (el nombre está en src/lib/brand.ts).
*/
function Logo({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		className,
		viewBox: "0 0 32 32",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "16",
			cy: "16",
			r: "10",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "2.6"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "16",
			cy: "16",
			r: "3.1",
			className: "logo-core"
		})]
	});
}
var NAV = [
	{
		id: "home",
		label: "Inicio",
		icon: House
	},
	{
		id: "search",
		label: "Buscar",
		icon: Search
	},
	{
		id: "library",
		label: "Tu biblioteca",
		icon: Library
	}
];
function Sidebar() {
	const view = usePlayer((state) => state.view);
	const setView = usePlayer((state) => state.setView);
	const focus = usePlayer((state) => state.libraryFocus);
	const setFocus = usePlayer((state) => state.setLibraryFocus);
	const liked = usePrefs((state) => state.liked);
	const known = usePrefs((state) => state.known);
	const userPlaylists = usePrefs((state) => state.userPlaylists);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "side glass",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "logo-row",
				onClick: () => {
					setFocus(null);
					setView("home");
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "logo-badge",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "logo-mark" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "logo-name",
					children: BRAND.name
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "nav-block",
				"aria-label": "Principal",
				children: NAV.map((item) => {
					const Icon = item.icon;
					const active = view === item.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: active ? "nav-item is-active" : "nav-item",
						"aria-current": active ? "page" : void 0,
						onClick: () => {
							if (item.id === "library") setFocus(null);
							setView(item.id);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {}), item.label]
					}, item.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "side-label",
				children: "Playlists"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "side-scroll",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaylistRow, {
						name: "Me gusta",
						active: view === "library" && focus === "likes",
						onOpen: () => {
							setFocus("likes");
							setView("library");
						},
						onPlay: () => {
							const tracks = tracksFrom(liked, known);
							const first = tracks[0];
							if (first) playTrack(first, tracks);
						}
					}),
					PLAYLISTS.map((playlist) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaylistRow, {
						name: playlist.name,
						active: view === "library" && focus === playlist.id,
						onOpen: () => {
							setFocus(playlist.id);
							setView("library");
						},
						onPlay: () => {
							const tracks = tracksFrom(playlist.trackIds);
							const first = tracks[0];
							if (first) playTrack(first, tracks);
						}
					}, playlist.id)),
					userPlaylists.map((playlist) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaylistRow, {
						name: playlist.name,
						active: view === "library" && focus === playlist.id,
						onOpen: () => {
							setFocus(playlist.id);
							setView("library");
						},
						onPlay: () => {
							const tracks = tracksFrom(playlist.trackIds, known);
							const first = tracks[0];
							if (first) playTrack(first, tracks);
						}
					}, playlist.id))
				]
			})
		]
	});
}
function PlaylistRow({ name, active, onOpen, onPlay }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: active ? "plist is-active" : "plist",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "plist-name",
			onClick: onOpen,
			children: name
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "plist-play",
			"aria-label": `Reproducir ${name}`,
			onClick: onPlay,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {})
		})]
	});
}
var PRESETS = [
	{
		id: "bruma",
		label: "Bruma"
	},
	{
		id: "nocturno",
		label: "Nocturno"
	},
	{
		id: "brasa",
		label: "Brasa"
	},
	{
		id: "niebla",
		label: "Niebla"
	},
	{
		id: "marea",
		label: "Marea"
	}
];
function compressImage(file) {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const image = new Image();
		image.onload = () => {
			const scale = Math.min(1, 1400 / Math.max(image.width, image.height));
			const canvas = document.createElement("canvas");
			canvas.width = Math.max(1, Math.round(image.width * scale));
			canvas.height = Math.max(1, Math.round(image.height * scale));
			const context = canvas.getContext("2d");
			if (!context) {
				URL.revokeObjectURL(url);
				reject(/* @__PURE__ */ new Error("canvas"));
				return;
			}
			context.drawImage(image, 0, 0, canvas.width, canvas.height);
			const data = canvas.toDataURL("image/jpeg", .72);
			URL.revokeObjectURL(url);
			if (data.length > 75e4) {
				reject(/* @__PURE__ */ new Error("grande"));
				return;
			}
			resolve(data);
		};
		image.onerror = () => {
			URL.revokeObjectURL(url);
			reject(/* @__PURE__ */ new Error("imagen"));
		};
		image.src = url;
	});
}
function CustomizeButton() {
	const scene = usePrefs((state) => state.scene);
	const imageUrl = usePrefs((state) => state.imageUrl);
	const setScene = usePrefs((state) => state.setScene);
	const setImageUrl = usePrefs((state) => state.setImageUrl);
	const [url, setUrl] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTrigger, {
		className: "ghost-btn glass",
		type: "button",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "full-label",
				children: "Personalizar fondo"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "short-label",
				children: "Fondo"
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "dialog-overlay" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: "dialog-content glass",
		"aria-describedby": "fondo-ayuda",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dialog-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Personalizar fondo" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					id: "fondo-ayuda",
					className: "note",
					children: "El cristal de los paneles se adapta al fondo. Se guarda solo en este navegador."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
					className: "icon-btn",
					"aria-label": "Cerrar",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "swatch-grid",
				children: PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: scene === preset.id ? `swatch scene-${preset.id} is-selected` : `swatch scene-${preset.id}`,
					onClick: () => {
						setError(null);
						setScene(preset.id);
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: preset.label })
				}, preset.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "solid-btn file-btn",
				children: ["Subir imagen", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "sr-file",
					type: "file",
					accept: "image/*",
					onChange: (event) => {
						const file = event.target.files?.[0];
						event.target.value = "";
						if (!file) return;
						compressImage(file).then((data) => {
							setImageUrl(data);
							setScene("image");
							setError(null);
						}).catch(() => setError("No se pudo usar esa imagen. Prueba con una más pequeña."));
					}
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (event) => {
					event.preventDefault();
					let parsed;
					try {
						parsed = new URL(url.trim());
					} catch {
						setError("Pega una URL válida.");
						return;
					}
					if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
						setError("La URL tiene que empezar por http o https.");
						return;
					}
					setImageUrl(parsed.href);
					setScene("image");
					setError(null);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "field-label",
					htmlFor: "bg-url",
					children: "O pega la URL de una imagen"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "url-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "bg-url",
						value: url,
						onChange: (event) => setUrl(event.target.value),
						placeholder: "https://",
						inputMode: "url"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "solid-btn",
						children: "Usar"
					})]
				})]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "form-error",
				children: error
			}) : null,
			scene === "image" && imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-btn",
				onClick: () => {
					setImageUrl(null);
					setScene("bruma");
				},
				children: "Quitar imagen"
			}) : null
		]
	})] })] });
}
function TopBar() {
	const query = usePlayer((state) => state.query);
	const setQuery = usePlayer((state) => state.setQuery);
	const setView = usePlayer((state) => state.setView);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "topbar",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "brand-lockup",
				onClick: () => setView("home"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "logo-badge",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "logo-mark" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "logo-name",
					children: BRAND.name
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
				className: "search-form",
				role: "search",
				onSubmit: (event) => {
					event.preventDefault();
					setView("search");
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "search-field glass",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "search",
							value: query,
							placeholder: "Buscar canciones, artistas o vídeos",
							"aria-label": "Buscar",
							onChange: (event) => {
								setQuery(event.target.value);
								setView("search");
							},
							onFocus: () => setView("search")
						}),
						query ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "clear-btn",
							"aria-label": "Borrar búsqueda",
							onClick: () => {
								setQuery("");
								setView("home");
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
						}) : null
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomizeButton, {})
		]
	});
}
var TABS = [
	{
		id: "home",
		label: "Inicio",
		icon: House
	},
	{
		id: "search",
		label: "Buscar",
		icon: Search
	},
	{
		id: "library",
		label: "Biblioteca",
		icon: Library
	}
];
function Shell() {
	const view = usePlayer((state) => state.view);
	const setView = usePlayer((state) => state.setView);
	(0, import_react.useEffect)(() => {
		const apply = () => {
			const { volume, muted } = usePrefs.getState();
			applyVolume(muted ? 0 : volume);
		};
		usePrefs.persist.rehydrate();
		const kick = () => {
			preloadApi().catch(() => void 0);
		};
		window.addEventListener("pointerdown", kick, { once: true });
		const unsub = usePrefs.persist.onFinishHydration(apply);
		const onKey = (event) => {
			const target = event.target;
			if (target instanceof HTMLElement && target.closest("input, textarea, select, button, a")) return;
			if (event.code === "Space") {
				event.preventDefault();
				togglePlay();
			} else if (event.code === "ArrowRight" && event.shiftKey) next();
			else if (event.code === "ArrowLeft" && event.shiftKey) prev();
		};
		window.addEventListener("keydown", onKey);
		return () => {
			window.removeEventListener("pointerdown", kick);
			window.removeEventListener("keydown", onKey);
			unsub();
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			className: "skip",
			href: "#contenido",
			children: "Saltar al contenido"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Backdrop, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "app-shell",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					className: "main-panel",
					id: "contenido",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "main-scroll",
						children: [
							view === "home" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeView, {}) : null,
							view === "search" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchView, {}) : null,
							view === "library" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LibraryView, {}) : null
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerBar, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "tab-bar glass",
					"aria-label": "Navegación",
					children: TABS.map((tab) => {
						const Icon = tab.icon;
						const active = view === tab.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: active ? "is-active" : void 0,
							"aria-current": active ? "page" : void 0,
							onClick: () => setView(tab.id),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {}), tab.label]
						}, tab.id);
					})
				})
			]
		})
	] });
}
var SplitComponent = Shell;
//#endregion
export { SplitComponent as component };
