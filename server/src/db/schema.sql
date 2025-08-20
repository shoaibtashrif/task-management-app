-- Create tables for Task Management App

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Boards table
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Board Members table (for adding users to boards)
CREATE TABLE IF NOT EXISTS board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- 'owner', 'admin', 'member'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(board_id, user_id)
);

-- Lists table
CREATE TABLE IF NOT EXISTS lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  priority VARCHAR(20) DEFAULT 'medium',
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_boards_user_id ON boards(user_id);
CREATE INDEX IF NOT EXISTS idx_board_members_board_id ON board_members(board_id);
CREATE INDEX IF NOT EXISTS idx_board_members_user_id ON board_members(user_id);
CREATE INDEX IF NOT EXISTS idx_lists_board_id ON lists(board_id);
CREATE INDEX IF NOT EXISTS idx_tasks_list_id ON tasks(list_id);
CREATE INDEX IF NOT EXISTS idx_lists_position ON lists(board_id, position);
CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(list_id, position);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);

-- Insert sample data
INSERT INTO users (id, email, name) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'demo@example.com', 'Demo User'),
  ('550e8400-e29b-41d4-a716-446655440008', 'john@example.com', 'John Doe'),
  ('550e8400-e29b-41d4-a716-446655440009', 'jane@example.com', 'Jane Smith')
ON CONFLICT (id) DO NOTHING;

INSERT INTO boards (id, title, description, user_id) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'My First Board', 'A sample board to get started', '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (id) DO NOTHING;

-- Add board members
INSERT INTO board_members (board_id, user_id, role) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'owner'),
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440008', 'member'),
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440009', 'member')
ON CONFLICT (board_id, user_id) DO NOTHING;

INSERT INTO lists (id, title, board_id, position) VALUES 
  ('550e8400-e29b-41d4-a716-446655440002', 'To Do', '550e8400-e29b-41d4-a716-446655440001', 0),
  ('550e8400-e29b-41d4-a716-446655440003', 'In Progress', '550e8400-e29b-41d4-a716-446655440001', 1),
  ('550e8400-e29b-41d4-a716-446655440004', 'Done', '550e8400-e29b-41d4-a716-446655440001', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (id, title, description, list_id, position, priority, assigned_to) VALUES 
  ('550e8400-e29b-41d4-a716-446655440005', 'Welcome to Task Manager!', 'This is your first task. Click to edit or drag to move between lists.', '550e8400-e29b-41d4-a716-446655440002', 0, 'high', '550e8400-e29b-41d4-a716-446655440000'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Create your first board', 'Start by creating a new board for your project.', '550e8400-e29b-41d4-a716-446655440002', 1, 'medium', '550e8400-e29b-41d4-a716-446655440008'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Add some tasks', 'Create tasks and organize them into lists.', '550e8400-e29b-41d4-a716-446655440002', 2, 'low', '550e8400-e29b-41d4-a716-446655440009')
ON CONFLICT (id) DO NOTHING; 