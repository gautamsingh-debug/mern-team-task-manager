const Project = require("../models/Project");
const Task = require("../models/Task");
const Notification = require("../models/Notification");

// POST /api/projects
exports.createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id],
    });
    await project.populate("owner members", "name email role");
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// GET /api/projects
exports.getProjects = async (req, res, next) => {
  try {
    let query;
    if (req.user.role === "admin") {
      query = {};
    } else {
      query = { members: req.user._id };
    }
    const projects = await Project.find(query)
      .populate("owner", "name email")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:id
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members", "name email role");

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // Members can only see projects they belong to
    if (
      req.user.role !== "admin" &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// PUT /api/projects/:id
exports.updateProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    )
      .populate("owner", "name email")
      .populate("members", "name email role");

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/:id
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    // Also delete all tasks in this project
    await Task.deleteMany({ project: project._id });
    res.json({ message: "Project and its tasks deleted." });
  } catch (error) {
    next(error);
  }
};

// POST /api/projects/:id/members
exports.addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (project.members.includes(userId)) {
      return res.status(400).json({ message: "User is already a member." });
    }

    project.members.push(userId);
    await project.save();
    await project.populate("owner members", "name email role");

    // Notification
    if (userId !== req.user._id.toString()) {
      await Notification.create({
        recipient: userId,
        message: `You were added to the project: "${project.name}"`,
        type: "project_added",
      });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/:id/members/:userId
exports.removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({ message: "Cannot remove the project owner." });
    }

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await project.save();
    await project.populate("owner members", "name email role");

    res.json(project);
  } catch (error) {
    next(error);
  }
};
