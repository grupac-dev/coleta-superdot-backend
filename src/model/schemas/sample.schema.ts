import { Schema } from "mongoose";
import ISample from "../../interface/sample.interface";
import { sampleReviewSchema } from "./sampleReview.schema";
import { INSTITUITION_TYPE_ARRAY, SAMPLE_STATUS_ARRAY } from "../../util/consts";
import { participantSchema } from "./participant.schema";

export const sampleSchema = new Schema<ISample>(
    {
        researchTitle: {
            type: String,
            required: [true, "Research title is required!"],
        },
        sampleTitle: {
            type: String,
            required: [true, "Sample title is required!"],
        },
        sampleGroup: {
            type: String,
            required: [true, "Sample group is required!"],
        },
        qttParticipantsRequested: {
            type: Number,
            required: [true, "Is necessary to inform the sample partcipants quantity requested."],
        },
        qttParticipantsAuthorized: Number,
        qttParticipantsRegistered: {
            type: Number,
            default: 0,
        },
        researchCep: {
            cepCode: {
                type: String,
                required: [true, "CEP code is required."],
            },
            researchDocument: {
                type: String,
                required: [true, "Research document is required."],
            },
            tcleDocument: {
                type: String,
                required: [true, "TCLE document is required."],
            },
            taleDocument: String,
        },
        status: {
            type: String,
            enum: SAMPLE_STATUS_ARRAY,
            required: [true, "A status is required."],
        },
        countryRegion: {
            type: String,
            required: [true, "Sample country region is required."],
        },
        countryState: {
            type: String,
            required: [true, "Sample country state is required."],
        },
        countryCity: {
            type: String,
            required: [true, "Sample country city is required."],
        },
        instituition: {
            name: {
                type: String,
                required: [true, "Sample instituition name is required."],
            },
            instType: {
                type: String,
                enum: INSTITUITION_TYPE_ARRAY,
                required: [true, "Sample instituition type is required."],
            },
        },
        reviews: [sampleReviewSchema],
        participants: [participantSchema],
    },
    {
        timestamps: true,
    }
);
