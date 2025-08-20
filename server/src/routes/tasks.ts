import express from 'express';
import pool from '../db/connection';

const router = express.Router();

// Get all tasks for a list
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const { list_id } = req.query;
    
    if (!list_id) {
      return res.status(400).json({ error: 'list_id is required' });
    }

    const result = await pool.query(
      `SELECT t.*, u.name as assigned_to_name 
       FROM tasks t 
       LEFT JOIN users u ON t.assigned_to = u.id 
       WHERE t.list_id = $1 
       ORDER BY t.position ASC`,
      [list_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get a single task by ID
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT t.*, u.name as assigned_to_name 
       FROM tasks t 
       LEFT JOIN users u ON t.assigned_to = u.id 
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create a new task
router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const { title, description, list_id, position, priority, due_date, assigned_to } = req.body;
    
    if (!title || !list_id) {
      return res.status(400).json({ error: 'title and list_id are required' });
    }

    // Get the next position if not provided
    let nextPosition = position;
    if (nextPosition === undefined) {
      const maxPosResult = await pool.query(
        'SELECT COALESCE(MAX(position), -1) + 1 as next_position FROM tasks WHERE list_id = $1',
        [list_id]
      );
      nextPosition = maxPosResult.rows[0].next_position;
    }

    const result = await pool.query(
      'INSERT INTO tasks (title, description, list_id, position, priority, due_date, assigned_to) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, list_id, nextPosition, priority || 'medium', due_date, assigned_to]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update a task
router.put('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { title, description, list_id, position, priority, due_date, completed, assigned_to } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, list_id = $3, position = $4, priority = $5, due_date = $6, completed = $7, assigned_to = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING *',
      [title, description, list_id, position, priority, due_date, completed, assigned_to, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Move task between lists (for drag and drop)
router.patch('/:id/move', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { new_list_id, new_position } = req.body;
    
    if (!new_list_id || new_position === undefined) {
      return res.status(400).json({ error: 'new_list_id and new_position are required' });
    }

    // Update the task's list and position
    const result = await pool.query(
      'UPDATE tasks SET list_id = $1, position = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [new_list_id, new_position, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error moving task:', error);
    res.status(500).json({ error: 'Failed to move task' });
  }
});

// Toggle task completion
router.patch('/:id/toggle', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE tasks SET completed = NOT completed, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(500).json({ error: 'Failed to toggle task' });
  }
});

// Delete a task
router.delete('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router; 