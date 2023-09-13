import { FilterQuery, Types, UpdateQuery } from "mongoose";
import SessionModel from "../model/session.model";
import { ISession } from "../interface/session.interface";
import { signJwt, verifyJwt } from "../util/jwt";
import { get } from "lodash";
import { findResearcher } from "./researcher.service";
import env from "../util/validateEnv";

export async function createSession(researcherId: Types.ObjectId, userAgent: string): Promise<ISession> {
    const session = await SessionModel.create({
        researcherId,
        userAgent,
    });

    return session.toJSON();
}

export async function findSessionById(id: string): Promise<ISession | null> {
    if (!Types.ObjectId.isValid(id)) {
        throw Error("Invalid Session id!");
    }
    return SessionModel.findById(id).lean().exec();
}

export async function updateSession(query: FilterQuery<ISession>, update: UpdateQuery<ISession>) {
    return SessionModel.updateOne(query, update).exec();
}

export function issueAccessToken(session: ISession, role?: string) {
    const accessToken = signJwt(
        {
            session: session._id,
            userRole: role,
        },
        "ACCESS_TOKEN_PRIVATE_KEY",
        {
            expiresIn: env.ACCESS_TOKEN_TTL,
        }
    );

    return accessToken;
}

export function issueRefreshToken(session: ISession) {
    const refreshToken = signJwt(
        {
            session: session._id,
        },
        "REFRESH_TOKEN_PRIVATE_KEY",
        {
            expiresIn: env.REFRESH_TOKEN_TTL,
        }
    );

    return refreshToken;
}

export async function reIssueAccessToken(refreshToken: string) {
    const { decoded } = verifyJwt(refreshToken, "REFRESH_TOKEN_PUBLIC_KEY");

    if (!decoded || !get(decoded, "session")) return false;

    const session = await SessionModel.findById(get(decoded, "session"));

    if (!session || !session.valid) return false;

    const researcher = await findResearcher({ _id: session.researcherId });

    if (!researcher) return false;

    const accessToken = issueAccessToken(session);

    return accessToken;
}
