import express from 'express';
import mongoose from 'mongoose';
import Column from '../models/Column.js';

const router = express.Router();

// 모든 칼럼 가져오기
router.get('/', async (req, res) => {
  try {
    const columns = await Column.find().sort({ order: 1 });
    res.json(columns);
  } catch (error) {
    res.status(500).json({ message: '칼럼을 가져오는데 실패했습니다.', error: error.message });
  }
});

// 특정 칼럼 가져오기
router.get('/:id', async (req, res) => {
  try {
    const column = await Column.findById(req.params.id);
    if (!column) {
      return res.status(404).json({ message: '칼럼을 찾을 수 없습니다.' });
    }
    res.json(column);
  } catch (error) {
    res.status(500).json({ message: '칼럼을 가져오는데 실패했습니다.', error: error.message });
  }
});

// 칼럼 생성
router.post('/', async (req, res) => {
  try {
    console.log('✅ [칼럼 생성] 요청 받음');
    const { name, collapsed, order, cards } = req.body;
    console.log('📥 받은 데이터:', { name, collapsed, order });
    
    if (!name || name.trim() === '') {
      console.log('❌ 칼럼 이름이 없음');
      return res.status(400).json({ message: '칼럼 이름을 입력해주세요.' });
    }

    const column = new Column({
      name: name.trim(),
      collapsed: collapsed || false,
      order: order !== undefined ? order : 999,
      cards: cards || {}
    });

    const savedColumn = await column.save();
    console.log('✅ [칼럼 생성 완료] ID:', savedColumn._id, '이름:', savedColumn.name);
    res.status(201).json(savedColumn);
  } catch (error) {
    console.error('❌ [칼럼 생성 실패]', error.message);
    res.status(500).json({ message: '칼럼을 저장하는데 실패했습니다.', error: error.message });
  }
});

// 칼럼 수정
router.put('/:id', async (req, res) => {
  try {
    const { name, collapsed, order } = req.body;
    const updateData = {};
    
    if (name !== undefined) updateData.name = name.trim();
    if (collapsed !== undefined) updateData.collapsed = collapsed;
    if (order !== undefined) updateData.order = order;

    const column = await Column.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!column) {
      return res.status(404).json({ message: '칼럼을 찾을 수 없습니다.' });
    }

    res.json(column);
  } catch (error) {
    res.status(500).json({ message: '칼럼을 수정하는데 실패했습니다.', error: error.message });
  }
});

// 칼럼 삭제
router.delete('/:id', async (req, res) => {
  try {
    console.log('🗑️ [칼럼 삭제] 요청 받음, ID:', req.params.id);
    const column = await Column.findByIdAndDelete(req.params.id);
    
    if (!column) {
      console.log('❌ 칼럼을 찾을 수 없음:', req.params.id);
      return res.status(404).json({ message: '칼럼을 찾을 수 없습니다.' });
    }

    console.log('✅ [칼럼 삭제 완료] ID:', column._id, '이름:', column.name);
    res.json({ message: '칼럼이 삭제되었습니다.', column });
  } catch (error) {
    console.error('❌ [칼럼 삭제 실패]', error.message);
    res.status(500).json({ message: '칼럼을 삭제하는데 실패했습니다.', error: error.message });
  }
});

// 카드 추가
router.post('/:id/cards', async (req, res) => {
  try {
    console.log('✅ [카드 추가] 요청 받음');
    console.log('📥 칼럼 ID:', req.params.id);
    const { text, order } = req.body;
    console.log('📥 카드 데이터:', { text, order });
    
    if (!text || text.trim() === '') {
      console.log('❌ 카드 내용이 없음');
      return res.status(400).json({ message: '카드 내용을 입력해주세요.' });
    }

    const column = await Column.findById(req.params.id);
    if (!column) {
      console.log('❌ 칼럼을 찾을 수 없음:', req.params.id);
      return res.status(404).json({ message: '칼럼을 찾을 수 없습니다.' });
    }

    // 카드 추가 (객체 형태로 저장)
    const cardId = new mongoose.Types.ObjectId().toString();
    const cards = column.cards || {};
    const cardCount = Object.keys(cards).length;
    
    const newCards = { ...cards };
    newCards[cardId] = {
      text: text.trim(),
      order: order !== undefined ? order : cardCount
    };
    
    column.set('cards', newCards);
    column.markModified('cards');
    const savedColumn = await column.save();
    
    console.log('✅ [카드 추가 완료] 카드 ID:', cardId, '칼럼:', column.name, '텍스트:', text.trim());
    
    // 추가된 카드 반환
    res.status(201).json({ id: cardId, ...savedColumn.cards[cardId] });
  } catch (error) {
    console.error('❌ [카드 추가 실패]', error.message);
    res.status(500).json({ message: '카드를 추가하는데 실패했습니다.', error: error.message });
  }
});

