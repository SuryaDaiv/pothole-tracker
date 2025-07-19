import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error', err));

const potholeSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  city: String,
  country: String,
  timestamp: { type: Date, default: Date.now },
  submitted_by: String
});

const Pothole = mongoose.model('Pothole', potholeSchema);

// Placeholder OTP store (in memory)
const otpStore = new Map();

function auth(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Auth required' });
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.userPhone = data.phone;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/api/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone is required' });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, otp);
  console.log(`OTP for ${phone}: ${otp}`); // replace with Twilio call
  res.json({ message: 'OTP sent' });
});

app.post('/api/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  const realOtp = otpStore.get(phone);
  if (realOtp && otp === realOtp) {
    otpStore.delete(phone);
    const token = jwt.sign({ phone }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Invalid OTP' });
});

app.post('/api/report', auth, async (req, res) => {
  const { lat, lng } = req.body;
  const phone = req.userPhone || 'unknown';
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ error: 'lat and lng required' });
  }
  // TODO: reverse geocode using process.env.GEOCODING_API_KEY
  const city = 'Unknown City';
  const country = 'Unknown Country';
  const pothole = await Pothole.create({ lat, lng, city, country, submitted_by: phone });
  res.json(pothole);
});

app.get('/api/potholes', async (req, res) => {
  const { city } = req.query;
  const filter = city ? { city } : {};
  const potholes = await Pothole.find(filter).lean();
  res.json(potholes);
});

app.get('/api/dashboard', async (req, res) => {
  const total = await Pothole.countDocuments();
  const mostCities = await Pothole.aggregate([
    { $group: { _id: '$city', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);
  const leastCities = await Pothole.aggregate([
    { $group: { _id: '$city', count: { $sum: 1 } } },
    { $sort: { count: 1 } },
    { $limit: 5 }
  ]);
  res.json({ total, mostCities, leastCities });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listening on ${port}`));
