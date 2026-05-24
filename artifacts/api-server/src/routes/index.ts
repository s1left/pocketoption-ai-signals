import { Router, type IRouter } from "express";
import healthRouter from "./health";
import signalsRouter from "./signals";
import historyRouter from "./history";
import usersRouter from "./users";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(signalsRouter);
router.use(historyRouter);
router.use(usersRouter);
router.use(statsRouter);

export default router;
