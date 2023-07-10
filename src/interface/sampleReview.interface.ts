import { SampleStatus } from "../util/consts";
import IResearcher from "./researcher.interface";

export default interface ISampleReview {
    _id?: string;
    previous_status?: SampleStatus;
    next_status: SampleStatus;
    qtt_participants_authorized?: number;
    review_message: string;
    reviewer_id: IResearcher["_id"];
    createdAt?: Date;
    updatedAt?: Date;
}
