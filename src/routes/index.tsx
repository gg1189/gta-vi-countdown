import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type RefObject } from "react";
import { ChevronDown, ListMusic, Maximize2, Pause, Play, Shuffle, SkipBack, SkipForward, Volume1, Volume2, VolumeX, X } from "lucide-react";
import { midnightInZone, pad, splitRemaining } from "@/lib/launch-target";

export const Route = createFileRoute("/")({
  loader: () => ({ start: Math.floor(Math.random() * TRACKS.length) }),
  component: Home,
});

const TARGET = midnightInZone("Asia/Hong_Kong");
const TRAILER = "/media/bg.mp4";
const TRAILERS = [
  { id: "launch", label: "Trailer", thumb: "/shots/trailer.jpg" },
  { id: "t1", label: "Trailer 1", thumb: "/shots/thumb/t1.jpg", yt: "QdBZY2fkU-0" },
  { id: "t2", label: "Trailer 2", thumb: "/shots/thumb/t2.jpg", yt: "VQRLujxTm3c" },
];

const PLAYLIST = "https://soundcloud.com/atlanticrecords/sets/gtavithealbum";
const TRACKS: Track[] = [
  { id: "thats-it", title: "That's It", artist: "Yung Lean", art: "/covers/album.jpg" },
  { id: "rhyno", title: "RHYNO", artist: "Travis Scott", art: "/covers/album.jpg" },
  { id: "sexy-magic", title: "Sexy Magic", artist: "CA7RIEL & Paco Amoroso", art: "/covers/album.jpg" },
  { id: "flower", title: "Flower In A Hurricane", artist: "Justice", art: "/covers/flower.jpg" },
  { id: "last-thing", title: "Last Thing You Need", artist: "Morgan Wallen", art: "/covers/album.jpg" },
  { id: "suzuki", title: "Suzuki", artist: "Fuerza Regida", art: "/covers/album.jpg" },
  { id: "macacoa", title: "Macacoa 2000", artist: "Rauw Alejandro", art: "/covers/album.jpg" },
  { id: "dont-chart", title: "Don't Chart", artist: "Cardi B", art: "/covers/album.jpg" },
  { id: "blood", title: "Blood in Your Eyes", artist: "Tove Lo", art: "/covers/album.jpg" },
  { id: "bright-lights", title: "Bright Lights, Big City", artist: "Keith Richards", art: "/covers/album.jpg" },
];

function pickOther(current: number, count: number) {
  if (count < 2) return 0;
  let next = current;
  while (next === current) next = Math.floor(Math.random() * count);
  return next;
}

