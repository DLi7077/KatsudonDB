import express from "express";
import { addMessage, addUser, findUsers } from "./resources";

const router = express.Router();

router.get("/find-users", findUsers);
router.post("/add-user", addUser);
router.post("/add-message", addMessage);

export default router;
