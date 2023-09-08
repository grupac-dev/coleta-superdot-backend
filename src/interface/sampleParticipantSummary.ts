import { TParticipantFormProgress } from "../util/consts";

export interface ISampleParticipantSummay {
    sampleId: string;
    participantId: string;
    fullName: string;
    progress: TParticipantFormProgress;
    qttSecondSources: number;
    startDate: Date;
    endDate?: Date;
    giftdnessIndicators?: boolean;
}
