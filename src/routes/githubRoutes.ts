import express, { Router } from "express";
import {
  getGithubStats,
  getCachedGithubStats,
  refreshGithubStats,
  updateGithubStats,
} from "../controllers/githubController";

const router: Router = express.Router();

// GET /api/github — fetch fresh GitHub stats from API
router.get("/", getGithubStats);

// GET /api/github/cached — fetch cached stats from database (faster)
router.get("/cached", getCachedGithubStats);

// POST /api/github/refresh — manually refresh GitHub stats
router.post("/refresh", refreshGithubStats);

// POST /api/github — manual update (admin use only, optional)
router.post("/", updateGithubStats);

export default router;