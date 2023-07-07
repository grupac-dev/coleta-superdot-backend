import { Schema } from "mongoose";
import ISample from "../../interface/sample.interface";

export const sampleSchema = new Schema<ISample>(
    {
        research_title: {
            type: String,
            required: [true, "Research title is required!"],
        },
        sample_title: {
            type: String,
            required: [true, "Sample title is required!"],
        },
        sample_group: {
            type: String,
            required: [true, "Sample group is required!"],
        },
        qtt_participants_requested: {
            type: Number,
            required: [true, "Is necessary to inform the sample partcipants quantity requested."],
        },
        qtt_participantes_authorized: Number,
        research_cep: {
            cep_code: {
                type: String,
                required: [true, "CEP code is required."],
            },
            research_document: {
                type: String,
                required: [true, "Research document is required."],
            },
            tcle_document: {
                type: String,
                required: [true, "TCLE document is required."],
            },
            tale_document: String,
        },
        status: {
            type: String,
            enum: ["Autorizado", "Pendente", "Não Autorizado"],
            required: [true, "A status is required."],
        },
        country_region: {
            type: String,
            required: [true, "Sample country region is required."],
        },
        country_state: {
            type: String,
            required: [true, "Sample country state is required."],
        },
        country_city: {
            type: String,
            required: [true, "Sample country city is required."],
        },
        instituition: {
            name: {
                type: String,
                required: [true, "Sample instituition name is required."],
            },
            type: {
                type: String,
                enum: ["Pública", "Particular"],
                required: [true, "Sample instituition type is required."],
            },
        },
    },
    {
        timestamps: true,
    }
);
