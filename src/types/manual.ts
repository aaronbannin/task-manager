export interface Board {
  id: string;
  name: string;
  description: string;
}

export interface Task {
  id: string;
  boardId: string;
  title: string;
  description: string;
  status: string;
}
