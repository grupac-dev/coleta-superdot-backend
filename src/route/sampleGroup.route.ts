import express from "express";
import * as SampleGroupController from "../controller/sampleGroup.controller";
import { requireActiveSession } from "../middleware/requireActiveSession.middleware";

const sampleGroupRouter = express.Router();

sampleGroupRouter.get("/findAll", requireActiveSession, SampleGroupController.findAllHandler);

export { sampleGroupRouter };
