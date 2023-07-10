import mongoose from "mongoose";
import ISampleReview from "../interface/sampleReview.interface";
import ResearcherModel from "../model/researcher.model";

export async function createReview(sampleId: string, reviewData: ISampleReview) {
    const researcher = await ResearcherModel.findOne(
        { "research_samples._id": sampleId },
        { "research_samples._id": 1, "research_samples.status": 1, "research_samples.reviews": 1 }
    );

    if (!researcher) {
        throw new Error("Researcher has no samples.");
    }

    if (!researcher.research_samples) {
        throw new Error("This researcher hasn't samples.");
    }

    const sample = researcher.research_samples.find((sample) => sample._id?.toString() === sampleId);

    if (!sample) {
        throw new Error("Sample not found.");
    }

    reviewData.previous_status = sample.status;

    sample.status = reviewData.next_status;

    if (sample.status === "Autorizado" && !reviewData.qtt_participants_authorized) {
        throw new Error("Review with 'Autorizado' status require the quantity of participantes authorized.");
    }

    sample.qtt_participants_authorized = reviewData.qtt_participants_authorized;

    sample.reviews?.push(reviewData);

    await researcher.save();

    return reviewData;
}

interface SampleReviewWithReviewerName {
    review_details: ISampleReview;
    reviewer_full_name: string;
}

export async function findReviewsBySampleId(sampleId: string) {
    const researcher = await ResearcherModel.aggregate<SampleReviewWithReviewerName>()
        .unwind("$research_samples")
        .match({ "research_samples._id": new mongoose.Types.ObjectId(sampleId) })
        .unwind("$research_samples.reviews")
        .sort({ "research_samples.reviews.createdAt": -1 })
        .lookup({
            from: "researchers",
            localField: "research_samples.reviews.reviewer_id",
            foreignField: "_id",
            as: "reviewer",
        })
        .unwind("$reviewer")
        .project({
            review_details: "$research_samples.reviews",
            reviewer_full_name: "$reviewer.personal_data.full_name",
            _id: 0,
        })
        .exec();

    if (!researcher) {
        throw new Error("Sample hasn't reviews yet.");
    }

    return researcher;
}
