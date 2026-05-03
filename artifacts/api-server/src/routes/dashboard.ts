import { Router, Request, Response } from "express";
import { db, appointmentsTable, patientsTable } from "@workspace/db";
import { eq, count, gte, lte, and, asc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/summary", async (_req: Request, res: Response) => {
  const today = new Date().toISOString().split("T")[0];

  const [
    todayAppts,
    totalPatients,
    confirmedCount,
    pendingCount,
    cancelledCount,
    upcomingCount,
    patientsSeen,
  ] = await Promise.all([
    db.select({ count: count() }).from(appointmentsTable).where(eq(appointmentsTable.date, today)),
    db.select({ count: count() }).from(patientsTable),
    db.select({ count: count() }).from(appointmentsTable).where(eq(appointmentsTable.status, "confirmed")),
    db.select({ count: count() }).from(appointmentsTable).where(eq(appointmentsTable.status, "pending")),
    db.select({ count: count() }).from(appointmentsTable).where(eq(appointmentsTable.status, "cancelled")),
    db.select({ count: count() }).from(appointmentsTable).where(
      and(gte(appointmentsTable.date, today), eq(appointmentsTable.status, "confirmed"))
    ),
    db.select({ count: count() }).from(appointmentsTable).where(
      and(eq(appointmentsTable.date, today), eq(appointmentsTable.status, "confirmed"))
    ),
  ]);

  res.json({
    todayAppointmentsCount: Number(todayAppts[0]?.count ?? 0),
    patientsSeen: Number(patientsSeen[0]?.count ?? 0),
    totalPatients: Number(totalPatients[0]?.count ?? 0),
    upcomingCount: Number(upcomingCount[0]?.count ?? 0),
    confirmedCount: Number(confirmedCount[0]?.count ?? 0),
    pendingCount: Number(pendingCount[0]?.count ?? 0),
    cancelledCount: Number(cancelledCount[0]?.count ?? 0),
  });
});

router.get("/upcoming", async (req: Request, res: Response) => {
  const limit = parseInt(String(req.query.limit ?? "5"));
  const today = new Date().toISOString().split("T")[0];

  const appointments = await db
    .select({
      id: appointmentsTable.id,
      patientId: appointmentsTable.patientId,
      date: appointmentsTable.date,
      time: appointmentsTable.time,
      reason: appointmentsTable.reason,
      status: appointmentsTable.status,
      notes: appointmentsTable.notes,
      createdAt: appointmentsTable.createdAt,
      patient: {
        id: patientsTable.id,
        name: patientsTable.name,
        age: patientsTable.age,
        email: patientsTable.email,
        phone: patientsTable.phone,
        address: patientsTable.address,
        bloodType: patientsTable.bloodType,
        notes: patientsTable.notes,
        lastVisitDate: patientsTable.lastVisitDate,
        createdAt: patientsTable.createdAt,
      },
    })
    .from(appointmentsTable)
    .innerJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .where(
      and(
        gte(appointmentsTable.date, today),
        lte(appointmentsTable.status, "confirmed")
      )
    )
    .orderBy(asc(appointmentsTable.date), asc(appointmentsTable.time))
    .limit(limit);

  res.json(appointments);
});

router.get("/recent-patients", async (req: Request, res: Response) => {
  const limit = parseInt(String(req.query.limit ?? "5"));

  const patients = await db
    .select()
    .from(patientsTable)
    .orderBy(patientsTable.createdAt)
    .limit(limit);

  res.json(patients);
});

export default router;
