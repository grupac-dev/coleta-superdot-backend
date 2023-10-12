declare global {
    namespace Express {
        interface Locals {
            researcherId?: string;
            participantId?: string;
            secondSourceId?: string;
        }
    }
}
