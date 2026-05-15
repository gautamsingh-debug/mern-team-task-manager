const User = require("../models/User");
const Project = require("../models/Project");

// GET /api/team — Admin only, returns all users with project memberships
exports.getTeamMembers = async (req, res, next) => {
  try {
    const users = await User.find().select("name email role createdAt");

    // For each user, find which projects they belong to
    const projects = await Project.find()
      .select("name members")
      .lean();

    const enrichedUsers = users.map((user) => {
      const userProjects = projects
        .filter((p) => p.members.some((m) => m.toString() === user._id.toString()))
        .map((p) => ({ _id: p._id, name: p.name }));

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        projects: userProjects,
      };
    });

    res.json(enrichedUsers);
  } catch (error) {
    next(error);
  }
};
