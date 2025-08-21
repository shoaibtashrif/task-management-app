import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// In-memory data storage
let boards: any[] = [
  {
    id: '1',
    title: 'Sample Board',
    description: 'This is a sample board to get you started',
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    members: [
      {
        id: '1',
        board_id: '1',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        role: 'owner',
        created_at: new Date().toISOString(),
        user: { name: 'Demo User', email: 'demo@example.com' }
      }
    ]
  }
];

let lists: any[] = [
  {
    id: '1',
    title: 'To Do',
    board_id: '1',
    position: 0,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'In Progress',
    board_id: '1',
    position: 1,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Done',
    board_id: '1',
    position: 2,
    created_at: new Date().toISOString()
  }
];

let tasks: any[] = [
  {
    id: '1',
    title: 'Sample Task',
    description: 'This is a sample task to get you started',
    list_id: '1',
    priority: 'medium',
    completed: false,
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let users: any[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Demo User',
    email: 'demo@example.com',
    created_at: new Date().toISOString()
  }
];

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS
app.use(cors({
  origin: ['https://client-lu3hbmdkk-shoaib-tashrifs-projects.vercel.app', 'http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes

// Users
app.get('/api/users', (req: Request, res: Response) => {
  res.json(users);
});

// Boards
app.get('/api/boards', (req: Request, res: Response) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  
  const userBoards = boards.filter(board => 
    board.user_id === user_id || 
    board.members?.some((member: any) => member.user_id === user_id)
  );
  
  res.json(userBoards);
});

app.get('/api/boards/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const board = boards.find(b => b.id === id);
  
  if (!board) {
    return res.status(404).json({ error: 'Board not found' });
  }
  
  res.json(board);
});

app.post('/api/boards', (req: Request, res: Response) => {
  const { title, description, user_id } = req.body;
  
  if (!title || !user_id) {
    return res.status(400).json({ error: 'title and user_id are required' });
  }
  
  const newBoard = {
    id: Date.now().toString(),
    title,
    description: description || '',
    user_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    members: [
      {
        id: Date.now().toString(),
        board_id: Date.now().toString(),
        user_id,
        role: 'owner',
        created_at: new Date().toISOString(),
        user: users.find(u => u.id === user_id) || { name: 'Unknown User', email: 'unknown@example.com' }
      }
    ]
  };
  
  boards.push(newBoard);
  
  // Create default lists
  const defaultLists = ['To Do', 'In Progress', 'Done'];
  defaultLists.forEach((listTitle, index) => {
    const newList = {
      id: (Date.now() + index).toString(),
      title: listTitle,
      board_id: newBoard.id,
      position: index,
      created_at: new Date().toISOString()
    };
    lists.push(newList);
  });
  
  res.status(201).json(newBoard);
});

// Lists
app.get('/api/lists', (req: Request, res: Response) => {
  const { board_id } = req.query;
  if (!board_id) {
    return res.status(400).json({ error: 'board_id is required' });
  }
  
  const boardLists = lists.filter(list => list.board_id === board_id);
  res.json(boardLists);
});

app.post('/api/lists', (req: Request, res: Response) => {
  const { title, board_id, position } = req.body;
  
  if (!title || !board_id) {
    return res.status(400).json({ error: 'title and board_id are required' });
  }
  
  const newList = {
    id: Date.now().toString(),
    title,
    board_id,
    position: position || lists.filter(l => l.board_id === board_id).length,
    created_at: new Date().toISOString()
  };
  
  lists.push(newList);
  res.status(201).json(newList);
});

// Tasks
app.get('/api/tasks', (req: Request, res: Response) => {
  const { list_id } = req.query;
  if (!list_id) {
    return res.status(400).json({ error: 'list_id is required' });
  }
  
  const listTasks = tasks.filter(task => task.list_id === list_id);
  res.json(listTasks);
});

app.post('/api/tasks', (req: Request, res: Response) => {
  const { title, description, list_id, priority, assigned_to } = req.body;
  
  if (!title || !list_id) {
    return res.status(400).json({ error: 'title and list_id are required' });
  }
  
  const newTask = {
    id: Date.now().toString(),
    title,
    description: description || '',
    list_id,
    priority: priority || 'medium',
    completed: false,
    assigned_to: assigned_to || undefined,
    position: tasks.filter(t => t.list_id === list_id).length,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks[taskIndex] = { ...tasks[taskIndex], ...req.body, updated_at: new Date().toISOString() };
  res.json(tasks[taskIndex]);
});

app.patch('/api/tasks/:id/move', (req: Request, res: Response) => {
  const { id } = req.params;
  const { new_list_id, new_position } = req.body;
  
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks[taskIndex].list_id = new_list_id;
  tasks[taskIndex].position = new_position;
  tasks[taskIndex].updated_at = new Date().toISOString();
  
  res.json(tasks[taskIndex]);
});

// Board members
app.post('/api/boards/:id/members', (req: Request, res: Response) => {
  const { id } = req.params;
  const { user_id, role = 'member' } = req.body;
  
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  
  const board = boards.find(b => b.id === id);
  if (!board) {
    return res.status(404).json({ error: 'Board not found' });
  }
  
  const newMember = {
    id: Date.now().toString(),
    board_id: id,
    user_id,
    role,
    created_at: new Date().toISOString(),
    user: users.find(u => u.id === user_id) || { name: 'Unknown User', email: 'unknown@example.com' }
  };
  
  board.members.push(newMember);
  res.status(201).json(newMember);
});

app.delete('/api/boards/:id/members/:user_id', (req: Request, res: Response) => {
  const { id, user_id } = req.params;
  
  const board = boards.find(b => b.id === id);
  if (!board) {
    return res.status(404).json({ error: 'Board not found' });
  }
  
  const memberIndex = board.members.findIndex((m: any) => m.user_id === user_id);
  if (memberIndex === -1) {
    return res.status(404).json({ error: 'Board member not found' });
  }
  
  board.members.splice(memberIndex, 1);
  res.json({ message: 'Member removed from board successfully' });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app; 