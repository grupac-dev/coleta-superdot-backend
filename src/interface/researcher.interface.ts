import { Types } from "mongoose";

export default interface IResearcher {
    _id?: Types.ObjectId;
    personal_data: {
        full_name: string;
        phone: string;
        profile_photo?: string;
        birth_date: Date;
        country_state: string;
    };
    email: string;
    password_hash?: string;
    role: string;
    instituition: string;
    createdAt?: Date;
    updatedAt?: Date;
}
