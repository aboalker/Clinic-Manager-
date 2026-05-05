import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();
app.set("trust proxy", 1);
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

if (process.env["NODE_ENV"] === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const candidates = [
    path.resolve(__dirname, "../../clinic-app/dist/public"),
    path.resolve(process.cwd(), "artifacts/clinic-app/dist/public"),
    path.resolve(__dirname, "../../clinic-app/dist"),
    path.resolve(process.cwd(), "artifacts/clinic-app/dist"),
  ];
  const clientDist = candidates.find((p) => fs.existsSync(p));

  if (clientDist) {
    logger.info({ clientDist }, "Serving static frontend");
    app.use(express.static(clientDist));
    app.get(/^(?!\/api\/).*/, (_req: Request, res: Response) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  } else {
    logger.warn({ candidates }, "Frontend dist not found; API only");
  }
}

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
});
export default app;
