import express, { urlencoded } from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import dbConnection from "./db/db.js";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.routes.js";

import  { dirname } from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

await dbConnection();

const app = express();
const port = process.env.PORT || 8000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));

app.use("/api/auth", authRoute);


app.get("/", (req, res) => {
  res.send("Welcome To StudentCare Server");
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
