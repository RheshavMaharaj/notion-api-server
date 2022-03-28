import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import bookJob from './jobs/books';
import tasksJob from './jobs/tasks';
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(require('./routes/calendar'));

const minutes = 180;
const interval = minutes * 60 * 1000;

app.get('/', (req, res) => {
  const response = {
    connected: 'Well done!',
  };
  res.json(response);
});

app.listen(port, () => {
  console.log('The application is listening on port 3000!');
  setInterval(bookJob, interval);
  setInterval(tasksJob, interval);
});
