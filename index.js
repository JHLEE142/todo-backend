// Main entry point for the todo backend application
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import todoRouter from './routers/todos.js';

// 환경변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS 설정
app.use(cors({
  origin: 'http://localhost:8000',
  credentials: true
}));

// Middleware
app.use(express.json());

// MongoDB 연결
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB 연결 성공');
    console.log(`📦 데이터베이스: ${mongoose.connection.db.databaseName}`);
  })
  .catch((error) => {
    console.error('❌ MongoDB 연결 실패:', error.message);
  });

// MongoDB 연결 상태 확인
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB 연결 성공');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB 연결 에러:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB 연결이 끊어졌습니다.');
});

// Basic health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Todo Backend API is running!',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Todo API Routes
app.use('/api/todos', todoRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