const SHOTS = [
  { src: "/shots/key.jpg", thumb: "/shots/thumb/key.jpg", alt: "Jason 與 Lucia，官方主視覺" },
  { src: "/shots/vice13.jpg", thumb: "/shots/thumb/vice13.jpg", alt: "Vice City 夜景" },
  { src: "/shots/vice14.jpg", thumb: "/shots/thumb/vice14.jpg", alt: "Vice City 公路" },
  { src: "/shots/vice16.jpg", thumb: "/shots/thumb/vice16.jpg", alt: "Vice City 沙灘" },
  { src: "/shots/vice18.jpg", thumb: "/shots/thumb/vice18.jpg", alt: "Vice City 街頭" },
  { src: "/shots/vice21.jpg", thumb: "/shots/thumb/vice21.jpg", alt: "Vice City 夜街" },
  { src: "/shots/vice24.jpg", thumb: "/shots/thumb/vice24.jpg", alt: "Vice City 碼頭" },
  { src: "/shots/vice25.jpg", thumb: "/shots/thumb/vice25.jpg", alt: "Vice City 海岸公路" },
  { src: "/shots/duo.jpg", thumb: "/shots/thumb/duo.jpg", alt: "Jason 與 Lucia 預告畫面" },
  { src: "/shots/pair.jpg", thumb: "/shots/thumb/pair.jpg", alt: "Jason 與 Lucia" },
  { src: "/shots/pair2.jpg", thumb: "/shots/thumb/pair2.jpg", alt: "Jason 與 Lucia 車內" },
  { src: "/shots/lucia.jpg", thumb: "/shots/thumb/lucia.jpg", alt: "Lucia Caminos" },
  { src: "/shots/lucia2.jpg", thumb: "/shots/thumb/lucia2.jpg", alt: "Lucia 車內" },
  { src: "/shots/jason.jpg", thumb: "/shots/thumb/jason.jpg", alt: "Jason Duval" },
  { src: "/shots/jason2.jpg", thumb: "/shots/thumb/jason2.jpg", alt: "Jason 車房" },
  { src: "/shots/postcard.jpg", thumb: "/shots/thumb/postcard.jpg", alt: "Vice City 海岸" },
  { src: "/shots/grass.jpg", thumb: "/shots/thumb/grass.jpg", alt: "Grassrivers" },
  { src: "/shots/grass2.jpg", thumb: "/shots/thumb/grass2.jpg", alt: "Grassrivers 沼澤" },
  { src: "/shots/keys.jpg", thumb: "/shots/thumb/keys.jpg", alt: "Leonida Keys" },
  { src: "/shots/port.jpg", thumb: "/shots/thumb/port.jpg", alt: "Port Gellhorn" },
];

