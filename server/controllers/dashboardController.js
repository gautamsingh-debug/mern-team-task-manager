const Task = require("../models/Task");
const Project = require("../models/Project");

// GET /api/dashboard/stats
exports.getStats = async (req, res, next) => {
  try {
    let projectFilter;
    let taskFilter = {};

    if (req.user.role === "admin") {
      projectFilter = {};
    } else {
      projectFilter = { members: req.user._id };
      taskFilter.assignee = req.user._id;
    }

    const projects = await Project.find(projectFilter).select("_id");
    const projectIds = projects.map((p) => p._id);

    if (req.user.role === "admin") {
      taskFilter.project = { $in: projectIds };
    } else {
      // Members see tasks assigned to them, OR tasks in projects they are a member of if we want,
      // but user said "Dashboard should only show personal task data"
      // So taskFilter is just assignee: req.user._id
    }

    const [totalTasks, completedTasks, overdueTasks, todoTasks, inProgressTasks] =
      await Promise.all([
        Task.countDocuments(taskFilter),
        Task.countDocuments({ ...taskFilter, status: "done" }),
        Task.countDocuments({
          ...taskFilter,
          status: { $ne: "done" },
          dueDate: { $lt: new Date(), $ne: null },
        }),
        Task.countDocuments({ ...taskFilter, status: "todo" }),
        Task.countDocuments({ ...taskFilter, status: "in-progress" }),
      ]);

    const recentTasks = await Task.find(taskFilter)
      .populate("assignee", "name email")
      .populate("project", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    const totalProjects = projectIds.length;

    // Generate chart data for the last 7 days
    const chartData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.setHours(0,0,0,0));
      const endOfDay = new Date(d.setHours(23,59,59,999));
      
      const dayTasks = await Task.countDocuments({
        ...taskFilter,
        createdAt: { $lte: endOfDay }
      });
      
      const dayCompleted = await Task.countDocuments({
        ...taskFilter,
        status: "done",
        updatedAt: { $gte: startOfDay, $lte: endOfDay }
      });
      
      chartData.push({
        name: startOfDay.toLocaleDateString('en-US', { weekday: 'short' }),
        tasks: dayTasks,
        completed: dayCompleted
      });
    }

    res.json({
      totalTasks,
      completedTasks,
      overdueTasks,
      todoTasks,
      inProgressTasks,
      totalProjects,
      recentTasks,
      chartData,
    });
  } catch (error) {
    next(error);
  }
};
