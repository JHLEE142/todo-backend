import mongoose from 'mongoose';

// Card 서브스키마 정의
const cardSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: true, timestamps: false });

// Column 스키마 정의
const columnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  collapsed: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 999
  },
  cards: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // cards를 객체로 변환
      if (ret.cards && typeof ret.cards === 'object') {
        ret.cards = ret.cards;
      }
      return ret;
    }
  }
});

// updatedAt 자동 업데이트
columnSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Column 모델 생성 및 export
const Column = mongoose.model('Column', columnSchema);

export default Column;

