import { NextFunction, Request, Response } from "express";

export const requireActiveSession = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const sessionData = res.locals.current_session;

    if (!sessionData) {
        return res.status(403).send("This resource require a valid session.");
    }

    next();
};
