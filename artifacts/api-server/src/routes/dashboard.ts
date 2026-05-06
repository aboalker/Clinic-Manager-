import { Router, Request, Response } from "express";
import { db, appointmentsTable, patientsTable } from "@workspace/db";
import { eq, count, gte, and, asc, desc, like, sql } from "drizzle-orm";
import { requireAuth, JwtPayload } from "../middlewares/auth.js";

const router = Router();
router.use(requireAuth);

function doctorIdOf(req: Request): number {
  return (req as Request & { doctor: JwtPayload }).doctor.doctorId;
}

const apptSelectShape = {
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
    doctorId: patientsTable.doctorId,
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
};

router.get("/summary", async (req: Request, res: Response) => {
  const today = new Date().toISOString().split("T")[0];
  const doctorId = doctorIdOf(req);

  const scopedAppt = (extra: any) =>
    db.select({ count: count() })
      .from(appointmentsTable)
      .innerJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
      .where(and(eq(patientsTable.doctorId, doctorId), extra));

  const [
    todayAppts,
    totalPatients,
    confirmedCount,
    pendingCount,
    cancelledCount,
    upcomingCount,
    patientsSeen,
  ] = await Promise.all([
    scopedAppt(like(appointmentsTable.date, today + "%")),
    db.select({ count: count() }).from(patientsTable).where(eq(patientsTable.doctorId, doctorId)),
    scopedAppt(eq(appointmentsTable.status, "confirmed")),
    scopedAppt(eq(appointmentsTable.status, "pending")),
    scopedAppt(eq(appointmentsTable.status, "cancelled")),
    scopedAppt(and(sql`LEFT(${appointmentsTable.date}, 10) >= ${today}`, eq(appointmentsTable.status, "confirmed"))!),
    scopedAppt(and(like(appointmentsTable.date, today + "%"), eq(appointmentsTable.status, "confirmed"))!),
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
  const doctorId = doctorIdOf(req);

  const appointments = await db
    .select(apptSelectShape)
    .from(appointmentsTable)
    .innerJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .where(and(
      eq(patientsTable.doctorId, doctorId),
      sql`LEFT(${appointmentsTable.date}, 10) >= ${today}`,
    ))
    .orderBy(asc(appointmentsTable.date), asc(appointmentsTable.time))
    .limit(limit);

  res.json(appointments);
});

router.get("/recent-patients", async (req: Request, res: Response) => {
  const limit = parseInt(String(req.query.limit ?? "5"));
  const doctorId = doctorIdOf(req);

  const patients = await db
    .select()
    .from(patientsTable)
    .where(eq(patientsTable.doctorId, doctorId))
    .orderBy(desc(patientsTable.createdAt))
    .limit(limit);

  res.json(patients);
});

export default router;
