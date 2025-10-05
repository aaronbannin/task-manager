create table boards (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_at timestamp with time zone default now()
);

create table tasks (
  id uuid primary key default uuid_generate_v4(),
  board_id uuid references boards(id),
  title text not null,
  description text,
  status text not null,
  created_at timestamp with time zone default now()
);