function Home() {
  const { start } = Route.useLoaderData();
  const hostRef = useRef<HTMLIFrameElement>(null);
  const [now, setNow] = useState<number | null>(null);
  const [still, setStill] = useState(0);
  const [clip, setClip] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const ytRef = useRef<HTMLIFrameElement>(null);
  const ytEmbed = useRef<string | null>(null);

  const remaining = now === null ? null : splitRemaining(TARGET - now);
  const secondsLeft =
    remaining == null
      ? null
      : remaining.done
        ? 0
        : remaining.days * 86400 + remaining.hours * 3600 + remaining.minutes * 60 + remaining.seconds;
  const copy =
    secondsLeft == null
      ? { title: "今晚開波", sub: "" }
      : secondsLeft <= 0
        ? { title: "開波喇", sub: "歡迎來到里昂尼達" }
        : secondsLeft <= 10
          ? { title: "就嚟開波", sub: "最後十秒" }
          : secondsLeft <= 60
            ? { title: "最後一分鐘", sub: "準備開波" }
            : secondsLeft <= 600
              ? { title: "就快開波", sub: "倒數十分鐘" }
              : secondsLeft <= 3600
                ? { title: "今晚開波", sub: "仲有一小時" }
                : { title: "今晚開波", sub: "" };
  const fireworkLevel = secondsLeft == null || secondsLeft > 10 ? 0 : secondsLeft === 0 ? 3 : 2;
  const heat = secondsLeft == null || secondsLeft >= 3600 ? 0 : secondsLeft <= 0 ? 1 : (3600 - secondsLeft) / 3600;
  const live = secondsLeft === 0;
  const hours = remaining ? remaining.days * 24 + remaining.hours : null;
  const trailerOn = clip !== null;
  const active = TRAILERS.find((item) => item.id === clip) ?? null;
  const [frames, setFrames] = useState(() => [{ ...SHOTS[0], drift: false }]);

  useEffect(() => {
    const next = SHOTS[still] ?? SHOTS[0];
    setFrames((current) => {
      const top = current[current.length - 1];
      if (top?.src === next.src) return current;
      return [...current.slice(-1), { ...next, drift: !top.drift }];
    });
  }, [still]);

  useEffect(() => {
    const upcoming = SHOTS[(still + 1) % SHOTS.length];
    const img = new Image();
    img.src = upcoming.src;
  }, [still]);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!modal) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  useEffect(() => {
    if (trailerOn) return;
    const id = window.setTimeout(() => {
      setStill((current) => (current + 1) % SHOTS.length);
    }, 5000);
    return () => window.clearTimeout(id);
  }, [trailerOn, still]);

  const pickStill = (index: number) => {
    ytEmbed.current = null;
    setStill(index);
    setClip(null);
    setModal(false);
  };

  const commandTrailer = (func: string, args: unknown[] = []) => {
    ytRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "https://www.youtube-nocookie.com",
    );
  };

  const pickClip = (id: string, intoModal = false) => {
    setClip(id);
    setModal(intoModal);
    const next = TRAILERS.find((item) => item.id === id);
    if (intoModal && next?.yt) commandTrailer("loadVideoById", [next.yt]);
  };

  const openModal = () => {
    commandTrailer("playVideo");
    commandTrailer("unMute");
    setModal(true);
  };

  const closeModal = () => {
    commandTrailer("mute");
    setModal(false);
  };

  if (active?.yt && !ytEmbed.current) ytEmbed.current = active.yt;

  return (
    <main className="bg-ink text-sand">
      <iframe
        ref={hostRef}
        title="GTA VI The Album"
        className="sc-hide"
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(PLAYLIST)}&auto_play=true&start_track=${start}&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`}
        allow="autoplay; encrypted-media"
      />
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden bg-ink">
        {frames.map((item, index) => (
          <StillFrame
            key={item.src}
            src={item.src}
            alt={item.alt}
            enter={index > 0}
            hide={Boolean(active) && !modal}
            drift={item.drift}
            priority={index === frames.length - 1}
          />
        ))}
        {active && !modal && !active.yt ? (
          <video className="absolute inset-0 h-full w-full object-cover" src={TRAILER} poster={active.thumb} autoPlay muted loop playsInline />
        ) : null}
      </div>

      {active?.yt && ytEmbed.current ? (
        <div className={modal ? "pointer-events-auto fixed top-1/2 left-1/2 z-[55] aspect-video w-[min(56rem,calc(100%-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-card" : "pointer-events-none fixed inset-0 z-0 overflow-hidden"}>
          <iframe
            ref={ytRef}
            title={active.label}
            className={modal ? "h-full w-full border-0" : "pointer-events-none absolute top-1/2 left-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"}
            src={`https://www.youtube-nocookie.com/embed/${ytEmbed.current}?autoplay=1&mute=1&enablejsapi=1&controls=1&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3`}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            onLoad={() => {
              if (!modal) return;
              commandTrailer("playVideo");
              commandTrailer("unMute");
            }}
          />
        </div>
      ) : null}

      <div className="neon-wash pointer-events-none fixed inset-0 z-[1]" style={{ opacity: heat }} />

      <section className="relative z-10 min-h-dvh overflow-hidden">
        <div className="scrim pointer-events-none absolute inset-0" />

        <header className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 px-3 py-3 sm:px-6">
          <img src="/logo-vi.png" alt="VI" className="h-8 w-auto" />
          <div className="ml-auto w-[min(24rem,calc(100%-2.75rem))]">
            <AlbumRadio start={start} hostRef={hostRef} />
          </div>
        </header>

        <div className="relative z-10 mx-auto flex min-h-dvh max-w-4xl flex-col items-center justify-center px-4 pt-28 pb-28 text-center">
          <p className="text-xs font-semibold tracking-widest text-sunset">GRAND THEFT AUTO VI</p>
          <h1 key={copy.title} className="cheer mt-2 font-sans text-4xl font-bold tracking-tight text-sand sm:text-6xl">
            {copy.title}
          </h1>
          {copy.sub ? (
            <p key={copy.sub} className="cheer mt-3 text-sm font-semibold tracking-widest text-sunset">
              {copy.sub}
            </p>
          ) : null}

          {live ? (
            <p className="digit-pop time-num mt-8 font-display text-7xl leading-none sm:text-8xl">VI</p>
          ) : (
            <div className="mt-8">
              <div className="clock" aria-live="off">
                <Unit value={hours === null ? "--" : pad(hours)} label="時" />
                <Colon on={now !== null} />
                <Unit value={remaining ? pad(remaining.minutes) : "--"} label="分" />
                <Colon on={now !== null} />
                <Unit value={remaining ? pad(remaining.seconds) : "--"} label="秒" />
              </div>
            </div>
          )}

          <p className="mt-5 text-xs font-semibold tracking-widest text-muted">香港時間 · 11月19日 00:00</p>
        </div>

        {active && !modal ? (
          <button
            type="button"
            className="glass absolute bottom-28 right-4 z-20 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-sand"
            onClick={openModal}
          >
            <Maximize2 className="size-4" aria-hidden="true" />
            放大
          </button>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 z-20 flex gap-2 overflow-x-auto px-4 pb-4">
          {TRAILERS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-pressed={clip === item.id}
              onClick={() => pickClip(item.id)}
              className={`relative shrink-0 overflow-hidden rounded-card border-2 ${clip === item.id ? "border-sunset" : "border-line"}`}
            >
              <img src={item.thumb} alt="" className="h-16 w-28 object-cover sm:h-20 sm:w-36" />
              <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-0.5 text-[10px] font-semibold tracking-widest text-sand">{item.label}</span>
            </button>
          ))}
          {SHOTS.map((item, index) => (
            <button
              key={item.src}
              type="button"
              aria-label={item.alt}
              aria-pressed={!trailerOn && index === still}
              onClick={() => pickStill(index)}
              className={`shrink-0 overflow-hidden rounded-card border-2 ${!trailerOn && index === still ? "border-sunset" : "border-line"}`}
            >
              <img src={item.thumb} alt="" className="h-16 w-28 object-cover sm:h-20 sm:w-36" />
            </button>
          ))}
        </div>
      </section>

      {active && modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3" role="dialog" aria-modal="true" aria-label={active.label} onClick={closeModal}>
          <div className="glass w-full max-w-4xl overflow-hidden rounded-card" onClick={(event) => event.stopPropagation()}>
            <div className="relative aspect-video bg-black">
              {active.yt ? null : (
                <video key={active.id} className="absolute inset-0 h-full w-full" src={TRAILER} poster={active.thumb} autoPlay controls playsInline />
              )}
              <div className={`absolute inset-x-0 top-0 z-[70] flex items-center gap-1.5 bg-gradient-to-b from-black/70 to-transparent p-2 ${active.yt ? "hidden" : ""}`}>
                {TRAILERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={item.id === active.id}
                    onClick={() => pickClip(item.id, true)}
                    className={`min-h-9 rounded-full px-3 text-xs font-semibold tracking-widest ${item.id === active.id ? "bg-sunset text-ink" : "bg-white/15 text-sand"}`}
                  >
                    {item.label}
                  </button>
                ))}
                <button type="button" className="ml-auto inline-flex size-9 items-center justify-center rounded-full bg-white/15 text-sand" onClick={closeModal} aria-label="關閉">
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {active && modal && active.yt ? (
        <div className="pointer-events-none fixed top-1/2 left-1/2 z-[60] aspect-video w-[min(56rem,calc(100%-1.5rem))] -translate-x-1/2 -translate-y-1/2">
          <div className="pointer-events-auto absolute inset-x-0 top-0 flex items-center gap-1.5 bg-gradient-to-b from-black/70 to-transparent p-2">
            {TRAILERS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={item.id === active.id}
                onClick={() => pickClip(item.id, true)}
                className={`min-h-9 rounded-full px-3 text-xs font-semibold tracking-widest ${item.id === active.id ? "bg-sunset text-ink" : "bg-white/15 text-sand"}`}
              >
                {item.label}
              </button>
            ))}
            <button type="button" className="ml-auto inline-flex size-9 items-center justify-center rounded-full bg-white/15 text-sand" onClick={closeModal} aria-label="關閉">
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      <Fireworks level={fireworkLevel} />
    </main>
  );
}

