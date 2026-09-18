const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const Report = require('./Report');
const RiskLog = require('./RiskLog');

require('dotenv').config();
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));

const app = express();
app.use(cors());
app.use(express.json());

// Test route - check if server is alive
app.get('/', (req, res) => {
  res.send('TerraSentinel AI Backend is running');
});

// Main route - gets risk prediction from the AI model
app.post('/api/risk-check', async (req, res) => {
  try {
    const { rainfall, soil_moisture, slope_angle } = req.body;

    const response = await axios.post('http://127.0.0.1:5000/predict', {
      rainfall,
      soil_moisture,
      slope_angle
    });

    res.json({
      location: req.body.location || 'Unknown',
      risk_level: response.data.risk_level,
      top_factor: response.data.top_factor,
      model_accuracy: response.data.model_accuracy
   });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to get risk prediction' });
  }
});

// Report routes - save and fetch citizen reports
app.post('/api/reports', async (req, res) => {
  try {
    const newReport = new Report({
      text: req.body.text,
      location: req.body.location || 'Unknown'
    });
    await newReport.save();
    res.json(newReport);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save report' });
  }
});

app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find().sort({ time: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Risk log routes - track average NER risk over time
app.post('/api/risk-log', async (req, res) => {
  try {
    const newLog = new RiskLog({
      averageRisk: req.body.averageRisk
    });
    await newLog.save();
    res.json(newLog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save risk log' });
  }
});

app.get('/api/risk-log', async (req, res) => {
  try {
    const logs = await RiskLog.find().sort({ timestamp: 1 }).limit(20);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch risk log' });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://127.0.0.1:${PORT}`);
});