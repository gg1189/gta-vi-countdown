import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { listChat, postChat, type ChatLine } from "@/lib/chat";

function roomToken() {
  const key = "gta-chat-token";
  const saved = localStorage.getItem(key);
  if (saved && /^[a-zA-Z0-9-]{8,40}$/.test(saved)) return saved;
  const next = crypto.randomUUID();
  localStorage.setItem(key, next);
  return next;
}

export function LiveChat() {
  const [open, setOpen] = useState(false);
  const [handle, setHandle] = useState("");
  const [draft, setDraft] = useState("");
  const [rows, setRows] = useState<ChatLine[]>([]);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const after = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);

  useEffect(() => {
    const saved = localStorage.getItem("gta-chat-name");
    if (saved) setHandle(saved);
  }, []);

  useEffect(() => {
    if (!open) return;
    let dead = false;
    const pull = async () => {
      try {
        const next = await listChat({ data: { after: after.current } });
        if (dead || next.length === 0) return;
        after.current = next[next.length - 1].id;
        setRows((prev) => {
          const seen = new Set(prev.map((row) => row.id));
          const merged = [...prev, ...next.filter((row) => !seen.has(row.id))];
          return merged.slice(-80);
        });
        setNote("");
      } catch {
        if (!dead) setNote("連不上");
      }
    };
    void pull();
    const id = window.setInterval(() => void pull(), 2000);
    return () => {
      dead = true;
      window.clearInterval(id);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !stick.current) return;
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [rows, open]);

  const send = async () => {
    const name = handle.trim().slice(0, 16) || "路人";
    const body = draft.trim();
    if (!body || sending) return;
    setHandle(name);
    localStorage.setItem("gta-chat-name", name);
    setSending(true);
    setDraft("");
    const result = await postChat({ data: { token: roomToken(), handle: name, body } }).catch(() => null);
    setSending(false);
    if (!result || !result.ok) {
      setDraft(body);
      setNote(result && !result.ok ? result.error : "送唔出");
      return;
    }
    setNote("");
    after.current = Math.max(after.current, result.line.id);
    setRows((prev) => (prev.some((row) => row.id === result.line.id) ? prev : [...prev, result.line].slice(-80)));
  };

  if (!open) {
    return (
      <button
        type="button"
        className="glass absolute bottom-36 left-4 z-30 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-sand sm:bottom-32"
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        傾計
      </button>
    );
  }

  return (
    <section className="glass absolute bottom-36 left-4 z-30 flex w-[min(22rem,calc(100%-2rem))] flex-col overflow-hidden rounded-2xl sm:bottom-32">
      <header className="relative z-10 flex items-center gap-2 px-3 py-2">
        <MessageCircle className="size-4 text-sunset" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-sand">傾計</h2>
        <span className="text-xs text-muted">即時</span>
        <button type="button" className="ml-auto inline-flex size-9 items-center justify-center rounded-full text-sand" onClick={() => setOpen(false)} aria-label="收起傾計">
          <X className="size-4" aria-hidden="true" />
        </button>
      </header>
      <div
        ref={listRef}
        className="relative z-10 h-64 space-y-2 overflow-y-auto px-3"
        onScroll={(event) => {
          const node = event.currentTarget;
          stick.current = node.scrollHeight - node.scrollTop - node.clientHeight < 48;
        }}
      >
        {rows.length === 0 ? <p className="py-6 text-center text-sm text-muted">未有人講嘢</p> : null}
        {rows.map((row) => (
          <p key={row.id} className="text-sm leading-snug text-sand">
            <span className="mr-2 text-xs text-muted">{row.at}</span>
            <span className="font-semibold text-sunset">{row.handle}</span>
            <span className="text-muted"> · </span>
            {row.body}
          </p>
        ))}
      </div>
      <form
        className="relative z-10 flex items-center gap-2 px-3 pt-2 pb-3"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <input
          value={handle}
          maxLength={16}
          placeholder="名"
          aria-label="名"
          className="w-16 rounded-full border border-line bg-ink/40 px-3 py-2 text-sm text-sand outline-none placeholder:text-muted"
          onChange={(event) => setHandle(event.target.value)}
        />
        <input
          value={draft}
          maxLength={180}
          placeholder="講句"
          aria-label="訊息"
          className="min-w-0 flex-1 rounded-full border border-line bg-ink/40 px-3 py-2 text-sm text-sand outline-none placeholder:text-muted"
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-sunset text-ink disabled:opacity-40" disabled={sending || !draft.trim()} aria-label="送出">
          <Send className="size-4" aria-hidden="true" />
        </button>
      </form>
      {note ? <p className="relative z-10 px-3 pb-3 text-xs text-sunset">{note}</p> : null}
    </section>
  );
}
