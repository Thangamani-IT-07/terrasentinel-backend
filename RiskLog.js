const mongoose = require('mongoose');

const riskLogSchema = new mongoose.Schema({
  averageRisk: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RiskLog', riskLogSchema);