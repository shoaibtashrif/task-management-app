import express from 'express';
import pool from '../db/connection';

const router = express.Router();

// Get all lists for a board
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const { board_id } = req.query;
    
    if (!board_id) {
      return res.status(400).json({ error: 'board_id is required' });
    }

    const result = await pool.query(
      'SELECT * FROM lists WHERE board_id = $1 ORDER BY position ASC',
      [board_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

// Get a single list by ID
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM lists WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching list:', error);
    res.status(500).json({ error: 'Failed to fetch list' });
  }
});

// Create a new list
router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const { title, board_id, position } = req.body;
    
    if (!title || !board_id) {
      return res.status(400).json({ error: 'title and board_id are required' });
    }

    // Get the next position if not provided
    let nextPosition = position;
    if (nextPosition === undefined) {
      const maxPosResult = await pool.query(
        'SELECT COALESCE(MAX(position), -1) + 1 as next_position FROM lists WHERE board_id = $1',
        [board_id]
      );
      nextPosition = maxPosResult.rows[0].next_position;
    }

    const result = await pool.query(
      'INSERT INTO lists (title, board_id, position) VALUES ($1, $2, $3) RETURNING *',
      [title, board_id, nextPosition]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ error: 'Failed to create list' });
  }
});

// Update a list
router.put('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { title, position } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const result = await pool.query(
      'UPDATE lists SET title = $1, position = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [title, position, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({ error: 'Failed to update list' });
  }
});

// Delete a list
router.delete('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM lists WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

export default router; 