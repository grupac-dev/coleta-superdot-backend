import Researcher from "./researcher.interface";

export interface ISession {
    _id?: string;
    researcherId: Researcher["_id"];
    valid: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
