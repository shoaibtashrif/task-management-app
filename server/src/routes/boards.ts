import express from 'express';
import pool from '../db/connection';

const router = express.Router();

// Get all boards for a user
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Get boards where user is owner or member
    const result = await pool.query(
      `SELECT DISTINCT b.* 
       FROM boards b 
       LEFT JOIN board_members bm ON b.id = bm.board_id 
       WHERE b.user_id = $1 OR bm.user_id = $1 
       ORDER BY b.created_at DESC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

// Get a single board by ID with members
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // Get board details
    const boardResult = await pool.query(
      'SELECT * FROM boards WHERE id = $1',
      [id]
    );

    if (boardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const board = boardResult.rows[0];

    // Get board members with user details
    const membersResult = await pool.query(
      `SELECT bm.id, bm.board_id, bm.user_id, bm.role, bm.created_at, u.name, u.email 
       FROM board_members bm 
       LEFT JOIN users u ON bm.user_id = u.id 
       WHERE bm.board_id = $1 
       ORDER BY bm.created_at ASC`,
      [id]
    );

    board.members = membersResult.rows;
    res.json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ error: 'Failed to fetch board' });
  }
});

// Create a new board
router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const { title, description, user_id } = req.body;
    
    if (!title || !user_id) {
      return res.status(400).json({ error: 'title and user_id are required' });
    }

    const result = await pool.query(
      'INSERT INTO boards (title, description, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, description, user_id]
    );

    const newBoard = result.rows[0];

    // Add the creator as owner
    await pool.query(
      'INSERT INTO board_members (board_id, user_id, role) VALUES ($1, $2, $3)',
      [newBoard.id, user_id, 'owner']
    );

    res.status(201).json(newBoard);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// Update a board
router.put('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const result = await pool.query(
      'UPDATE boards SET title = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [title, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ error: 'Failed to update board' });
  }
});

// Delete a board
router.delete('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM boards WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ error: 'Failed to delete board' });
  }
});

// Get board members
router.get('/:id/members', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT bm.*, u.name, u.email 
       FROM board_members bm 
       JOIN users u ON bm.user_id = u.id 
       WHERE bm.board_id = $1 
       ORDER BY bm.created_at ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching board members:', error);
    res.status(500).json({ error: 'Failed to fetch board members' });
  }
});

// Add member to board
router.post('/:id/members', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { user_id, role = 'member' } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Check if user is already a member
    const existingMember = await pool.query(
      'SELECT * FROM board_members WHERE board_id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (existingMember.rows.length > 0) {
      return res.status(409).json({ error: 'User is already a member of this board' });
    }

    const result = await pool.query(
      'INSERT INTO board_members (board_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
      [id, user_id, role]
    );

    // Get user details for the response
    const userResult = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [user_id]
    );

    const memberWithUser = {
      ...result.rows[0],
      ...userResult.rows[0]
    };

    res.status(201).json(memberWithUser);
  } catch (error) {
    console.error('Error adding board member:', error);
    res.status(500).json({ error: 'Failed to add board member' });
  }
});

// Remove member from board
router.delete('/:id/members/:user_id', async (req: express.Request, res: express.Response) => {
  try {
    const { id, user_id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM board_members WHERE board_id = $1 AND user_id = $2 RETURNING *',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Board member not found' });
    }

    res.json({ message: 'Member removed from board successfully' });
  } catch (error) {
    console.error('Error removing board member:', error);
    res.status(500).json({ error: 'Failed to remove board member' });
  }
});

export default router; 