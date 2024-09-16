import { Router } from "express";
import {
  createEntry,
  getEntryByMonth,
  getEntryByUserId,
} from "../controllers/entrys.controller.js";

const router = Router();

router.route("/createEntry").post(createEntry);

router.route("/getEntryByUserId/userId=:userId").get(getEntryByUserId);

router
  .route("/getEntryByMonth/userId=:userId/month=:month/year=:year")
  .get(getEntryByMonth);

export default router;
