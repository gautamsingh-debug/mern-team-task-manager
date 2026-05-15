const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../validators/validate");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const {
  signup,
  login,
  getMe,
  getUsers,
  updateProfile,
  changePassword,
  deleteUser,
  updateUserRole,
} = require("../controllers/authController");

router.post(
  "/signup",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  signup
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

router.get("/me", auth, getMe);
router.get("/users", auth, getUsers);

// Profile & settings
router.put("/profile", auth, updateProfile);
router.put(
  "/change-password",
  auth,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  validate,
  changePassword
);

// Admin-only user management
router.delete("/users/:id", auth, role("admin"), deleteUser);
router.put("/users/:id/role", auth, role("admin"), updateUserRole);

module.exports = router;
