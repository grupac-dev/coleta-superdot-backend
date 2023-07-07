export default interface ISample {
    _id?: string;
    research_title: string;
    sample_title: string;
    sample_group: string;
    qtt_participants_requested: number;
    qtt_participantes_authorized?: number;
    research_cep: {
        cep_code: string;
        research_document?: string;
        tcle_document?: string;
        tale_document?: string;
    };
    status?: "Autorizado" | "Pendente" | "Não Autorizado";
    country_region: string;
    country_state: string;
    country_city: string;
    instituition: {
        name: string;
        type: "Pública" | "Particular";
    };
    reviews?: [];
    participants?: [];
    createdAt?: Date;
    updatedAt?: Date;
}
