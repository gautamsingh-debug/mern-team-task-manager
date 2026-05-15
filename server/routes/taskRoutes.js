const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../validators/validate");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const {
  createTask,
  getTasksByProject,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

router.use(auth); // All task routes require authentication

router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Task title is required"),
    body("project").notEmpty().withMessage("Project is required"),
  ],
  validate,
  createTask
);

router.get("/project/:projectId", getTasksByProject);
router.get("/:id", getTask);

router.put(
  "/:id",
  [body("status").optional().isIn(["todo", "in-progress", "done"]).withMessage("Invalid status")],
  validate,
  updateTask
);

router.delete("/:id", role("admin"), deleteTask);

module.exports = router;
