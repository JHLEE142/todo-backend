import mongoose from 'mongoose';

// Todo 스키마 정의
const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  listType: {
    type: String,
    enum: ['backlog', 'todo', 'done'],
    default: 'todo'
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// updatedAt 자동 업데이트
todoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Todo 모델 생성 및 export
const Todo = mongoose.model('Todo', todoSchema);

export default Todo;
