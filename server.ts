import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import bookJob from './jobs/books';
import { tasksJob, archiveJob } from './jobs/tasks';
import path from 'path';
import trackJob from './jobs/music';
const app = express();

app.set('view engine', 'ejs');

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(require('./routes/calendar'));
app.use(require('./routes/reminders'));
app.use(require('./routes/widgets'));
app.use('/styles', express.static(path.join(__dirname, '/styles')));

const minutes = 10; // TODO RM: In Testing, using a smaller interval
const interval = minutes * 1000; // TODO RM: Add minute modifier

app.get('/', (req, res) => {
  const response = {
    connected: 'Well done!',
  };
  res.json(response);
});

app.listen(port, () => {
  console.log('The application is listening on port 3000!');
  setInterval(trackJob, interval);
  setInterval(bookJob, interval);
  setInterval(tasksJob, interval);
  setInterval(archiveJob, interval);
});
