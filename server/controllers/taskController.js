const Task = require("../models/Task");
const Project = require("../models/Project");
const Notification = require("../models/Notification");

// POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, project, assignee, status, priority, dueDate } =
      req.body;

    // Verify project exists
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: "Project not found." });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignee: assignee || null,
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate || null,
      createdBy: req.user._id,
    });

    await task.populate("assignee", "name email");
    await task.populate("project", "name");
    await task.populate("createdBy", "name email");

    // Create Notification if assignee exists
    if (assignee && assignee.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: assignee,
        message: `You were assigned a new task: "${task.title}" in ${task.project.name}`,
        type: "task_assigned",
      });
    }

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/project/:projectId
exports.getTasksByProject = async (req, res, next) => {
  try {
    const { status, priority, assignee } = req.query;
    const filter = { project: req.params.projectId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;

    const tasks = await Task.find(filter)
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:id
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name");

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const previousAssignee = task.assignee ? task.assignee.toString() : null;

    // Members can only update status of tasks assigned to them
    if (req.user.role === "member") {
      if (task.assignee?.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "You can only update tasks assigned to you." });
      }
      // Members can only update status
      const { status } = req.body;
      task.status = status || task.status;
    } else {
      // Admin can update everything
      const { title, description, assignee, status, priority, dueDate } = req.body;
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignee !== undefined) task.assignee = assignee;
      if (status !== undefined) task.status = status;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
    }

    await task.save();
    await task.populate("assignee", "name email");
    await task.populate("createdBy", "name email");
    await task.populate("project", "name");

    // Notification if assignee changed
    if (
      req.body.assignee &&
      req.body.assignee !== previousAssignee &&
      req.body.assignee !== req.user._id.toString()
    ) {
      await Notification.create({
        recipient: req.body.assignee,
        message: `You were assigned a task: "${task.title}" in ${task.project.name}`,
        type: "task_assigned",
      });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }
    res.json({ message: "Task deleted." });
  } catch (error) {
    next(error);
  }
};
