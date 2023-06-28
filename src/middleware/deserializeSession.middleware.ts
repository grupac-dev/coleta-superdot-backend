import { NextFunction, Request, Response } from "express";
import { get } from "lodash";
import { verifyJwt } from "../util/jwt";
import { reIssueAccessToken } from "../service/session.service";

export const deserializeSession = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const accessToken = get(req, "headers.authorization", "").replace(
        /^Bearer\s/,
        ""
    );

    const refreshToken = get(req, "headers.x-refresh", "");

    if (!accessToken) {
        return next();
    }

    const { decoded, expired } = verifyJwt(
        accessToken,
        "ACCESS_TOKEN_PUBLIC_KEY"
    );

    if (decoded) {
        res.locals.current_session = decoded;
        return next();
    }

    if (expired && refreshToken) {
        const newAccessToken = await reIssueAccessToken(refreshToken as string);

        if (newAccessToken) {
            res.setHeader("x-access-token", newAccessToken);
        }

        const result = verifyJwt(
            newAccessToken as string,
            "ACCESS_TOKEN_PUBLIC_KEY"
        );

        res.locals.current_session = result.decoded;
        return next();
    }

    next();
};