type Track = { id: string; title: string; artist: string; art: string };

type ScWidget = {
  bind: (event: string, listener: (data?: { currentPosition?: number }) => void) => void;
  play: () => void;
  pause: () => void;
  skip: (index: number) => void;
  seekTo: (ms: number) => void;
  setVolume: (volume: number) => void;
  getDuration: (callback: (ms: number) => void) => void;
  getPosition: (callback: (ms: number) => void) => void;
  isPaused: (callback: (paused: boolean) => void) => void;
};

function AlbumRadio({ start, hostRef }: { start: number; hostRef: RefObject<HTMLIFrameElement | null> }) {
  const widgetRef = useRef<ScWidget | null>(null);
  const indexRef = useRef(start);
  const historyRef = useRef<number[]>([]);
  const startedRef = useRef(false);
  const playingRef = useRef(false);
  const pausedByUser = useRef(false);
  const [index, setIndex] = useState(start);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const durationRef = useRef(0);
  const volumeRef = useRef(100);
  const levelRef = useRef(100);
  const rootRef = useRef<HTMLDivElement>(null);
  const [volume, setVolume] = useState(100);
  const track = TRACKS[index] ?? TRACKS[0];

  useEffect(() => {
    const saved = Number(localStorage.getItem("gta-vol"));
    if (!Number.isFinite(saved)) return;
    const next = Math.min(100, Math.max(0, Math.round(saved)));
    volumeRef.current = next;
    levelRef.current = next || 100;
    setVolume(next);
    widgetRef.current?.setVolume(next);
  }, []);

  useEffect(() => {
    const unlock = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest("[data-playback]")) return;
      const widget = widgetRef.current;
      if (!widget || playingRef.current || pausedByUser.current) return;
      widget.setVolume(volumeRef.current);
      widget.play();
    };
    window.addEventListener("pointerdown", unlock, true);
    return () => window.removeEventListener("pointerdown", unlock, true);
  }, []);

  useEffect(() => {
    if (!open && !pinned) return;
    const close = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
      setPinned(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open, pinned]);

  useEffect(() => {
    let dead = false;
    const win = window as Window & { SC?: { Widget: (el: HTMLIFrameElement) => ScWidget } };

    const mount = () => {
      if (dead || !hostRef.current || !win.SC?.Widget || widgetRef.current) return;
      const widget = win.SC.Widget(hostRef.current);
      widgetRef.current = widget;
      widget.bind("ready", () => {
        if (dead) return;
        setReady(true);
        const kick = () => {
          if (dead || pausedByUser.current || playingRef.current) return;
          widget.setVolume(volumeRef.current);
          widget.isPaused((paused) => {
            if (dead || pausedByUser.current || playingRef.current || !paused) return;
            widget.play();
          });
        };
        kick();
        window.setTimeout(kick, 700);
        window.setTimeout(kick, 1800);
      });
      widget.bind("play", () => {
        widget.getDuration((ms) => {
          durationRef.current = ms;
          setDuration(ms);
        });
      });
      widget.bind("playProgress", (data) => {
        const apply = (pos: number) => {
          if (pos > 0) {
            playingRef.current = true;
            startedRef.current = true;
            setPlaying(true);
          }
          setProgress((prev) => (Math.abs(prev - pos) < 200 ? prev : pos));
        };
        if (typeof data?.currentPosition === "number") apply(data.currentPosition);
        else widget.getPosition(apply);
      });
      widget.bind("pause", () => {
        playingRef.current = false;
        setPlaying(false);
      });
      widget.bind("finish", () => {
        const next = pickOther(indexRef.current, TRACKS.length);
        if (next !== indexRef.current) historyRef.current.push(indexRef.current);
        indexRef.current = next;
        setIndex(next);
        setProgress(0);
        widget.skip(next);
        widget.play();
      });
    };

    if (win.SC?.Widget) mount();
    else {
      const script = document.createElement("script");
      script.src = "https://w.soundcloud.com/player/api.js";
      script.onload = () => mount();
      document.head.appendChild(script);
    }
    return () => {
      dead = true;
    };
  }, []);

  const toggle = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    const widget = widgetRef.current;
    if (!widget) return;
    if (playingRef.current) {
      pausedByUser.current = true;
      playingRef.current = false;
      widget.pause();
      setPlaying(false);
      return;
    }
    pausedByUser.current = false;
    widget.setVolume(volumeRef.current);
    widget.play();
  };

  const playAt = (next: number) => {
    if (next !== indexRef.current) historyRef.current.push(indexRef.current);
    indexRef.current = next;
    setIndex(next);
    setProgress(0);
    setOpen(false);
    const widget = widgetRef.current;
    if (!widget) return;
    startedRef.current = true;
    widget.setVolume(volumeRef.current);
    widget.skip(next);
    widget.play();
    setPlaying(true);
  };

  const step = (delta: number) => {
    const count = TRACKS.length;
    const next = delta < 0
      ? historyRef.current.length > 0
        ? historyRef.current.pop() ?? (indexRef.current - 1 + count) % count
        : (indexRef.current - 1 + count) % count
      : (indexRef.current + 1) % count;
    playAt(next);
  };

  const shuffle = () => playAt(pickOther(indexRef.current, TRACKS.length));

  const pushVolume = (value: number) => {
    const next = Math.min(100, Math.max(0, Math.round(value)));
    volumeRef.current = next;
    if (next > 0) levelRef.current = next;
    setVolume(next);
    widgetRef.current?.setVolume(next);
    localStorage.setItem("gta-vol", String(next));
  };

  const seek = (event: MouseEvent<HTMLButtonElement>) => {
    const widget = widgetRef.current;
    const total = durationRef.current;
    if (!widget || total <= 0) return;
    const bar = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - bar.left) / bar.width));
    const ms = Math.floor(total * ratio);
    widget.seekTo(ms);
    setProgress(ms);
  };

  const ratio = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;
  const expanded = hover || pinned || open;

  return (
    <div
      ref={rootRef}
      className={`relative ml-auto min-w-0 transition-[width] duration-300 ${expanded ? "w-full" : "w-[min(15rem,100%)]"}`}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHover(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setHover(false);
      }}
    >
      <div className="glass relative overflow-hidden rounded-[1.4rem]">
        <div className="relative z-10 flex items-center gap-2 px-1.5 py-1.5">
          <button
            type="button"
            className="group relative size-10 shrink-0 overflow-hidden rounded-lg disabled:opacity-40"
            data-playback="toggle"
            onPointerDown={toggle}
            disabled={!ready}
            aria-label={playing ? "暫停" : "播放"}
          >
            <img src={track.art} alt="" className="size-full object-cover" />
            <span className={`absolute inset-0 flex items-center justify-center bg-ink/45 text-sand opacity-0 transition-opacity group-hover:opacity-100 ${expanded ? "" : "[@media(hover:none)]:opacity-100"}`}>
              {playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4 translate-x-px" aria-hidden="true" />}
            </span>
          </button>
          <div className="min-w-0 flex-1 text-left">
            <Marquee text={track.title} />
            {expanded ? <p className="truncate text-[11px] text-muted">{track.artist}</p> : null}
          </div>
          <span className={playing ? "eq shrink-0" : "eq shrink-0 opacity-30"} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <button
            type="button"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-sand hover:text-sunset"
            onPointerDown={(event) => {
              event.stopPropagation();
              if (expanded) {
                setPinned(false);
                setHover(false);
                setOpen(false);
                return;
              }
              setPinned(true);
            }}
            aria-expanded={expanded}
            aria-label={expanded ? "收起" : "展開"}
          >
            <ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full disabled:opacity-40 ${open ? "bg-sunset text-ink" : "text-sand hover:text-sunset"}`}
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="album-list"
            aria-label="選擇歌曲"
            disabled={!ready}
          >
            <ListMusic className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div className={`grid transition-[grid-template-rows] duration-300 ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2 px-3 pt-1">
              <span className="w-8 shrink-0 text-left text-[10px] tabular-nums text-muted">{fmt(progress)}</span>
              <button type="button" className="relative h-5 min-w-0 flex-1" onClick={seek} aria-label="播放進度">
                <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/30" />
                <span className="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full bg-sunset" style={{ width: `${ratio}%` }} />
                <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sand shadow" style={{ left: `${ratio}%` }} />
              </button>
              <span className="w-8 shrink-0 text-right text-[10px] tabular-nums text-muted">{fmt(duration)}</span>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center px-2 pt-0.5 pb-2">
              <button type="button" className="inline-flex size-10 items-center justify-center justify-self-start rounded-full text-sand hover:text-sunset disabled:opacity-40" onClick={shuffle} aria-label="隨機" disabled={!ready}>
                <Shuffle className="size-4" aria-hidden="true" />
              </button>
              <div className="flex items-center justify-center gap-1">
                <button type="button" className="inline-flex size-10 items-center justify-center rounded-full text-sand hover:text-sunset disabled:opacity-40" onClick={() => step(-1)} aria-label="上一首" disabled={!ready}>
                  <SkipBack className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="inline-flex size-12 items-center justify-center rounded-full bg-sunset text-ink shadow-[0_8px_20px_rgb(255_107_61_/_0.35)] disabled:opacity-40"
                  data-playback="toggle"
                  onPointerDown={toggle}
                  disabled={!ready}
                  aria-label={playing ? "暫停" : "播放"}
                >
                  {playing ? <Pause className="size-5" aria-hidden="true" /> : <Play className="size-5 translate-x-px" aria-hidden="true" />}
                </button>
                <button type="button" className="inline-flex size-10 items-center justify-center rounded-full text-sand hover:text-sunset disabled:opacity-40" onClick={() => step(1)} aria-label="下一首" disabled={!ready}>
                  <SkipForward className="size-4" aria-hidden="true" />
                </button>
              </div>
              <div className="hidden items-center justify-self-end gap-0.5 sm:flex">
                <button
                  type="button"
                  className="inline-flex size-8 items-center justify-center rounded-full text-sand hover:text-sunset"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => pushVolume(volume === 0 ? levelRef.current || 80 : 0)}
                  aria-label={volume === 0 ? "取消靜音" : "靜音"}
                >
                  {volume === 0 ? <VolumeX className="size-4" aria-hidden="true" /> : volume < 45 ? <Volume1 className="size-4" aria-hidden="true" /> : <Volume2 className="size-4" aria-hidden="true" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  aria-label="音量"
                  className="vol w-14"
                  style={{ "--p": `${volume}%` } as CSSProperties}
                  onPointerDown={(event) => event.stopPropagation()}
                  onChange={(event) => pushVolume(Number(event.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {open ? (
        <ul id="album-list" className="glass song-menu absolute inset-x-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-2xl p-1">
          {TRACKS.map((song, songIndex) => {
            const current = songIndex === index;
            return (
              <li key={song.id}>
                <button
                  type="button"
                  className={`relative z-10 flex min-h-11 w-full items-center gap-2.5 rounded-xl px-2 text-left ${current ? "bg-sunset/20" : "hover:bg-white/10"}`}
                  aria-current={current ? "true" : undefined}
                  onClick={() => playAt(songIndex)}
                >
                  <img src={song.art} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                  <span className="w-5 shrink-0 text-center font-display text-lg leading-none text-sunset">{songIndex + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-sand">{song.title}</span>
                    <span className="block truncate text-xs text-muted">{song.artist}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function fmt(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function Marquee({ text }: { text: string }) {
  const boxRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    const box = boxRef.current;
    const label = textRef.current;
    if (!box || !label) return;
    const extra = label.scrollWidth - box.clientWidth;
    setShift(extra > 4 ? extra + 16 : 0);
  }, [text]);

  return (
    <span ref={boxRef} className="block overflow-hidden whitespace-nowrap">
      <span
        ref={textRef}
        className="inline-block text-sm font-semibold text-sand"
        style={shift ? ({ "--shift": `${shift}px`, animation: "ticker 8s linear infinite" } as CSSProperties) : undefined}
      >
        {text}
      </span>
    </span>
  );
}

function StillFrame({
  src,
  alt,
  enter,
  hide,
  drift,
  priority,
  onLoad,
}: {
  src: string;
  alt: string;
  enter: boolean;
  hide: boolean;
  drift: boolean;
  priority: boolean;
  onLoad?: () => void;
}) {
  const [shown, setShown] = useState(!enter);

  useEffect(() => {
    if (!enter) return;
    const id = window.requestAnimationFrame(() => setShown(true));
    return () => window.cancelAnimationFrame(id);
  }, [enter]);

  return (
    <img
      src={src}
      alt={alt}
      fetchPriority={priority ? "high" : "low"}
      decoding="async"
      onLoad={onLoad}
      className={`still absolute inset-0 h-full w-full object-cover ${drift ? "ken-alt" : "ken"} ${shown && !hide ? "opacity-100" : "opacity-0"}`}
    />
  );
}

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0">
      <div className="plate glass px-1 py-2 sm:py-2.5">
        <span key={value} className="digit-pop time-num relative z-10 block font-display text-5xl leading-none sm:text-6xl">
          {value}
        </span>
      </div>
      <p className="mt-2 text-xs font-semibold tracking-widest text-muted">{label}</p>
    </div>
  );
}

function Colon({ on }: { on: boolean }) {
  return (
    <span className={on ? "colon colon-live" : "colon"} aria-hidden="true">
      <i />
      <i />
    </span>
  );
}

function Fireworks({ level }: { level: number }) {
  const [wave, setWave] = useState(0);

  useEffect(() => {
    if (level === 0) return;
    const gap = level >= 3 ? 1400 : level === 2 ? 900 : 2800;
    const id = window.setInterval(() => setWave((current) => current + 1), gap);
    return () => window.clearInterval(id);
  }, [level]);

  if (level === 0) return null;

  const bursts = level >= 3 ? 7 : level === 2 ? 4 : 2;
  const sparks = level >= 3 ? 18 : level === 2 ? 12 : 7;
  const tones = ["bg-sunset", "bg-neon", "bg-sand"];

  return (
    <div key={wave} className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden="true">
      {Array.from({ length: bursts }, (_, burst) => {
        const left = 10 + ((wave * 19 + burst * 27) % 78);
        const top = 6 + ((wave * 11 + burst * 17) % 34);
        const tone = tones[(wave + burst) % tones.length];
        return (
          <span key={burst} className="absolute" style={{ left: `${left}%`, top: `${top}%` }}>
            {Array.from({ length: sparks }, (_, index) => {
              const angle = (Math.PI * 2 * index) / sparks;
              const distance = 42 + (index % 5) * (level === 1 ? 12 : 24);
              return (
                <i
                  key={index}
                  className={`spark ${tone}`}
                  style={{
                    ["--dx" as string]: `${Math.round(Math.cos(angle) * distance)}px`,
                    ["--dy" as string]: `${Math.round(Math.sin(angle) * distance)}px`,
                    animationDelay: `${burst * 0.1}s`,
                  }}
                />
              );
            })}
          </span>
        );
      })}
    </div>
  );
}

