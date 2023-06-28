import { Schema, Types, model } from "mongoose";
import ISession from "../interface/session.interface";

const sessionSchema = new Schema<ISession>(
    {
        researcher_id: {
            type: Types.ObjectId,
            ref: "Researcher",
        },
        valid: {
            type: Boolean,
            default: true,
        },
        userAgent: String,
    },
    {
        timestamps: true,
    }
);

const SessionModel = model<ISession>("Session", sessionSchema);

export default SessionModel;
