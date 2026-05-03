import { Router, Request, Response } from "express";
import { db, patientsTable } from "@workspace/db";
import { eq, ilike, or, desc, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";
import { CreatePatientBody, UpdatePatientBody, ListPatientsQueryParams } from "@workspace/api-zod";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: Request, res: Response) => {
  const parsed = ListPatientsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { search, limit = 50, offset = 0 } = parsed.data;

  let query = db.select().from(patientsTable);

  if (search) {
    query = query.where(
      or(
        ilike(patientsTable.name, `%${search}%`),
        ilike(patientsTable.phone, `%${search}%`),
        ilike(patientsTable.email, `%${search}%`)
      )
    ) as typeof query;
  }

  const [totalResult, patients] = await Promise.all([
    db.select({ count: count() }).from(patientsTable).then(r => r[0]?.count ?? 0),
    query.orderBy(desc(patientsTable.createdAt)).limit(limit).offset(offset),
  ]);

  res.json({ patients, total: Number(totalResult) });
});

router.post("/", async (req: Request, res: Response) => {
  const parsed = CreatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const [patient] = await db.insert(patientsTable).values(parsed.data).returning();
  res.status(201).json(patient);
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { appointmentsTable } = await import("@workspace/db");
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, id)).limit(1);
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

  const [patient] = await db.update(patientsTable).set(parsed.data).where(eq(patientsTable.id, id)).returning();
  if (!patient) { res.status(404).json({ error: "Patient not found" }); return; }

  res.json(patient);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db.delete(patientsTable).where(eq(patientsTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Patient not found" }); return; }

  res.json({ message: "Patient deleted" });
});

export default router;
