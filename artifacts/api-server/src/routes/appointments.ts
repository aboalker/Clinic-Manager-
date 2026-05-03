import { Router, Request, Response } from "express";
import { db, appointmentsTable, patientsTable } from "@workspace/db";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";
import {
  CreateAppointmentBody,
  UpdateAppointmentBody,
  ListAppointmentsQueryParams,
} from "@workspace/api-zod";

const router = Router();
router.use(requireAuth);

async function getAppointmentWithPatient(id: number) {
  const [appt] = await db
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
    .where(eq(appointmentsTable.id, id))
    .limit(1);
  return appt;
}

router.get("/", async (req: Request, res: Response) => {
  const parsed = ListAppointmentsQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: "Invalid query params" }); return; }

  const { date, patientId, status, startDate, endDate } = parsed.data;
  const conditions = [];
  if (date) conditions.push(eq(appointmentsTable.date, date));
  if (patientId) conditions.push(eq(appointmentsTable.patientId, patientId));
  if (status) conditions.push(eq(appointmentsTable.status, status as "confirmed" | "pending" | "cancelled"));
  if (startDate) conditions.push(gte(appointmentsTable.date, startDate));
  if (endDate) conditions.push(lte(appointmentsTable.date, endDate));

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
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(appointmentsTable.date, appointmentsTable.time);

  res.json(appointments);
});

router.post("/", async (req: Request, res: Response) => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }

  const [created] = await db.insert(appointmentsTable).values(parsed.data).returning();

  // Update patient lastVisitDate if appointment is confirmed
  if (created.status === "confirmed") {
    await db.update(patientsTable)
      .set({ lastVisitDate: new Date() })
      .where(eq(patientsTable.id, created.patientId));
  }

  const appt = await getAppointmentWithPatient(created.id);
  res.status(201).json(appt);
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const appt = await getAppointmentWithPatient(id);
  if (!appt) { res.status(404).json({ error: "Appointment not found" }); return; }
  res.json(appt);
});

router.put("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = UpdateAppointmentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }

  const [updated] = await db
    .update(appointmentsTable)
    .set(parsed.data)
    .where(eq(appointmentsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Appointment not found" }); return; }

  const appt = await getAppointmentWithPatient(id);
  res.json(appt);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db.delete(appointmentsTable).where(eq(appointmentsTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Appointment not found" }); return; }
  res.json({ message: "Appointment deleted" });
});

export default router;
