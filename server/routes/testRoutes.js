import express from "express";
import { saveResult, getResults } from "../controllers/testController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();



router.post("/setTestResult", protect, saveResult);
router.get("/getResults", protect, getResults);

export default router;
