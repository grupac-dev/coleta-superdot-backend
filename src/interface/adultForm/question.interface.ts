import { EQuestionType } from "../../util/consts";

export default interface IQuestion {
    _id?: string;
    sequence: number;
    statement: string;
    questionType: EQuestionType;
    options?: {
        value: string;
        points?: number;
    }[];
    notRequired?: boolean;
    constantPunctuation?: number;
    answer?: string | string[]; // Participant answer
    answerPoints?: number;
}
