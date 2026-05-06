import { Router, Request, Response } from "express";
import { db, appointmentsTable, patientsTable } from "@workspace/db";
import { eq, desc, asc, and, gte, lte, like, sql } from "drizzle-orm";
import { requireAuth, JwtPayload } from "../middlewares/auth.js";
import {
  CreateAppointmentBody,
  UpdateAppointmentBody,
  ListAppointmentsQueryParams,
} from "@workspace/api-zod";

const router = Router();
router.use(requireAuth);

function doctorIdOf(req: Request): number {
  return (req as Request & { doctor: JwtPayload }).doctor.doctorId;
}

function toDateStr(d: Date | string | undefined | null): string | undefined {
  if (!d) return undefined;
  if (d instanceof Date) return d.toISOString().split("T")[0];
  const s = String(d);
  return s.length > 10 ? s.split("T")[0] : s;
}

const apptSelect = {
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

async function getAppointmentForDoctor(id: number, doctorId: number) {
  const [appt] = await db.select(apptSelect)
    .from(appointmentsTable)
    .innerJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .where(and(eq(appointmentsTable.id, id), eq(patientsTable.doctorId, doctorId)))
    .limit(1);
  return appt;
}

async function patientBelongsToDoctor(patientId: number, doctorId: number): Promise<boolean> {
  const [p] = await db.select({ id: patientsTable.id }).from(patientsTable)
    .where(and(eq(patientsTable.id, patientId), eq(patientsTable.doctorId, doctorId)))
    .limit(1);
  return !!p;
}

router.get("/", async (req: Request, res: Response) => {
  const parsed = ListAppointmentsQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: "Invalid query params" }); return; }
  const doctorId = doctorIdOf(req);

  const { date, patientId, status, startDate, endDate } = parsed.data;
  const conditions = [eq(patientsTable.doctorId, doctorId)];

  const dateStr = toDateStr(date);
  const startDateStr = toDateStr(startDate);
  const endDateStr = toDateStr(endDate);

  if (dateStr) conditions.push(like(appointmentsTable.date, dateStr + "%"));
  if (patientId) conditions.push(eq(appointmentsTable.patientId, patientId));
  if (status) conditions.push(eq(appointmentsTable.status, status as "confirmed" | "pending" | "cancelled"));
  if (startDateStr) conditions.push(sql`LEFT(${appointmentsTable.date}, 10) >= ${startDateStr}`);
  if (endDateStr) conditions.push(sql`LEFT(${appointmentsTable.date}, 10) <= ${endDateStr}`);

  const appointments = await db.select(apptSelect)
    .from(appointmentsTable)
    .innerJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .where(and(...conditions))
    .orderBy(asc(appointmentsTable.date), asc(appointmentsTable.time));

  res.json(appointments);
});

router.post("/", async (req: Request, res: Response) => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }
  const doctorId = doctorIdOf(req);

  if (!(await patientBelongsToDoctor(parsed.data.patientId, doctorId))) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }

  const values = { ...parsed.data, date: toDateStr(parsed.data.date)! };
  const [created] = await db.insert(appointmentsTable).values(values).returning();

  if (created.status === "confirmed") {
    await db.update(patientsTable)
      .set({ lastVisitDate: new Date() })
      .where(and(eq(patientsTable.id, created.patientId), eq(patientsTable.doctorId, doctorId)));
  }

  const appt = await getAppointmentForDoctor(created.id, doctorId);
  res.status(201).json(appt);
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const doctorId = doctorIdOf(req);

  const appt = await getAppointmentForDoctor(id, doctorId);
  if (!appt) { res.status(404).json({ error: "Appointment not found" }); return; }
  res.json(appt);
});

router.put("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = UpdateAppointmentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }
  const doctorId = doctorIdOf(req);

  const existing = await getAppointmentForDoctor(id, doctorId);
  if (!existing) { res.status(404).json({ error: "Appointment not found" }); return; }

  if (parsed.data.patientId && !(await patientBelongsToDoctor(parsed.data.patientId, doctorId))) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }

  const updateData = { ...parsed.data };
  if (updateData.date !== undefined) {
    (updateData as any).date = toDateStr(updateData.date);
  }

  await db.update(appointmentsTable).set(updateData).where(eq(appointmentsTable.id, id));

  if (parsed.data.status === "confirmed") {
    await db.update(patientsTable)
      .set({ lastVisitDate: new Date() })
      .where(and(eq(patientsTable.id, existing.patientId), eq(patientsTable.doctorId, doctorId)));
  }

  const appt = await getAppointmentForDoctor(id, doctorId);
  res.json(appt);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const doctorId = doctorIdOf(req);

  const existing = await getAppointmentForDoctor(id, doctorId);
  if (!existing) { res.status(404).json({ error: "Appointment not found" }); return; }

  await db.delete(appointmentsTable).where(eq(appointmentsTable.id, id));
  res.json({ message: "Appointment deleted" });
});

export default router;
