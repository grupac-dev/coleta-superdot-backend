import { NextFunction, Request, Response } from "express";
import { get } from "lodash";
import { verifyJwt } from "../util/jwt";

export const deserializeParticipantJWT = (req: Request<{}, {}, {}, {}>, res: Response, next: NextFunction) => {
    const participantToken = get(req, "headers.authorization", "").replace(/^Bearer\s/, "");

    const { decoded } = verifyJwt(participantToken, "ACCESS_TOKEN_PUBLIC_KEY");

    if (decoded) {
        // Valid participant JWT
        res.locals.participantId = get(decoded, "participantId", "");
        return next();
    }

    next();
};
