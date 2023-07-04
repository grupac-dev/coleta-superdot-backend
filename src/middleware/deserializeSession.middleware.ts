import { NextFunction, Request, Response } from "express";
import { get } from "lodash";
import { verifyJwt } from "../util/jwt";
import * as SessionService from "../service/session.service";

export const deserializeSession = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = get(req, "headers.authorization", "").replace(/^Bearer\s/, "");

    const refreshToken = get(req, "headers.x-refresh", "");

    if (!refreshToken) {
        return next();
    }

    const { decoded, expired } = verifyJwt(accessToken, "ACCESS_TOKEN_PUBLIC_KEY");

    if (decoded) {
        try {
            const session = await SessionService.findSessionById(get(decoded, "session") || "");
            res.locals.session = session;
        } catch (error) {
            console.error(error);
        }
        return next();
    }

    if (expired && refreshToken) {
        const newAccessToken = await SessionService.reIssueAccessToken(refreshToken as string);

        if (newAccessToken) {
            res.setHeader("x-access-token", newAccessToken);
        }

        const result = verifyJwt(newAccessToken as string, "ACCESS_TOKEN_PUBLIC_KEY");

        res.locals.session = result.decoded;
        return next();
    }

    next();
};
