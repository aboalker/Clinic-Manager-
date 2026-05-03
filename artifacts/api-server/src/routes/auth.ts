import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { db, doctorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, signToken, JwtPayload } from "../middlewares/auth.js";
import { LoginBody } from "@workspace/api-zod";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { email, password } = parsed.data;

  const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.email, email)).limit(1);
  if (!doctor) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, doctor.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ doctorId: doctor.id, email: doctor.email, name: doctor.name });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ id: doctor.id, name: doctor.name, email: doctor.email });
});

router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

router.get("/me", requireAuth, (req: Request, res: Response) => {
  const doctor = (req as Request & { doctor: JwtPayload }).doctor;
  res.json({ id: doctor.doctorId, name: doctor.name, email: doctor.email });
});

export default router;
