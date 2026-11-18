import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ListMusic, Pause, Play, Shuffle, SkipBack } from "lucide-react";
import { midnightInZone, pad, splitRemaining } from "@/lib/launch-target";

export const Route = createFileRoute("/")({ component: Home });

const TARGET = midnightInZone("Asia/Hong_Kong");
const TRAILER = "/media/bg.mp4";

const ALBUM = [
  { id: "5dPwBWvmcbQ", title: "Flower in a Hurricane", artist: "Justice" },
  { id: "joMjcNtxuTU", title: "That's It", artist: "Yung Lean" },
  { id: "3Ev1PQEm7ns", title: "RHYNO", artist: "Travis Scott" },
  { id: "G59iOfClrVo", title: "Sexy Magic", artist: "CA7RIEL & Paco Amoroso" },
  { id: "9leAwpph-xs", title: "Last Thing You Need", artist: "Morgan Wallen" },
  { id: "wROPn_SFE5s", title: "Suzuki", artist: "Fuerza Regida" },
  { id: "DShU-ly9BdM", title: "Macacoa 2000", artist: "Rauw Alejandro" },
  { id: "0BxQ6hi3lXY", title: "Don't Chart", artist: "Cardi B" },
  { id: "ULhiufAtduE", title: "Bright Lights, Big City", artist: "Keith Richards" },
];

