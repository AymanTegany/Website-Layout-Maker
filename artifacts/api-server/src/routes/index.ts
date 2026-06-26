import { Router, type IRouter } from "express";
import healthRouter from "./health";
import roomsRouter from "./rooms";
import analyticsRouter from "./analytics";
import hallsRouter from "./halls";

const router: IRouter = Router();

router.use(healthRouter);
router.use(roomsRouter);
router.use(analyticsRouter);
router.use(hallsRouter);

export default router;
