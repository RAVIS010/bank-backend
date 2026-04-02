require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const accountRoutes = require('./routes/accounts');

const app = express();
app.use(cors({ origin: [
    'http://localhost:3000',
    "https://bank-frontend-ruby.vercel.app"
    
], methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(express.json());

const PORT = process.env.PORT || 1337;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bad-bank';

if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI is not set; using local MongoDB default mongodb://127.0.0.1:27017/bad-bank');
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => { console.error('MongoDB connection error:', err); process.exit(1); });

app.use('/api/accounts', accountRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Bad Bank API is running' });
});

app.listen(PORT, () => {
  console.log(`Bad Bank backend running on port ${PORT}`);
});
