import { InstituitionType, SampleStatus } from "../util/consts";
import ISampleReview from "./sampleReview.interface";

export default interface ISample {
    _id?: string;
    research_title: string;
    sample_title: string;
    sample_group: string;
    qtt_participants_requested: number;
    qtt_participants_authorized?: number;
    research_cep: {
        cep_code: string;
        research_document?: string;
        tcle_document?: string;
        tale_document?: string;
    };
    status?: SampleStatus;
    country_region: string;
    country_state: string;
    country_city: string;
    instituition: {
        name: string;
        instType: InstituitionType;
    };
    reviews?: [ISampleReview];
    participants?: [];
    createdAt?: Date;
    updatedAt?: Date;
}
