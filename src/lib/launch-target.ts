export type ZonePreset = {
  id: string;
  label: string;
  timeZone: string;
};

export const PRESETS: ZonePreset[] = [
  { id: "hkt", label: "香港今晚", timeZone: "Asia/Hong_Kong" },
  { id: "tokyo", label: "東京午夜", timeZone: "Asia/Tokyo" },
  { id: "london", label: "倫敦午夜", timeZone: "Europe/London" },
  { id: "ny", label: "紐約午夜", timeZone: "America/New_York" },
  { id: "la", label: "洛杉磯午夜", timeZone: "America/Los_Angeles" },
];

const LAUNCH_YEAR = 2026;
const LAUNCH_MONTH = 11;
const LAUNCH_DAY = 19;

export function midnightInZone(timeZone: string): number {
  const utcGuess = Date.UTC(LAUNCH_YEAR, LAUNCH_MONTH - 1, LAUNCH_DAY, 0, 0, 0);
  const once = utcGuess - zoneOffset(timeZone, utcGuess);
  return utcGuess - zoneOffset(timeZone, once);
}

function zoneOffset(timeZone: string, utcMs: number): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = fmt.formatToParts(new Date(utcMs));
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");
  let year = pick("year");
  let month = pick("month");
  let day = pick("day");
  let hour = pick("hour");
  const minute = pick("minute");
  const second = pick("second");
  if (hour === 24) {
    hour = 0;
    const rolled = new Date(Date.UTC(year, month - 1, day));
    rolled.setUTCDate(rolled.getUTCDate() + 1);
    year = rolled.getUTCFullYear();
    month = rolled.getUTCMonth() + 1;
    day = rolled.getUTCDate();
  }
  return Date.UTC(year, month - 1, day, hour, minute, second) - utcMs;
}

export function splitRemaining(ms: number) {
  const safe = Math.max(0, ms);
  const total = Math.floor(safe / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    fraction: safe === 0 ? 1 : (1000 - (safe % 1000)) / 1000,
    done: ms <= 0,
  };
}

export function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function formatTarget(ms: number, timeZone: string) {
  return new Intl.DateTimeFormat("zh-Hant-HK", {
    timeZone,
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(ms));
}
