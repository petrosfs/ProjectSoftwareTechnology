import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api', apiRouter);

if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
