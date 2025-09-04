const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
  text: String,
  image: String
});

const tourSchema = new mongoose.Schema({
  title: { type: String, required: true },
  steps: [stepSchema],
  analytics: {
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Tour", tourSchema);