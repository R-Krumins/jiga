export type Task = {
  id: string;
  text: string;
  statusId: string;
};

export type Status = {
  title: string;
  id: string;
};

export type Project = {
  statuses: Status[];
  tasks: Task[];
};
