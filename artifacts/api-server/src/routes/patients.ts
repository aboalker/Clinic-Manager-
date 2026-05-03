import { Router, Request, Response } from "express";
import { db, patientsTable, appointmentsTable } from "@workspace/db";
import { eq, ilike, or, desc, count, and } from "drizzle-orm";
import { requireAuth, JwtPayload } from "../middlewares/auth.js";
import { CreatePatientBody, UpdatePatientBody, ListPatientsQueryParams } from "@workspace/api-zod";

const router = Router();
router.use(requireAuth);

function doctorIdOf(req: Request): number {
  return (req as Request & { doctor: JwtPayload }).doctor.doctorId;
}

router.get("/", async (req: Request, res: Response) => {
  const parsed = ListPatientsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { search, limit = 50, offset = 0 } = parsed.data;
  const doctorId = doctorIdOf(req);

  const conditions = [eq(patientsTable.doctorId, doctorId)];
  if (search) {
    const s = `%${search}%`;
    conditions.push(
      or(
        ilike(patientsTable.name, s),
        ilike(patientsTable.phone, s),
        ilike(patientsTable.email, s)
      )!
    );
  }
  const where = and(...conditions);

  const [totalResult, patients] = await Promise.all([
    db.select({ count: count() }).from(patientsTable).where(where).then(r => r[0]?.count ?? 0),
    db.select().from(patientsTable).where(where).orderBy(desc(patientsTable.createdAt)).limit(limit).offset(offset),
  ]);

  res.json({ patients, total: Number(totalResult) });
});

router.post("/", async (req: Request, res: Response) => {
  const parsed = CreatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const doctorId = doctorIdOf(req);
  const [patient] = await db.insert(patientsTable).values({ ...parsed.data, doctorId }).returning();
  res.status(201).json(patient);
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const doctorId = doctorIdOf(req);

  const [patient] = await db.select().from(patientsTable)
    .where(and(eq(patientsTable.id, id), eq(patientsTable.doctorId, doctorId)))
    .limit(1);
  if (!patient) { res.status(404).json({ error: "Patient not found" }); return; }

  const appointments = await db.select().from(appointmentsTable)
    .where(eq(appointmentsTable.patientId, id))
    .orderBy(desc(appointmentsTable.date));

  res.json({ ...patient, appointments });
});

router.put("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = UpdatePatientBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }
  const doctorId = doctorIdOf(req);

  const [patient] = await db.update(patientsTable).set(parsed.data)
    .where(and(eq(patientsTable.id, id), eq(patientsTable.doctorId, doctorId)))
    .returning();
  if (!patient) { res.status(404).json({ error: "Patient not found" }); return; }

  res.json(patient);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const doctorId = doctorIdOf(req);

  const [deleted] = await db.delete(patientsTable)
    .where(and(eq(patientsTable.id, id), eq(patientsTable.doctorId, doctorId)))
    .returning();
  if (!deleted) { res.status(404).json({ error: "Patient not found" }); return; }

  res.json({ message: "Patient deleted" });
});

export default router;
