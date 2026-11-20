create table if not exists chat_messages (
  id serial primary key,
  token text not null,
  handle text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_id_idx on chat_messages (id);
