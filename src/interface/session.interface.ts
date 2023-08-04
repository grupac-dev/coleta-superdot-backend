import Researcher from "./researcher.interface";

export default interface ISession {
    _id?: string;
    researcherId: Researcher["_id"];
    valid: boolean;
    userAgent?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
