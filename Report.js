const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  text: String,
  location: String,
  time: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);