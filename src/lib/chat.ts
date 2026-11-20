import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";

export type ChatLine = { id: number; handle: string; body: string; at: string };

const HANDLE_MAX = 16;
const BODY_MAX = 180;

function clean(value: unknown, max: number) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function tokenOf(value: unknown) {
  const token = clean(value, 40);
  return /^[a-zA-Z0-9-]{8,40}$/.test(token) ? token : "";
}

export const listChat = createServerFn({ method: "GET" })
  .validator((input: { after?: number }) => ({ after: Math.max(0, Math.floor(Number(input?.after) || 0)) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<ChatLine>`
      select id, handle, body, to_char(created_at at time zone 'Asia/Hong_Kong', 'HH24:MI') as at
      from chat_messages
      where id > ${data.after}
      order by id desc
      limit 40
    `;
    return rows.reverse();
  });

export const postChat = createServerFn({ method: "POST" })
  .validator((input: { token?: string; handle?: string; body?: string }) => ({
    token: tokenOf(input?.token),
    handle: clean(input?.handle, HANDLE_MAX) || "路人",
    body: clean(input?.body, BODY_MAX),
  }))
  .handler(async ({ data }): Promise<{ ok: true; line: ChatLine } | { ok: false; error: string }> => {
    if (!data.token) return { ok: false, error: "送唔出" };
    if (!data.body) return { ok: false, error: "寫句嘢先" };
    const sql = await getSql();
    const recent = await sql<{ id: number }>`
      select id from chat_messages
      where token = ${data.token} and created_at > now() - interval '2 seconds'
      limit 1
    `;
    if (recent.length > 0) return { ok: false, error: "慢少少" };
    const burst = await sql<{ n: number }>`
      select count(*) as n from chat_messages
      where created_at > now() - interval '10 seconds'
    `;
    if ((burst[0]?.n ?? 0) > 20) return { ok: false, error: "太多人講緊" };
    const inserted = await sql<ChatLine>`
      insert into chat_messages (token, handle, body)
      values (${data.token}, ${data.handle}, ${data.body})
      returning id, handle, body, to_char(created_at at time zone 'Asia/Hong_Kong', 'HH24:MI') as at
    `;
    await sql`
      delete from chat_messages
      where id < coalesce((select id from chat_messages order by id desc offset 300 limit 1), 0)
    `;
    const line = inserted[0];
    if (!line) return { ok: false, error: "送唔出" };
    return { ok: true, line };
  });
