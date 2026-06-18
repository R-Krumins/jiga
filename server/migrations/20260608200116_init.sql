create table projects (
    uuid text primary key not null,
    title text not null
);

create table lists (
    uuid text primary key not null,
    project_uuid text not null,
    title text not null,
    foreign key (project_uuid) references projects(uuid)
);

create table tasks (
    uuid text primary key not null,
    list_uuid text not null,
    text text not null,
    foreign key (list_uuid) references lists(uuid)
);
