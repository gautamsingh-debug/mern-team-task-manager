const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../validators/validate");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require("../controllers/projectController");

router.use(auth); // All project routes require authentication

router.post(
  "/",
  role("admin"),
  [body("name").trim().notEmpty().withMessage("Project name is required")],
  validate,
  createProject
);

router.get("/", getProjects);
router.get("/:id", getProject);

router.put(
  "/:id",
  role("admin"),
  [body("name").trim().notEmpty().withMessage("Project name is required")],
  validate,
  updateProject
);

router.delete("/:id", role("admin"), deleteProject);

router.post(
  "/:id/members",
  role("admin"),
  [body("userId").notEmpty().withMessage("User ID is required")],
  validate,
  addMember
);

router.delete("/:id/members/:userId", role("admin"), removeMember);

module.exports = router;
