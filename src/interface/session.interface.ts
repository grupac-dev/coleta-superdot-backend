import { Types } from "mongoose";
import Researcher from "./researcher.interface";

export default interface ISession {
    _id?: string;
    researcher_id: Researcher["_id"];
    valid: boolean;
    userAgent?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