function pickOther(current: number) {
  if (ALBUM.length < 2) return 0;
  let next = current;
  while (next === current) next = Math.floor(Math.random() * ALBUM.length);
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
  const [now, setNow] = useState<number | null>(null);
  const [still, setStill] = useState(0);
  const [held, setHeld] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [armed, setArmed] = useState(false);
  const [ready, setReady] = useState(false);
  const [videoBroken, setVideoBroken] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heldRef = useRef(false);
  heldRef.current = held;

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
  const trailerOn = showTrailer && ready && !videoBroken;
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

  const armVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video || videoBroken) return;
    video.muted = true;
    void video.play().catch(() => {});
  }, [videoBroken]);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setArmed(true), 1500);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (trailerOn) return;
    const id = window.setTimeout(() => {
      setStill((current) => (current + 1) % SHOTS.length);
    }, 5000);
    return () => window.clearTimeout(id);
  }, [trailerOn, still]);

  useEffect(() => {
    if (!armed) return;
    armVideo();
    const unlock = () => armVideo();
    window.addEventListener("pointerdown", unlock, true);
    return () => window.removeEventListener("pointerdown", unlock, true);
  }, [armed, armVideo]);

  const pickStill = (index: number) => {
    setHeld(true);
    setStill(index);
    setShowTrailer(false);
  };

  const pickTrailer = () => {
    setHeld(true);
    setShowTrailer(true);
    armVideo();
  };

  return (
    <main className="bg-ink text-sand">
      <div className="pointer-events-none fixed inset-0 z-0">
        {frames.map((item, index) => (
          <StillFrame
            key={item.src}
            src={item.src}
            alt={item.alt}
            enter={index > 0}
            hide={trailerOn}
            drift={item.drift}
            priority={index === frames.length - 1}
            onLoad={index === frames.length - 1 ? () => setArmed(true) : undefined}
          />
        ))}
        {armed && !videoBroken && (
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${trailerOn ? "opacity-100" : "opacity-0"}`}
            src={TRAILER}
            poster="/shots/key.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onCanPlay={() => {
              setReady(true);
              if (!heldRef.current) setShowTrailer(true);
            }}
            onError={() => setVideoBroken(true)}
          />
        )}
      </div>

      <div className="neon-wash pointer-events-none fixed inset-0 z-[1]" style={{ opacity: heat }} />

      <section className="relative z-10 min-h-dvh overflow-hidden">
        <div className="scrim pointer-events-none absolute inset-0" />

        <header className="absolute inset-x-0 top-0 z-30 flex items-center gap-2 px-3 py-2 sm:px-6">
          <p className="font-display text-4xl leading-none text-sand">VI</p>
          <div className="min-w-0 flex-1">
            <AlbumRadio />
          </div>
        </header>

        <div className="relative z-10 mx-auto flex min-h-dvh max-w-4xl flex-col items-center justify-center px-4 pt-20 pb-28 text-center">
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

        <div className="absolute inset-x-0 bottom-0 z-20 flex gap-2 overflow-x-auto px-4 pb-4">
          <button
            type="button"
            aria-label="預告片"
            aria-pressed={trailerOn}
            onClick={pickTrailer}
            className={`shrink-0 overflow-hidden rounded-card border-2 ${trailerOn ? "border-sunset" : "border-line"}`}
          >
            <img src="/shots/trailer.jpg" alt="" className="h-16 w-28 object-cover sm:h-20 sm:w-36" />
          </button>
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

      <Fireworks level={fireworkLevel} />
    </main>
  );
}

type YtPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  loadVideoById: (id: string) => void;
  getPlayerState: () => number;
};

function AlbumRadio() {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YtPlayer | null>(null);
  const indexRef = useRef(0);
  const historyRef = useRef<number[]>([]);
  const startedRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const track = ALBUM[index] ?? ALBUM[0];

  useEffect(() => {
    const unlock = () => {
      const player = playerRef.current;
      if (!player || startedRef.current) return;
      startedRef.current = true;
      player.unMute();
      if (player.getPlayerState() !== 1) player.playVideo();
    };
    window.addEventListener("pointerdown", unlock, true);
    return () => window.removeEventListener("pointerdown", unlock, true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);

  useEffect(() => {
    const first = Math.floor(Math.random() * ALBUM.length);
    indexRef.current = first;
    setIndex(first);
    let dead = false;
    const win = window as Window & {
      YT?: { Player: new (el: HTMLElement, options: object) => YtPlayer };
      onYouTubeIframeAPIReady?: () => void;
    };

    const mount = () => {
      if (dead || !hostRef.current || !win.YT?.Player || playerRef.current) return;
      playerRef.current = new win.YT.Player(hostRef.current, {
        width: "100%",
        height: "48",
        videoId: ALBUM[indexRef.current].id,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: (event: { target: YtPlayer }) => {
            setReady(true);
            event.target.mute();
            event.target.playVideo();
          },
          onStateChange: (event: { data: number }) => {
            if (event.data === 0) {
              const next = pickOther(indexRef.current);
              historyRef.current.push(indexRef.current);
              indexRef.current = next;
              setIndex(next);
              playerRef.current?.loadVideoById(ALBUM[next].id);
              return;
            }
            setPlaying(event.data === 1 || event.data === 3);
          },
        },
      });
    };

    if (win.YT?.Player) {
      mount();
      return () => {
        dead = true;
      };
    }

    const previous = win.onYouTubeIframeAPIReady;
    win.onYouTubeIframeAPIReady = () => {
      previous?.();
      mount();
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
    return () => {
      dead = true;
    };
  }, []);

  const toggle = () => {
    const player = playerRef.current;
    if (!player) return;
    if (player.getPlayerState() === 1) {
      player.pauseVideo();
      setPlaying(false);
      return;
    }
    player.unMute();
    player.playVideo();
    setPlaying(true);
  };

  const playAt = (next: number) => {
    if (next !== indexRef.current) historyRef.current.push(indexRef.current);
    indexRef.current = next;
    setIndex(next);
    setOpen(false);
    const player = playerRef.current;
    if (!player) return;
    startedRef.current = true;
    player.unMute();
    player.loadVideoById(ALBUM[next].id);
    player.playVideo();
    setPlaying(true);
  };

  const step = (delta: number) => {
    const next =
      delta < 0 && historyRef.current.length > 0
        ? historyRef.current.pop() ?? pickOther(indexRef.current)
        : pickOther(indexRef.current);
    playAt(next);
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <div className="yt-hide glass relative overflow-hidden rounded-card">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div ref={hostRef} />
        </div>
        <div className="relative z-10 flex items-center gap-1 px-1.5 py-1">
          <button
            type="button"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-sunset text-ink disabled:opacity-40"
            onClick={toggle}
            disabled={!ready}
            aria-label={playing ? "暫停" : "播放"}
          >
            {playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
          </button>
          <p className="min-w-0 flex-1 truncate text-left text-sm text-sand">
            <span className="font-semibold">{track.title}</span>
            <span className="text-muted"> · {track.artist}</span>
          </p>
          <span className={playing ? "eq shrink-0" : "eq shrink-0 opacity-30"} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <button type="button" className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sand hover:text-sunset" onClick={() => step(-1)} aria-label="上一首">
            <SkipBack className="size-4" aria-hidden="true" />
          </button>
          <button type="button" className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sand hover:text-sunset" onClick={() => step(1)} aria-label="隨機下一首">
            <Shuffle className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full ${open ? "bg-sunset text-ink" : "text-sand hover:text-sunset"}`}
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="album-list"
            aria-label="選擇歌曲"
          >
            <ListMusic className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {open ? (
        <ul id="album-list" className="glass absolute inset-x-0 top-full z-40 mt-2 max-h-72 overflow-y-auto rounded-card p-1">
          {ALBUM.map((song, songIndex) => {
            const current = songIndex === index;
            return (
              <li key={song.id}>
                <button
                  type="button"
                  className={`relative z-10 flex min-h-11 w-full items-center gap-3 rounded-card px-3 text-left ${current ? "bg-sunset/15" : "hover:bg-white/5"}`}
                  aria-current={current ? "true" : undefined}
                  onClick={() => playAt(songIndex)}
                >
                  <span className="w-5 shrink-0 font-display text-lg text-sunset">{songIndex + 1}</span>
                  <span className="min-w-0">
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

