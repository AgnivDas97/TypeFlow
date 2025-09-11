import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    duration: Number, // in seconds (15, 30, 60)
    wpm: Number,
    accuracy: Number,
    mistakes: Number,
    snapshots: [
      {
        second: Number,
        charCount: Number,
        mistakes: Number,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("TestResult", testResultSchema);
