// Main entry point for the todo backend application
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import todoRouter from './routers/todos.js';
import columnRouter from './routers/columns.js';

// 환경변수 로드
dotenv.config();

// 환경변수 로드 확인 (디버깅용)
if (process.env.MONGODB_URI) {
  console.log('✅ 환경변수 MONGODB_URI 로드됨');
} else {
  console.log('⚠️  환경변수 MONGODB_URI 없음 - 기본값 사용');
}

const app = express();
const PORT = process.env.PORT || 5000;

// CORS 설정
const corsOptions = {
  origin: ['https://jh-todo.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// 요청 로깅 미들웨어 (express.json() 이후에 배치)
app.use((req, res, next) => {
  console.log(`📥 [${req.method}] ${req.path}`, req.body && Object.keys(req.body).length > 0 ? `Body: ${JSON.stringify(req.body)}` : '');
  next();
});

// MongoDB 연결
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB 연결 성공 !');
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

// Column API Routes
app.use('/api/columns', columnRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
