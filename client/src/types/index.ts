export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface BoardMember {
  id: string;
  board_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
  user?: User; // For joined data
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  members?: BoardMember[];
}

export interface List {
  id: string;
  title: string;
  board_id: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  list_id: string;
  position: number;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  completed: boolean;
  assigned_to?: string;
  assigned_to_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBoardData {
  title: string;
  description?: string;
  user_id: string;
}

export interface CreateListData {
  title: string;
  board_id: string;
  position?: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  list_id: string;
  position?: number;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  assigned_to?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  list_id?: string;
  position?: number;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  completed?: boolean;
  assigned_to?: string;
}

export interface AddBoardMemberData {
  board_id: string;
  user_id: string;
  role?: 'owner' | 'admin' | 'member';
}

export interface DragDropResult {
  draggableId: string;
  type: 'task' | 'list';
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  };
} 