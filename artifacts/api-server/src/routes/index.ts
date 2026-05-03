import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import patientsRouter from "./patients.js";
import appointmentsRouter from "./appointments.js";
import dashboardRouter from "./dashboard.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/patients", patientsRouter);
router.use("/appointments", appointmentsRouter);
router.use("/dashboard", dashboardRouter);

export default router;
