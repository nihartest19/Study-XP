import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import authRouter from "./routes/auth";
import router from "./routes";
import { logger } from "./lib/logger";
import { requireGuestId } from "./middleware/guest-id";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth routes don't need a guestId — they ARE how you get one
app.use("/api", authRouter);

// All other API routes require X-Guest-Id for per-user data scoping
app.use("/api", requireGuestId, router);

export default app;
