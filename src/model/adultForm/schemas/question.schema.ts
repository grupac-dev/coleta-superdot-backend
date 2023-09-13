import { Schema } from "mongoose";
import IQuestion from "../../../interface/adultForm/question.interface";
import { EQuestionType } from "../../../util/consts";

export const questionSchema = new Schema<IQuestion>({
    sequence: {
        type: Number,
        required: [true, "Question sequence is required!"],
    },
    statement: {
        type: String,
        required: [true, "Question statement is required!"],
    },
    questionType: {
        type: Number,
        enum: EQuestionType,
        required: [true, "Question type is required!"],
    },
    options: [String],
    answer: Schema.Types.Mixed, // String | String[]
});
