import Researcher from "./researcher.interface";

export default interface ISession {
    researcher_id: Researcher["_id"];
    valid: boolean;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
}
