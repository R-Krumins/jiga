create table lists (
    uuid text primary key not null,
    title text not null
);

create table tasks (
    uuid text primary key not null,
    text text not null,
    list_uuid text not null,
    foreign key (list_uuid) references lists(uuid)
);
