import { Schema, Types } from "mongoose";
import ISampleReview from "../../interface/sampleReview.interface";
import { SAMPLE_STATUS_ARRAY } from "../../util/consts";

export const sampleReviewSchema = new Schema<ISampleReview>(
    {
        previous_status: {
            type: String,
            enum: SAMPLE_STATUS_ARRAY,
            required: [true, "Previous state is required."],
        },
        next_status: {
            type: String,
            enum: SAMPLE_STATUS_ARRAY,
            required: [true, "Next status is required!"],
        },
        qtt_participants_authorized: Number,
        review_message: {
            type: String,
            required: [true, "The review message is required."],
        },
        reviewer_id: {
            type: Types.ObjectId,
            ref: "Research",
        },
    },
    {
        timestamps: true,
    }
);
