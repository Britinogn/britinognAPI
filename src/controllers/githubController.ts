import { Request, Response } from "express";
import GithubModel, { IGithub } from "../models/Github";
import axios from "axios";

// GitHub API configuration
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "Britinogn";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Optional but recommended for higher rate limits

// Helper function to fetch data from GitHub API
export const fetchGithubData = async () => {
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github.v3+json",
  };

  // Add authentication token if available (increases rate limit from 60 to 5000 requests/hour)
  if (GITHUB_TOKEN) {
    headers["Authorization"] = `token ${GITHUB_TOKEN}`;
  }

  try {
    // Fetch user data
    const userResponse = await axios.get(
      `https://api.github.com/users/${GITHUB_USERNAME}`,
      { headers }
    );

    // Fetch repositories
    const reposResponse = await axios.get(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
      { headers }
    );

    const repos = reposResponse.data;

    // Calculate statistics
    const totalStars = repos.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum: number, repo: any) => sum + repo.forks_count, 0);
    const totalRepos = userResponse.data.public_repos;

    // Get languages used across repositories
    const languagesSet = new Set<string>();
    repos.forEach((repo: any) => {
      if (repo.language) {
        languagesSet.add(repo.language);
      }
    });

    return {
      username: GITHUB_USERNAME,
      totalRepos,
      totalStars,
      totalForks,
      followers: userResponse.data.followers,
      following: userResponse.data.following,
      languages: Array.from(languagesSet),
      avatarUrl: userResponse.data.avatar_url,
      bio: userResponse.data.bio,
      location: userResponse.data.location,
      company: userResponse.data.company,
      blog: userResponse.data.blog,
      lastUpdated: new Date(),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`GitHub API error: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};

// GET /api/github — fetch real-time GitHub stats
export const getGithubStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Option 1: Always fetch fresh data from GitHub
    const freshStats = await fetchGithubData();
    
    // Save to database for caching
    await GithubModel.findOneAndUpdate({}, freshStats, {
      upsert: true,
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "GitHub stats retrieved successfully",
      stats: freshStats,
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "An error occurred while fetching GitHub statistics";
    res.status(500).json({ error: errorMessage });
  }
};

// GET /api/github/cached — fetch cached GitHub stats from database
export const getCachedGithubStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats: IGithub | null = await GithubModel.findOne();

    if (!stats) {
      res.status(404).json({ message: "GitHub stats not found. Please refresh to fetch new data." });
      return;
    }

    res.status(200).json({
      message: "Cached GitHub stats retrieved successfully",
      stats,
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "An error occurred while fetching cached GitHub statistics";
    res.status(500).json({ error: errorMessage });
  }
};

// POST /api/github/refresh — manually refresh GitHub stats
export const refreshGithubStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const freshStats = await fetchGithubData();

    const updatedStats = await GithubModel.findOneAndUpdate({}, freshStats, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "GitHub stats refreshed successfully",
      stats: updatedStats,
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "An error occurred while refreshing GitHub statistics";
    res.status(500).json({ error: errorMessage });
  }
};

// POST /api/github — manual update (admin use, for custom overrides)
export const updateGithubStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const updateData = req.body as Partial<IGithub>;

    const updatedStats = await GithubModel.findOneAndUpdate({}, updateData, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "GitHub stats updated successfully",
      stats: updatedStats,
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "An error occurred while updating GitHub statistics";
    res.status(400).json({ error: errorMessage });
  }
};

// Export grouped controller
export default {
  getGithubStats,
  getCachedGithubStats,
  refreshGithubStats,
  updateGithubStats,
  fetchGithubData,
};