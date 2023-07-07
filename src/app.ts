import express, { NextFunction, Request, Response } from "express";
import { deserializeSession } from "./middleware/deserializeSession.middleware";
import createHttpError, { isHttpError } from "http-errors";
import { researcherRouter } from "./route/reseacher.route";
import cors from "cors";
import morgan from "morgan";
import { authRouter } from "./route/auth.route";
import { sampleGroupRouter } from "./route/sampleGroup.route";
import { sampleRouter } from "./route/sample.route";

const app = express();

app.use(express.json());

app.use(cors());

app.use(morgan("dev"));

app.use(deserializeSession);

app.use("/api/auth", authRouter);

app.use("/api/researcher", researcherRouter);

app.use("/api/sampleGroup", sampleGroupRouter);

app.use("/api/sample", sampleRouter);

app.use((req, res, next) => {
    next(createHttpError(404, "Endpoint not found"));
});

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(error);
    let errorMessage = "unknown error";
    let statusCode = 500;
    if (isHttpError(error)) {
        errorMessage = error.message;
        statusCode = error.status;
    }

    res.status(statusCode).json({ error: errorMessage });
});

export default app;
