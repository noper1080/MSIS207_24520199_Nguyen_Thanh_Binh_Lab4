import cors from 'cors';
import express from 'express';
import { addMessage, getMessages } from './lib/store.js';
import { validateMessage } from './lib/validateMessage.js';

const app = express();
const port = process.env.PORT ?? 3000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '10kb' }));

app.get('/api/channels/:channelId/messages', async (req, res) => {
  try {
    const messages = getMessages(req.params.channelId);
    if (!messages) return res.status(404).json({ error: 'Channel not found' });
    res.status(200).json(messages);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/channels/:channelId/messages', async (req, res) => {
  try {
    const { channelId } = req.params;
    if (!getMessages(channelId)) return res.status(404).json({ error: 'Channel not found' });

    const result = validateMessage(req.body);
    if (!result.ok) return res.status(400).json({ error: result.error });

    res.status(201).json(addMessage(channelId, result.value));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Final error handler: malformed JSON and other unexpected failures answer JSON.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
