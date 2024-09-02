import { Router } from "express";
import {
  createEntry,
  getEntryByUserId,
} from "../controllers/entrys.controller.js";

const router = Router();

router.route("/createEntry").post(createEntry);

router.route("/getEntryByUserId/userId=:userId").get(getEntryByUserId);

export default router;
