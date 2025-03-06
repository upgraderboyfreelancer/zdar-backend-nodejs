import express, { type NextFunction, type Request, type Response } from "express";
import morgan from "morgan"
import helmet from "helmet"
import cookieParser from "cookie-parser";
import router from "./routes";
import cors from "cors";
import "express-async-errors";
import type { CustomError } from "./types/types";
import envLoad from "./config/envLoader";
import createHttpError from 'http-errors';
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { webhook } from "./controllers/paymentController";
import bodyParser from "body-parser";


// Express Server
const app = express();

// Load Env
envLoad();


// Server Middlewares
app.use(cookieParser());
// Stripe Webhook Route (Must be Above JSON Middleware)
app.post("/stripe", bodyParser.raw({ type: 'application/json' }), webhook);
app.use(cors({
  origin: [process.env.FRONTEND_URL!],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan("dev"));
app.use(helmet())


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Routes
app.use("/uploads", express.static(path.join(__dirname, '../uploads')))
app.use("/pdf-uploads", express.static(path.join(__dirname, '../pdf-uploads')))
app.use("/api", router)
// Global Error Handler
app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.log(err)
  if (createHttpError.isHttpError(err)) {

    res.status(err.status).json({
      success: false,
      message: err.message,
      data: null,
    });
    return;
  }
  // console.log("Unhandled error:", err, typeof err, err instanceof createHttpError);
  // Fallback for unhandled errors
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    status,
    message: process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
  });
  return;
});



export default app;