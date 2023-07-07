import { NextFunction, Request, Response } from "express";
import { get } from "lodash";

export const requireActiveSession = (req: Request<{}, {}, {}, {}>, res: Response, next: NextFunction) => {
    const sessionValid = get(res.locals, "session.valid");

    if (!sessionValid) {
        return res.status(403).send("This resource require a valid session.");
    }

    next();
};
