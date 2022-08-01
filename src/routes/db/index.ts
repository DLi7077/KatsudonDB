import express from "express";
import {
  addMessage,
  addUser,
  findUsers,
  findMessages,
  getUserStatistics,
} from "./resources";

const router = express.Router();

router.get("/all-users", findUsers);
router.get("/all-messages", findMessages);
router.get("/user-stats", getUserStatistics);

router.post("/add-user", addUser);
router.post("/add-message", addMessage);

export default router;
