create table statuses (
    id text primary key not null,
    title text not null
);

create table tasks (
    id integer primary key,
    text text not null,
    status_id text not null,
    foreign key (status_id) references statuses(id)
);
