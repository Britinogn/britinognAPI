import { Request, Response } from "express";
import ProjectModel from "../models/Projects";
import BlogModel from "../models/BlogPost";
import ContactModel from "../models/Contacts";
import SkillModel from "../models/Skills";
import GithubModel from "../models/Github";
import { fetchGithubData } from "../controllers/githubController"; // Import the helper function

// GET /api/dashboard — fetch ALL dashboard data
export const getDashboardData = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all data in parallel for better performance
    const [projects, blogs, contacts, skills, githubStats] = await Promise.all([
      ProjectModel.find().sort({ createdAt: -1 }).lean(),
      BlogModel.find().sort({ createdAt: -1 }).lean(),
      ContactModel.find().sort({ createdAt: -1 }).lean(),
      SkillModel.find().lean(),
      GithubModel.findOne().lean(),
    ]);

    // Calculate statistics
    const stats = {
      totalProjects: projects.length,
      totalBlogs: blogs.length,
      totalContacts: contacts.length,
      totalSkills: skills.length,
      publishedProjects: projects.filter((p: any) => p.published || p.isPublished).length,
      publishedBlogs: blogs.filter((b: any) => b.published || b.isPublished).length,
      unreadContacts: contacts.filter((c: any) => !c.read || !c.isRead).length,
      //github: GithubStats,
    };

    res.status(200).json({
      message: "Dashboard data retrieved successfully",
      data: {
        stats,
        github: githubStats,
        projects: projects.slice(0, 5), // Latest 5 projects
        blogs: blogs.slice(0, 5), // Latest 5 blogs
        contacts: contacts.slice(0, 10), // Latest 10 contacts
        skills,
      },
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "An error occurred while fetching dashboard data";
    res.status(500).json({ error: errorMessage });
  }
};

// GET /api/dashboard/full — fetch COMPLETE data (no limits)
export const getFullDashboardData = async (req: Request, res: Response): Promise<void> => {
  try {
    const [projects, blogs, contacts, skills, githubStats] = await Promise.all([
      ProjectModel.find().sort({ createdAt: -1 }).lean(),
      BlogModel.find().sort({ createdAt: -1 }).lean(),
      ContactModel.find().sort({ createdAt: -1 }).lean(),
      SkillModel.find().lean(),
      GithubModel.findOne().lean(),
    ]);

    const stats = {
      totalProjects: projects.length,
      totalBlogs: blogs.length,
      totalContacts: contacts.length,
      totalSkills: skills.length,
      publishedProjects: projects.filter((p: any) => p.published || p.isPublished).length,
      publishedBlogs: blogs.filter((b: any) => b.published || b.isPublished).length,
      unreadContacts: contacts.filter((c: any) => !c.read || !c.isRead).length,
    };

    res.status(200).json({
      message: "Full dashboard data retrieved successfully",
      data: {
        stats,
        github: githubStats,
        projects,
        blogs,
        contacts,
        skills,
      },
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "An error occurred while fetching full dashboard data";
    res.status(500).json({ error: errorMessage });
  }
};

// GET /api/dashboard/stats — fetch ONLY statistics (fast & lightweight)
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [projectCount, blogCount, contactCount, skillCount, githubStats] = await Promise.all([
      ProjectModel.countDocuments(),
      BlogModel.countDocuments(),
      ContactModel.countDocuments(),
      SkillModel.countDocuments(),
      GithubModel.findOne().select('totalRepos totalStars totalForks followers').lean(),
    ]);

    const [publishedProjects, publishedBlogs, unreadContacts] = await Promise.all([
      ProjectModel.countDocuments({ $or: [{ published: true }, { isPublished: true }] }),
      BlogModel.countDocuments({ $or: [{ published: true }, { isPublished: true }] }),
      ContactModel.countDocuments({ $or: [{ read: false }, { isRead: false }] }),
    ]);

    res.status(200).json({
      message: "Dashboard statistics retrieved successfully",
      stats: {
        totalProjects: projectCount,
        totalBlogs: blogCount,
        totalContacts: contactCount,
        totalSkills: skillCount,
        publishedProjects,
        publishedBlogs,
        unreadContacts,
        github: githubStats,
      },
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "An error occurred while fetching dashboard statistics";
    res.status(500).json({ error: errorMessage });
  }
};

// GET /api/dashboard/recent — fetch recent activity
export const getRecentActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const [recentProjects, recentBlogs, recentContacts] = await Promise.all([
      ProjectModel.find().sort({ createdAt: -1 }).limit(limit).lean(),
      BlogModel.find().sort({ createdAt: -1 }).limit(limit).lean(),
      ContactModel.find().sort({ createdAt: -1 }).limit(limit).lean(),
    ]);

    // Combine and sort all recent items by date
    const allActivity = [
      ...recentProjects.map((p: any) => ({ ...p, type: 'project' })),
      ...recentBlogs.map((b: any) => ({ ...b, type: 'blog' })),
      ...recentContacts.map((c: any) => ({ ...c, type: 'contact' })),
    ].sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, limit);

    res.status(200).json({
      message: "Recent activity retrieved successfully",
      activity: allActivity,
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "An error occurred while fetching recent activity";
    res.status(500).json({ error: errorMessage });
  }
};

export default {
  getDashboardData,
  getFullDashboardData,
  getDashboardStats,
  getRecentActivity,
};