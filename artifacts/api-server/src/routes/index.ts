import { Router, type IRouter } from "express";
import healthRouter from "./health";
import signalsRouter from "./signals";
import historyRouter from "./history";
import usersRouter from "./users";
import statsRouter from "./stats";
import telegramRouter from "./telegram";

const router: IRouter = Router();

router.use(healthRouter);
router.use(signalsRouter);
router.use(historyRouter);
router.use(usersRouter);
router.use(statsRouter);
router.use(telegramRouter);

export default router;
