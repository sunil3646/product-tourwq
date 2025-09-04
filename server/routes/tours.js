const express = require("express");
const Tour = require("../models/Tour");
const auth = require("../middleware/auth");
const router = express.Router();

// Get all public tours
router.get("/", async (req, res) => {
  const tours = await Tour.find({ isPublic: true });
  res.json(tours);
});

// Get user's tours
router.get("/my", auth, async (req, res) => {
  const tours = await Tour.find({ user: req.user });
  res.json(tours);
});

// Create tour
router.post("/", auth, async (req, res) => {
  const tour = new Tour({ ...req.body, user: req.user });
  await tour.save();
  res.json(tour);
});

// Update tour
router.put("/:id", auth, async (req, res) => {
  const tour = await Tour.findOneAndUpdate(
    { _id: req.params.id, user: req.user },
    req.body,
    { new: true }
  );
  if (!tour) return res.status(404).json({ message: "Tour not found" });
  res.json(tour);
});

// Delete tour
router.delete("/:id", auth, async (req, res) => {
  const tour = await Tour.findOneAndDelete({ _id: req.params.id, user: req.user });
  if (!tour) return res.status(404).json({ message: "Tour not found" });
  res.json({ message: "Tour deleted" });
});

module.exports = router;