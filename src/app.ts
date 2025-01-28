import express, { type NextFunction, type Request, type Response } from "express";
import morgan from "morgan"
import helmet from "helmet"
import cookieParser from "cookie-parser";
import router from "./routes";
import cors from "cors";
import "express-async-errors";
import createError from "http-errors"
import type { CustomError } from "./types/types";
import envLoad from "./config/envLoader";
import createHttpError from "http-errors";

const app = express();

envLoad();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan("dev"));
app.use(helmet())
app.use(cookieParser());


app.get("/", (req, res)=>{
    res.send({ message: 'Welcome To Upgrader Boy!' });

  })
  app.get("/protected", async (req, res)=>{
  console.log(req.headers.cookie);
  console.log(JSON.stringify(req.cookies, null, 2))
  const isAuthenticated = true;
  if(!isAuthenticated)
    throw createError(403, "You are not Authorized!")
  res.json({message: "You are authorized!"})
})
app.get("/error", async (req, res, next)=>{
  next(createError(400, "Something went wrong!"))
})
// app.get("/*", (req, res, next)=>{
//   next(createError(404, "This page does not exist!"))
// })
app.use("/api", router)

app.use((err: CustomError, req: Request, res: Response, next: NextFunction)=>{
  console.log("1234", err.message)
  if(err instanceof createHttpError){
    res.status(err.status).json({
      success: false,
      message: err.message,
      data: null
    })
  }
  const status = err.status || 500;
  res.status(status).json({
    status,
    message: process.env.NODE_ENV === "production" ? 'Internal Server Error' : err.message
  })

})
export default app;