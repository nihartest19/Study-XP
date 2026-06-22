import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";
import subjectsRouter from "./subjects";
import tasksRouter from "./tasks";
import badgesRouter from "./badges";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profileRouter);
router.use(subjectsRouter);
router.use(tasksRouter);
router.use(badgesRouter);
router.use(statsRouter);

export default router;
