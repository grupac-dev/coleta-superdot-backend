import express, { NextFunction, Request, Response } from "express";
import { deserializeSession } from "./middleware/deserializeSession.middleware";
import createHttpError, { isHttpError } from "http-errors";
import { researcherRouter } from "./route/reseacher.route";
import { sessionRouter } from "./route/session.route";

const app = express();

app.use(express.json());

app.use(deserializeSession);

app.use("/api/researcher", researcherRouter);

app.use("/api/session", sessionRouter);

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
