import express from 'express';
import Todo from '../models/Todo.js';

const router = express.Router();

// 모든 할 일 가져오기
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: '할 일을 가져오는데 실패했습니다.', error: error.message });
  }
});

// 특정 할 일 가져오기
router.get('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: '할 일을 찾을 수 없습니다.' });
    }
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: '할 일을 가져오는데 실패했습니다.', error: error.message });
  }
});

// 할 일 생성
router.post('/', async (req, res) => {
  try {
    const { title, listType } = req.body;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: '할 일 제목을 입력해주세요.' });
    }

    const todo = new Todo({
      title: title.trim(),
      listType: listType || 'todo'
    });

    const savedTodo = await todo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(500).json({ message: '할 일을 저장하는데 실패했습니다.', error: error.message });
  }
});

// 할 일 수정
router.put('/:id', async (req, res) => {
  try {
    const { title, listType, completed } = req.body;
    const updateData = {};
    
    if (title !== undefined) updateData.title = title.trim();
    if (listType !== undefined) updateData.listType = listType;
    if (completed !== undefined) updateData.completed = completed;
    updateData.updatedAt = Date.now();

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({ message: '할 일을 찾을 수 없습니다.' });
    }

    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: '할 일을 수정하는데 실패했습니다.', error: error.message });
  }
});

// 할 일 삭제
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ message: '할 일을 찾을 수 없습니다.' });
    }

    res.json({ message: '할 일이 삭제되었습니다.', todo });
  } catch (error) {
    res.status(500).json({ message: '할 일을 삭제하는데 실패했습니다.', error: error.message });
  }
});

export default router;

