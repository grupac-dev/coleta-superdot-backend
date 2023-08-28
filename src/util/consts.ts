export const SAMPLE_STATUS_ARRAY = ["Pendente", "Autorizado", "Não Autorizado"] as const;
export type SampleStatus = (typeof SAMPLE_STATUS_ARRAY)[number];

export const INSTITUITION_TYPE_ARRAY = ["Pública", "Particular"] as const;
export type InstituitionType = (typeof INSTITUITION_TYPE_ARRAY)[number];

export const FORM_FILL_STATUS = ["Preenchendo", "Aguardando 2ª fonte", "Finalizado"] as const;
export type FormFillStatusType = (typeof FORM_FILL_STATUS)[number];

export const ROLES = ["Pesquisador", "Revisor", "Administrador"] as const;
export type RolesType = (typeof ROLES)[number];