// 카드 수정
router.put('/:id/cards/:cardId', async (req, res) => {
  try {
    console.log('✏️ [카드 수정/이동] 요청 받음');
    console.log('📥 칼럼 ID:', req.params.id, '카드 ID:', req.params.cardId);
    const { text, order } = req.body;
    console.log('📥 수정 데이터:', { text, order });
    
    const column = await Column.findById(req.params.id);
    if (!column) {
      console.log('❌ 칼럼을 찾을 수 없음:', req.params.id);
      return res.status(404).json({ message: '칼럼을 찾을 수 없습니다.' });
    }

    const cards = column.cards || {};
    const card = cards[req.params.cardId];
    if (!card) {
      console.log('❌ 카드를 찾을 수 없음:', req.params.cardId);
      return res.status(404).json({ message: '카드를 찾을 수 없습니다.' });
    }

    // 카드 업데이트
    if (text !== undefined) card.text = text.trim();
    if (order !== undefined) {
      console.log('🔄 카드 순서 변경:', card.order, '->', order);
      card.order = order;
    }
    
    const newCards = { ...cards };
    newCards[req.params.cardId] = card;
    
    column.set('cards', newCards);
    column.markModified('cards');
    const savedColumn = await column.save();
    
    const updatedCard = savedColumn.cards[req.params.cardId];
    console.log('✅ [카드 수정 완료] 카드 ID:', req.params.cardId, text !== undefined ? `텍스트: ${text.trim()}` : `순서: ${order}`);
    res.json({ id: req.params.cardId, ...updatedCard });
  } catch (error) {
    console.error('❌ [카드 수정 실패]', error.message);
    res.status(500).json({ message: '카드를 수정하는데 실패했습니다.', error: error.message });
  }
});

// 카드 삭제
router.delete('/:id/cards/:cardId', async (req, res) => {
  try {
    console.log('🗑️ [카드 삭제] 요청 받음');
    console.log('📥 칼럼 ID:', req.params.id, '카드 ID:', req.params.cardId);
    
    const column = await Column.findById(req.params.id);
    if (!column) {
      console.log('❌ 칼럼을 찾을 수 없음:', req.params.id);
      return res.status(404).json({ message: '칼럼을 찾을 수 없습니다.' });
    }

    const cards = column.cards || {};
    const card = cards[req.params.cardId];
    if (!card) {
      console.log('❌ 카드를 찾을 수 없음:', req.params.cardId);
      return res.status(404).json({ message: '카드를 찾을 수 없습니다.' });
    }

    console.log('🗑️ 삭제할 카드:', { text: card.text, order: card.order });

    // 카드 삭제 - 새로운 객체 생성하여 확실히 저장
    const newCards = { ...cards };
    delete newCards[req.params.cardId];
    
    // Mongoose가 변경을 감지하도록 직접 할당
    column.set('cards', newCards);
    column.markModified('cards');
    
    const savedColumn = await column.save();
    
    // 저장 확인
    console.log('💾 저장된 칼럼:', savedColumn.name);
    console.log('💾 저장된 카드 수:', Object.keys(savedColumn.cards || {}).length);
    console.log('✅ [카드 삭제 완료] 카드 ID:', req.params.cardId, '칼럼:', column.name);
    res.json({ message: '카드가 삭제되었습니다.', card: { id: req.params.cardId, ...card } });
  } catch (error) {
    console.error('❌ [카드 삭제 실패]', error.message);
    res.status(500).json({ message: '카드를 삭제하는데 실패했습니다.', error: error.message });
  }
});

// 모든 칼럼 삭제 (데이터 초기화용)
router.delete('/all', async (req, res) => {
  try {
    console.log('🗑️ [모든 칼럼 삭제] 요청 받음');
    const result = await Column.deleteMany({});
    console.log('✅ [모든 칼럼 삭제 완료]', result.deletedCount, '개 삭제됨');
    res.json({ message: '모든 칼럼이 삭제되었습니다.', deletedCount: result.deletedCount });
  } catch (error) {
    console.error('❌ [모든 칼럼 삭제 실패]', error.message);
    res.status(500).json({ message: '칼럼 삭제에 실패했습니다.', error: error.message });
  }
});

export default router;

