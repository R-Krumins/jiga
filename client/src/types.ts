export type Task = {
  uuid: string;
  text: string;
  listUuid: string;
};

export type List = {
  uuid: string;
  projectUuid: string;
  title: string;
};
