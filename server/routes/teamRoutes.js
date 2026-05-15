const router = require("express").Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const { getTeamMembers } = require("../controllers/teamController");

router.use(auth);

// GET /api/team — Admin only
router.get("/", role("admin"), getTeamMembers);

module.exports = router;
