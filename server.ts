import express from 'express';
import cors from 'cors';

const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(require('./routes/calendar'));

app.get('/', (req, res) => {
  const response = {
    connected: 'Well done!',
  };
  res.json(response);
});

app.listen(port, () => {
  console.log('The application is listening on port 3000!');
});
