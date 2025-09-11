import TestResult from "../models/TestResult.js";

export const saveResult = async (req, res) => {
  try {
    const { duration, wpm, accuracy, mistakes, snapshots } = req.body;

    const result = await TestResult.create({
      user: req.user.id,
      duration,
      wpm,
      accuracy,
      mistakes,
      snapshots,
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getResults = async (req, res) => {
  try {
    const results = await TestResult.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
