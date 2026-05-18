import { Router, Request, Response } from 'express';
import messagesController from '../controllers/MessagesController.js';

export const messagesRouter = Router();

// GET /api/messages — list conversations for logged-in user
messagesRouter.get('/conversations', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const conversations = await messagesController.getConversations(userId);
  res.json(conversations);
});

// GET /api/messages/:id — messages in a conversation
messagesRouter.get('/:id', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  try {
    const messages = await messagesController.getMessages(req.params.id, userId);
    res.json(messages);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

// POST /api/messages — send a message (creates conversation if needed)
messagesRouter.post('/', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  try {
    const { receiverId, text } = req.body;
    if (!receiverId) { res.status(400).json({ error: 'receiverId is required' }); return; }
    const message = await messagesController.sendMessage(userId, receiverId, text);
    res.status(201).json(message);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

// PATCH /api/messages/:id/read — mark all messages in conversation as read
messagesRouter.patch('/:id/read', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  await messagesController.markRead(req.params.id, userId);
  res.json({ ok: true });
});

// DELETE /api/messages/:id — delete a conversation
messagesRouter.delete('/:id', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  try {
    await messagesController.deleteConversation(req.params.id, userId);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});
