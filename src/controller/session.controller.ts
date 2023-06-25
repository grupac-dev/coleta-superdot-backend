import { Request, Response } from "express";
import { validatePassword } from "../service/researcher.service";
import { CreateSessionDTO } from "../dto/createSession.dto";
import {
    createSession,
    issueAccessToken,
    issueRefreshToken,
} from "../service/session.service";
import { Types } from "mongoose";
import { get } from "lodash";

export async function createSessionHandler(
    req: Request<{}, {}, CreateSessionDTO["body"], {}>,
    res: Response
) {
    const researcher = await validatePassword(req.body);

    if (!researcher) {
        return res.status(401).send("Invalid email or password");
    }

    const session = await createSession(
        new Types.ObjectId(get(researcher, "_id")),
        req.get("user-agent") || ""
    );

    const accessToken = issueAccessToken(session);
    const refreshToken = issueRefreshToken(session);

    res.status(201).json({ accessToken, refreshToken });
}
