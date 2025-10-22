import express, { Router } from "express";
import {
  getDashboardData,
  getFullDashboardData,
  getDashboardStats,
  getRecentActivity,
} from "../controllers/dashboardController";
// import { authMiddleware } from "../middleware/auth"; // Uncomment if you want to protect these routes

const router: Router = express.Router();

// GET /api/dashboard — Summary with latest items (recommended for initial load)
router.get("/", getDashboardData);

// GET /api/dashboard/full — Complete data (use when you need everything)
router.get("/full", getFullDashboardData);

// GET /api/dashboard/stats — Only statistics (fastest, for quick overview)
router.get("/stats", getDashboardStats);

// GET /api/dashboard/recent — Recent activity timeline
router.get("/recent", getRecentActivity);

export default router;