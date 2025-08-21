import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Task, List, Board, User, BoardMember } from './types';

const DEMO_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

function App() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [showBoardMembers, setShowBoardMembers] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [newListTitle, setNewListTitle] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const [newMemberUserId, setNewMemberUserId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'member' | 'admin'>('member');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load users first
      const usersResponse = await fetch('https://server-pu84g82sc-shoaib-tashrifs-projects.vercel.app/api/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }
      
      // Load boards
      const boardsResponse = await fetch(`https://server-pu84g82sc-shoaib-tashrifs-projects.vercel.app/api/boards?user_id=${DEMO_USER_ID}`);
      if (boardsResponse.ok) {
        const boardsData = await boardsResponse.json();
        setBoards(boardsData);
        
        if (boardsData.length > 0) {
          const firstBoard = boardsData[0];
          setCurrentBoard(firstBoard);
          
          // Load board with members
          await loadBoardWithMembers(firstBoard.id);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBoardWithMembers = async (boardId: string) => {
    try {
      const boardResponse = await fetch(`https://server-pu84g82sc-shoaib-tashrifs-projects.vercel.app/api/boards/${boardId}`);
      if (boardResponse.ok) {
        const boardData = await boardResponse.json();
        setCurrentBoard(boardData);
        
        // Load lists for the board
        const listsResponse = await fetch(`https://server-pu84g82sc-shoaib-tashrifs-projects.vercel.app/api/lists?board_id=${boardId}`);
        if (listsResponse.ok) {
          const listsData = await listsResponse.json();
          setLists(listsData);
          
          // Load tasks for all lists
          const allTasks: Task[] = [];
          for (const list of listsData) {
            const tasksResponse = await fetch(`https://server-pu84g82sc-shoaib-tashrifs-projects.vercel.app/api/tasks?list_id=${list.id}`);
            if (tasksResponse.ok) {
              const tasksData = await tasksResponse.json();
              allTasks.push(...tasksData);
            }
          }
          setTasks(allTasks);
        }
      }
    } catch (error) {
      console.error('Error loading board with members:', error);
    }
  };

  const createBoard = async () => {
    if (!newBoardTitle.trim()) return;
    
    try {
      const response = await fetch('https://server-pu84g82sc-shoaib-tashrifs-projects.vercel.app/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newBoardTitle,
          description: newBoardDescription,
          user_id: DEMO_USER_ID
        }),
      });
      
      if (response.ok) {
        const newBoard = await response.json();
        setBoards([...boards, newBoard]);
        setCurrentBoard(newBoard);
        setNewBoardTitle('');
        setNewBoardDescription('');
        setShowCreateBoard(false);
        
        // Create default lists for new board
        const defaultLists = ['To Do', 'In Progress', 'Done'];
        for (let i = 0; i < defaultLists.length; i++) {
          await fetch('https://server-pu84g82sc-shoaib-tashrifs-projects.vercel.app/api/lists', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: defaultLists[i],
              board_id: newBoard.id,
              position: i
            }),
          });
        }
        
        // Reload data for the new board
        await loadBoardWithMembers(newBoard.id);
      }
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const createList = async () => {
    if (!newListTitle.trim() || !currentBoard) return;
    
    try {
      const response = await fetch('https://server-pu84g82sc-shoaib-tashrifs-projects.vercel.app/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newListTitle,
          board_id: currentBoard.id
        }),
      });
      
      if (response.ok) {
        const newList = await response.json();
        setLists([...lists, newList]);
        setNewListTitle('');
        setShowCreateList(false);
      }
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const createTask = async () => {
    if (!newTaskTitle.trim() || !selectedListId) return;
    
    try {
      const response = await fetch('https://server-pu84g82sc-shoaib-tashrifs-projects.vercel.app/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
          list_id: selectedListId,
          priority: newTaskPriority,
          assigned_to: newTaskAssignedTo || undefined
        }),
      });
      
      if (response.ok) {
        const newTask = await response.json();
        setTasks([...tasks, newTask]);
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskPriority('medium');
        setNewTaskAssignedTo('');
        setSelectedListId('');
        setShowCreateTask(false);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTask = async (task: Task) => {
    try {
      const response = await fetch(`https://server-pu84g82sc-shoaib-tashrifs-projects.vercel.app/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
        setShowEditTask(false);
        setEditingTask(null);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const addBoardMember = async () => {
    if (!newMemberUserId || !currentBoard) return;
    
    try {
      const response = await fetch(`https://server-pu84g82sc-shoaib-tashrifs-projects.vercel.app/api/boards/${currentBoard.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: newMemberUserId,
          role: newMemberRole
        }),
      });
      
      if (response.ok) {
        const newMember = await response.json();
        // Reload board to get updated members
        await loadBoardWithMembers(currentBoard.id);
        setNewMemberUserId('');
        setNewMemberRole('member');
        setShowAddMember(false);
      }
    } catch (error) {
      console.error('Error adding board member:', error);
    }
  };

  const removeBoardMember = async (userId: string) => {
    if (!currentBoard) return;
    
    try {
      const response = await fetch(`https://server-pu84g82sc-shoaib-tashrifs-projects.vercel.app/api/boards/${currentBoard.id}/members/${userId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Reload board to get updated members
        await loadBoardWithMembers(currentBoard.id);
      }
    } catch (error) {
      console.error('Error removing board member:', error);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'task') {
      // Move task between lists or reorder within same list
      const newTasks = Array.from(tasks);
      const taskIndex = newTasks.findIndex(task => task.id === draggableId);
      const task = newTasks[taskIndex];
      
      if (!task) return;
      
      const sourceListId = source.droppableId;
      const destListId = destination.droppableId;
      
      if (sourceListId === destListId) {
        // Reorder within same list
        newTasks.splice(taskIndex, 1);
        newTasks.splice(destination.index, 0, task);
        
        // Update positions
        const listTasks = newTasks.filter(t => t.list_id === sourceListId);
        listTasks.forEach((t, index) => {
          t.position = index;
        });
      } else {
        // Move to different list
        task.list_id = destListId;
        task.position = destination.index;
        
        // Update positions for both lists
        const sourceListTasks = newTasks.filter(t => t.list_id === sourceListId);
        const destListTasks = newTasks.filter(t => t.list_id === destListId);
        
        sourceListTasks.forEach((t, index) => {
          t.position = index;
        });
        destListTasks.forEach((t, index) => {
          t.position = index;
        });
      }
      
      setTasks(newTasks);
      
      // Update in database
      try {
        await fetch(`https://server-pu84g82sc-shoaib-tashrifs-projects.vercel.app/api/tasks/${task.id}/move`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            new_list_id: destListId,
            new_position: destination.index
          }),
        });
      } catch (error) {
        console.error('Error moving task:', error);
      }
    }
  };

  const openEditTask = (task: Task) => {
    setEditingTask({ ...task });
    setShowEditTask(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'member': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your boards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary-600">
                Task Manager
              </h1>
              <span className="text-sm text-gray-500">Organize your work</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowCreateBoard(true)}
                className="btn btn-primary"
              >
                + New Board
              </button>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">U</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {currentBoard ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{currentBoard.title}</h1>
                {currentBoard.description && (
                  <p className="text-gray-600 mt-2">{currentBoard.description}</p>
                )}
                {/* Board Members Display */}
                {currentBoard.members && currentBoard.members.length > 0 && (
                  <div className="flex items-center space-x-2 mt-3">
                    <span className="text-sm text-gray-500">Members:</span>
                    {currentBoard.members.slice(0, 3).map((member) => (
                      <div key={member.id} className="flex items-center space-x-1">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600">{member.user?.name}</span>
                      </div>
                    ))}
                    {currentBoard.members.length > 3 && (
                      <span className="text-xs text-gray-500">+{currentBoard.members.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setShowBoardMembers(true)}
                  className="btn btn-secondary"
                >
                  Manage Members
                </button>
                <button 
                  onClick={() => setShowCreateList(true)}
                  className="btn btn-primary"
                >
                  + Add List
                </button>
              </div>
            </div>
            
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {lists.map((list) => (
                <Droppable key={list.id} droppableId={list.id} type="task">
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-shrink-0 w-80"
                    >
                      <div className={`bg-gray-100 rounded-lg p-4 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}>
                        <h3 className="font-semibold text-gray-900 mb-4">{list.title}</h3>
                        <div className="space-y-2">
                          {tasks
                            .filter(task => task.list_id === list.id)
                            .sort((a, b) => a.position - b.position)
                            .map((task, index) => (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`bg-white p-3 rounded shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                                      snapshot.isDragging ? 'shadow-lg' : ''
                                    }`}
                                    onClick={() => openEditTask(task)}
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <h4 className="font-medium text-gray-900 flex-1">{task.title}</h4>
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                      </span>
                                    </div>
                                    {task.description && (
                                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                                    )}
                                    {task.assigned_to && (
                                      <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                          <span className="text-white text-xs font-medium">
                                            {task.assigned_to_name ? task.assigned_to_name.charAt(0).toUpperCase() : 'U'}
                                          </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          {task.assigned_to_name || 'Unknown User'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedListId(list.id);
                            setShowCreateTask(true);
                          }}
                          className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm"
                        >
                          + Add a card
                        </button>
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </div>
        </DragDropContext>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            No boards yet
          </h2>
          <p className="text-gray-500 mb-6">
            Create your first board to get started with task management
          </p>
          <button
            onClick={() => setShowCreateBoard(true)}
            className="btn btn-primary"
          >
            Create Board
          </button>
        </div>
      )}

      {/* Create Board Modal */}
      {showCreateBoard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New Board</h3>
            <input
              type="text"
              placeholder="Board title"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              className="input mb-4"
            />
            <textarea
              placeholder="Board description (optional)"
              value={newBoardDescription}
              onChange={(e) => setNewBoardDescription(e.target.value)}
              className="input mb-4"
              rows={3}
            />
            <div className="flex space-x-2">
              <button onClick={createBoard} className="btn btn-primary flex-1">
                Create
              </button>
              <button onClick={() => setShowCreateBoard(false)} className="btn btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create List Modal */}
      {showCreateList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New List</h3>
            <input
              type="text"
              placeholder="List title"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              className="input mb-4"
            />
            <div className="flex space-x-2">
              <button onClick={createList} className="btn btn-primary flex-1">
                Create
              </button>
              <button onClick={() => setShowCreateList(false)} className="btn btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
            <input
              type="text"
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="input mb-4"
            />
            <textarea
              placeholder="Task description (optional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="input mb-4"
              rows={3}
            />
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="input mb-4"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <select
              value={newTaskAssignedTo}
              onChange={(e) => setNewTaskAssignedTo(e.target.value)}
              className="input mb-4"
            >
              <option value="">Unassigned</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <div className="flex space-x-2">
              <button onClick={createTask} className="btn btn-primary flex-1">
                Create
              </button>
              <button onClick={() => setShowCreateTask(false)} className="btn btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditTask && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Task</h3>
            <input
              type="text"
              placeholder="Task title"
              value={editingTask.title}
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              className="input mb-4"
            />
            <textarea
              placeholder="Task description (optional)"
              value={editingTask.description || ''}
              onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
              className="input mb-4"
              rows={3}
            />
            <select
              value={editingTask.priority}
              onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
              className="input mb-4"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <select
              value={editingTask.assigned_to || ''}
              onChange={(e) => setEditingTask({ ...editingTask, assigned_to: e.target.value || undefined })}
              className="input mb-4"
            >
              <option value="">Unassigned</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="completed"
                checked={editingTask.completed}
                onChange={(e) => setEditingTask({ ...editingTask, completed: e.target.checked })}
                className="w-4 h-4 text-primary-600"
              />
              <label htmlFor="completed" className="text-sm text-gray-700">Mark as completed</label>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => updateTask(editingTask)} className="btn btn-primary flex-1">
                Update
              </button>
              <button onClick={() => setShowEditTask(false)} className="btn btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Board Members Modal */}
      {showBoardMembers && currentBoard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Board Members</h3>
            <div className="space-y-3 mb-4">
              {currentBoard.members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.user?.name}</p>
                      <p className="text-sm text-gray-500">{member.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                    {member.role !== 'owner' && (
                      <button
                        onClick={() => removeBoardMember(member.user_id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowAddMember(true)}
                className="btn btn-primary flex-1"
              >
                + Add Member
              </button>
              <button 
                onClick={() => setShowBoardMembers(false)}
                className="btn btn-secondary flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add Board Member</h3>
            <select
              value={newMemberUserId}
              onChange={(e) => setNewMemberUserId(e.target.value)}
              className="input mb-4"
            >
              <option value="">Select a user</option>
              {users
                .filter(user => !currentBoard?.members?.some(member => member.user_id === user.id))
                .map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                ))
              }
            </select>
            <select
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value as 'member' | 'admin')}
              className="input mb-4"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex space-x-2">
              <button onClick={addBoardMember} className="btn btn-primary flex-1">
                Add Member
              </button>
              <button onClick={() => setShowAddMember(false)} className="btn btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 