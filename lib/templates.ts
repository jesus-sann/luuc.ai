import { Template } from "@/types";

const baseTemplates: Template[] = [
  {
    id: "1",
    name: "Acuerdo de Confidencialidad (NDA)",
    slug: "nda",
    description:
      "Protege información confidencial entre partes comerciales o laborales",
    icon: "Shield",
    category: "Contratos y Acuerdos",
    outputType: "Borrador",
    variables: [
      {
        name: "parte_reveladora",
        label: "Parte Reveladora (quien comparte la información)",
        type: "text",
        required: true,
        placeholder: "Nombre completo o razón social",
      },
      {
        name: "parte_receptora",
        label: "Parte Receptora (quien recibe la información)",
        type: "text",
        required: true,
        placeholder: "Nombre completo o razón social",
      },
      {
        name: "tipo_informacion",
        label: "Tipo de Información Confidencial",
        type: "textarea",
        required: true,
        placeholder:
          "Ej: Datos financieros, estrategias comerciales, código fuente...",
      },
      {
        name: "duracion",
        label: "Duración del Acuerdo",
        type: "select",
        required: true,
        options: ["1 año", "2 años", "3 años", "5 años", "Indefinido"],
      },
      {
        name: "jurisdiccion",
        label: "Jurisdicción Aplicable",
        type: "select",
        required: true,
        options: ["Colombia", "México", "Argentina", "Chile", "Perú", "España"],
      },
    ],
    system_prompt: "Genera un Acuerdo de Confidencialidad (NDA) bilateral completo.",
  },
  {
    id: "2",
    name: "Contrato",
    slug: "contrato",
    description:
      "Genera contratos de prestación de servicios, arrendamiento, laboral, comercial y más",
    icon: "FileText",
    category: "Contratos y Acuerdos",
    outputType: "Borrador",
    variables: [
      {
        name: "tipo_contrato",
        label: "Tipo de Contrato",
        type: "select",
        required: true,
        options: [
          "Prestación de Servicios",
          "Arrendamiento",
          "Laboral a Término Fijo",
          "Laboral a Término Indefinido",
          "Compraventa",
          "Distribución / Comercial",
          "Mandato / Agencia",
          "Consultoría",
          "Otro",
        ],
      },
      {
        name: "parte_a",
        label: "Primera Parte",
        type: "text",
        required: true,
        placeholder: "Nombre completo o razón social",
      },
      {
        name: "parte_b",
        label: "Segunda Parte",
        type: "text",
        required: true,
        placeholder: "Nombre completo o razón social",
      },
      {
        name: "objeto",
        label: "Objeto del Contrato",
        type: "textarea",
        required: true,
        placeholder: "Describa el propósito y alcance del contrato...",
      },
      {
        name: "valor",
        label: "Valor / Contraprestación",
        type: "text",
        required: true,
        placeholder: "Ej: $5,000,000 COP mensuales",
      },
      {
        name: "duracion",
        label: "Duración del Contrato",
        type: "text",
        required: true,
        placeholder: "Ej: 6 meses, 1 año, indefinido",
      },
      {
        name: "jurisdiccion",
        label: "Jurisdicción",
        type: "select",
        required: true,
        options: ["Colombia", "México", "Argentina", "Chile", "Perú", "España"],
      },
    ],
    system_prompt:
      "Genera un contrato profesional completo según el tipo seleccionado. Incluye cláusulas estándar de obligaciones, terminación, penalidades, confidencialidad, resolución de conflictos y disposiciones generales.",
  },
  {
    id: "3",
    name: "Carta / Correo Electrónico",
    slug: "carta_correo",
    description:
      "Redacta cartas formales, correos profesionales, notificaciones y comunicaciones oficiales",
    icon: "FileX",
    category: "Comunicaciones Formales",
    outputType: "Borrador",
    variables: [
      {
        name: "tipo_comunicacion",
        label: "Tipo de Comunicación",
        type: "select",
        required: true,
        options: [
          "Carta de Terminación de Contrato",
          "Carta de Renuncia",
          "Notificación Legal",
          "Carta de Cobro / Requerimiento",
          "Carta de Referencia Laboral",
          "Correo Profesional Formal",
          "Comunicado Interno",
          "Carta de Intención",
          "Otro",
        ],
      },
      {
        name: "remitente",
        label: "Remitente",
        type: "text",
        required: true,
        placeholder: "Nombre completo o razón social",
      },
      {
        name: "destinatario",
        label: "Destinatario",
        type: "text",
        required: true,
        placeholder: "Nombre completo o razón social",
      },
      {
        name: "asunto",
        label: "Asunto / Propósito",
        type: "textarea",
        required: true,
        placeholder: "Describa el propósito de la comunicación y los puntos clave a incluir...",
      },
      {
        name: "tono",
        label: "Tono",
        type: "select",
        required: true,
        options: ["Formal", "Semiformal", "Firme / Asertivo", "Cordial"],
      },
    ],
    system_prompt:
      "Genera una comunicación profesional según el tipo seleccionado. Si es carta, usa formato de carta formal con fecha, encabezado, cuerpo y cierre. Si es correo electrónico, usa formato de email profesional con asunto, saludo, cuerpo y despedida.",
  },
  {
    id: "4",
    name: "Acta de Reunión",
    slug: "acta_reunion",
    description: "Documenta los temas tratados y acuerdos de una reunión",
    icon: "Users",
    category: "Comunicaciones Formales",
    outputType: "Acta",
    variables: [
      {
        name: "titulo_reunion",
        label: "Título de la Reunión",
        type: "text",
        required: true,
        placeholder: "Ej: Reunión de Junta Directiva Q4 2024",
      },
      {
        name: "fecha_reunion",
        label: "Fecha de la Reunión",
        type: "date",
        required: true,
      },
      {
        name: "lugar",
        label: "Lugar de la Reunión",
        type: "text",
        required: true,
        placeholder: "Ej: Sala de juntas principal / Virtual (Zoom)",
      },
      {
        name: "asistentes",
        label: "Asistentes",
        type: "textarea",
        required: true,
        placeholder: "Liste los asistentes, uno por línea",
      },
      {
        name: "temas_tratados",
        label: "Temas Tratados",
        type: "textarea",
        required: true,
        placeholder: "Liste los temas discutidos...",
      },
      {
        name: "acuerdos",
        label: "Acuerdos y Compromisos",
        type: "textarea",
        required: true,
        placeholder: "Liste los acuerdos alcanzados...",
      },
    ],
    system_prompt: "Genera un Acta de Reunión formal y estructurada.",
  },
  {
    id: "5",
    name: "Política Interna",
    slug: "politica_interna",
    description: "Define lineamientos y reglas para la organización",
    icon: "BookOpen",
    category: "Políticas y Normativas",
    outputType: "Política",
    variables: [
      {
        name: "empresa",
        label: "Nombre de la Empresa",
        type: "text",
        required: true,
        placeholder: "Razón social de la empresa",
      },
      {
        name: "tipo_politica",
        label: "Tipo de Política",
        type: "select",
        required: true,
        options: [
          "Política de Protección de Datos",
          "Política de Trabajo Remoto",
          "Política de Uso de Equipos",
          "Política de Vacaciones",
          "Política de Gastos",
          "Código de Ética",
        ],
      },
      {
        name: "alcance",
        label: "Alcance (a quién aplica)",
        type: "text",
        required: true,
        placeholder: "Ej: Todos los empleados, Solo área comercial",
      },
      {
        name: "puntos_clave",
        label: "Puntos Clave a Incluir",
        type: "textarea",
        required: true,
        placeholder: "Liste los aspectos más importantes que debe cubrir...",
      },
      {
        name: "consecuencias",
        label: "Consecuencias por Incumplimiento",
        type: "textarea",
        required: false,
        placeholder: "Opcional: Sanciones o consecuencias",
      },
    ],
    system_prompt: "Genera una Política Interna corporativa completa y profesional.",
  },
  {
    id: "6",
    name: "Reporte de Desempeño",
    slug: "performance_report",
    description:
      "Genera reportes de evaluación de desempeño, feedback estructurado y planes de mejora",
    icon: "FileText",
    category: "Reportes y Evaluaciones",
    outputType: "Reporte",
    variables: [
      {
        name: "tipo_reporte",
        label: "Tipo de Reporte",
        type: "select",
        required: true,
        options: [
          "Evaluación de Desempeño Anual",
          "Evaluación Trimestral",
          "Plan de Mejora (PIP)",
          "Feedback 360°",
          "Reporte de Período de Prueba",
          "Resumen de 1:1s",
        ],
      },
      {
        name: "evaluado",
        label: "Nombre del Evaluado",
        type: "text",
        required: true,
        placeholder: "Nombre completo del empleado",
      },
      {
        name: "cargo",
        label: "Cargo / Posición",
        type: "text",
        required: true,
        placeholder: "Ej: Desarrollador Senior, Gerente Comercial",
      },
      {
        name: "periodo",
        label: "Período Evaluado",
        type: "text",
        required: true,
        placeholder: "Ej: Enero - Diciembre 2024, Q3 2024",
      },
      {
        name: "logros",
        label: "Logros y Fortalezas",
        type: "textarea",
        required: true,
        placeholder: "Describa los principales logros, metas cumplidas y fortalezas observadas...",
      },
      {
        name: "areas_mejora",
        label: "Áreas de Mejora",
        type: "textarea",
        required: true,
        placeholder: "Describa las oportunidades de desarrollo y puntos a mejorar...",
      },
      {
        name: "objetivos",
        label: "Objetivos para el Próximo Período",
        type: "textarea",
        required: false,
        placeholder: "Opcional: Metas y KPIs para el siguiente período",
      },
    ],
    system_prompt:
      "Genera un reporte de desempeño profesional y estructurado según el tipo seleccionado. Usa un tono objetivo, constructivo y orientado al desarrollo. Incluye secciones claras, métricas cuando sea posible y recomendaciones accionables.",
  },
];

// ===========================================
// Immigration Templates
// ===========================================

const immigrationTemplates: Template[] = [
  {
    id: "7",
    name: "Cover Letter Consular",
    slug: "cover-letter-consular",
    description:
      "Professional consular cover letter for US visa applications and embassy submissions",
    icon: "Globe",
    category: "Inmigración",
    outputType: "Carta",
    variables: [
      {
        name: "applicant_name",
        label: "Applicant Full Name",
        type: "text",
        required: true,
        placeholder: "Full legal name of the applicant",
      },
      {
        name: "visa_category",
        label: "Visa Category",
        type: "text",
        required: true,
        placeholder: "E.g. H-1B, L-1A, O-1, EB-2 NIW",
      },
      {
        name: "consulate_city",
        label: "Consulate City",
        type: "text",
        required: true,
        placeholder: "E.g. Bogotá, Mexico City, São Paulo",
      },
      {
        name: "consulate_country",
        label: "Consulate Country",
        type: "text",
        required: true,
        placeholder: "E.g. Colombia, Mexico, Brazil",
      },
      {
        name: "officer_title",
        label: "Consular Officer Title",
        type: "text",
        required: false,
        placeholder: "E.g. Consular Officer, Visa Section Chief",
      },
      {
        name: "petition_basis",
        label: "Petition Basis",
        type: "textarea",
        required: true,
        placeholder: "Describe the legal basis for this visa petition...",
      },
      {
        name: "key_facts",
        label: "Key Facts",
        type: "textarea",
        required: true,
        placeholder: "Key facts about the applicant relevant to the petition...",
      },
      {
        name: "supporting_evidence",
        label: "Supporting Evidence Summary",
        type: "textarea",
        required: true,
        placeholder: "List the supporting documents and their significance...",
      },
      {
        name: "attorney_name",
        label: "Attorney Name",
        type: "text",
        required: true,
        placeholder: "Full name of the filing attorney",
      },
      {
        name: "law_firm_name",
        label: "Law Firm Name",
        type: "text",
        required: true,
        placeholder: "Name of the law firm",
      },
    ],
    system_prompt:
      "You are an expert US immigration attorney. Generate the document in English. Generate a professional consular cover letter in the format standard for US visa applications. Use formal legal language. Structure: opening identifying the applicant, visa category and petition basis, summary of supporting evidence, closing request.",
    steps: [
      {
        title: "Client Info",
        fields: ["applicant_name", "visa_category"],
      },
      {
        title: "Consulate Details",
        fields: ["consulate_city", "consulate_country", "officer_title"],
      },
      {
        title: "Petition Basis",
        fields: ["petition_basis", "key_facts", "supporting_evidence"],
      },
      {
        title: "Firm Info",
        fields: ["attorney_name", "law_firm_name"],
      },
    ],
  },
  {
    id: "8",
    name: "Cover Letter USCIS",
    slug: "cover-letter-uscis",
    description:
      "Professional USCIS cover letter for petition and application filings",
    icon: "FileCheck",
    category: "Inmigración",
    outputType: "Carta",
    variables: [
      {
        name: "applicant_name",
        label: "Applicant Full Name",
        type: "text",
        required: true,
        placeholder: "Full legal name of the applicant",
      },
      {
        name: "a_number",
        label: "A-Number (Alien Registration Number)",
        type: "text",
        required: false,
        placeholder: "E.g. A-123 456 789",
      },
      {
        name: "form_type",
        label: "Form Type",
        type: "text",
        required: true,
        placeholder: "E.g. I-130, I-485, I-765, I-140",
      },
      {
        name: "receipt_number",
        label: "Receipt Number",
        type: "text",
        required: false,
        placeholder: "E.g. EAC-24-123-45678",
      },
      {
        name: "filing_basis",
        label: "Filing Basis",
        type: "textarea",
        required: true,
        placeholder: "Describe the legal basis for this filing...",
      },
      {
        name: "key_facts",
        label: "Key Facts",
        type: "textarea",
        required: true,
        placeholder: "Key facts supporting this filing...",
      },
      {
        name: "supporting_documents",
        label: "Supporting Documents",
        type: "textarea",
        required: true,
        placeholder: "List all supporting documents included in this submission...",
      },
      {
        name: "attorney_name",
        label: "Attorney Name",
        type: "text",
        required: true,
        placeholder: "Full name of the filing attorney",
      },
    ],
    system_prompt:
      "You are an expert US immigration attorney. Generate the document in English. Generate a professional USCIS cover letter for a petition or application filing. Include reference to the form type and receipt number if provided. Summarize the filing basis and enumerate the supporting documents.",
    steps: [
      {
        title: "Client Info",
        fields: ["applicant_name", "a_number"],
      },
      {
        title: "Filing Details",
        fields: ["form_type", "receipt_number", "filing_basis"],
      },
      {
        title: "Supporting Documents",
        fields: ["key_facts", "supporting_documents", "attorney_name"],
      },
    ],
  },
  {
    id: "9",
    name: "Personal Declaration",
    slug: "personal-declaration",
    description:
      "First-person sworn personal declaration for immigration proceedings",
    icon: "UserCheck",
    category: "Inmigración",
    outputType: "Declaración",
    variables: [
      {
        name: "declarant_name",
        label: "Declarant Full Name",
        type: "text",
        required: true,
        placeholder: "Full legal name of the person making the declaration",
      },
      {
        name: "country_of_birth",
        label: "Country of Birth",
        type: "text",
        required: true,
        placeholder: "E.g. Mexico, Colombia, Brazil",
      },
      {
        name: "date_of_entry",
        label: "Date of Entry to the US",
        type: "date",
        required: true,
      },
      {
        name: "port_of_entry",
        label: "Port of Entry",
        type: "text",
        required: true,
        placeholder: "E.g. JFK Airport, New York; Laredo, Texas",
      },
      {
        name: "current_immigration_status",
        label: "Current Immigration Status",
        type: "text",
        required: true,
        placeholder: "E.g. Pending asylum, DACA recipient, H-1B holder",
      },
      {
        name: "chronological_facts",
        label: "Chronological Facts",
        type: "textarea",
        required: true,
        placeholder: "Tell the story chronologically — entry, key events, current situation...",
      },
      {
        name: "relief_sought",
        label: "Relief Sought",
        type: "textarea",
        required: true,
        placeholder: "What relief or benefit is the declarant seeking and why...",
      },
      {
        name: "declaration_date",
        label: "Declaration Date",
        type: "date",
        required: true,
      },
    ],
    system_prompt:
      "You are an expert US immigration attorney. Generate the document in English. Generate a first-person sworn personal declaration for immigration proceedings. Use \"I\" throughout. Include a formal declaration header (\"I, [name], declare under penalty of perjury under the laws of the United States of America that the following is true and correct:\"). Tell the story chronologically. End with a formal signature block.",
    steps: [
      {
        title: "Identity",
        fields: ["declarant_name", "country_of_birth"],
      },
      {
        title: "Entry & Status",
        fields: ["date_of_entry", "port_of_entry", "current_immigration_status"],
      },
      {
        title: "Facts & Relief",
        fields: ["chronological_facts", "relief_sought"],
      },
      {
        title: "Finalize",
        fields: ["declaration_date"],
      },
    ],
  },
  {
    id: "10",
    name: "Legal Argument Brief",
    slug: "legal-argument",
    description:
      "Formal legal argument brief section for immigration cases",
    icon: "Scale",
    category: "Inmigración",
    outputType: "Brief",
    variables: [
      {
        name: "case_name",
        label: "Case Name",
        type: "text",
        required: true,
        placeholder: "E.g. Matter of Rodriguez, File No. A-123456789",
      },
      {
        name: "issue_presented",
        label: "Issue Presented",
        type: "textarea",
        required: true,
        placeholder: "State the precise legal question to be resolved...",
      },
      {
        name: "applicable_statute",
        label: "Applicable Statute / Regulation",
        type: "text",
        required: true,
        placeholder: "E.g. INA § 101(a)(15)(H)(i)(b), 8 C.F.R. § 214.2(h)",
      },
      {
        name: "legal_standard",
        label: "Legal Standard",
        type: "textarea",
        required: true,
        placeholder: "State the applicable legal standard and cite relevant case law...",
      },
      {
        name: "facts",
        label: "Statement of Facts",
        type: "textarea",
        required: true,
        placeholder: "Summarize the relevant facts of the case...",
      },
      {
        name: "argument",
        label: "Argument",
        type: "textarea",
        required: true,
        placeholder: "Apply law to facts — make the argument...",
      },
      {
        name: "conclusion",
        label: "Conclusion",
        type: "textarea",
        required: true,
        placeholder: "State the relief requested and why it should be granted...",
      },
      {
        name: "attorney_name",
        label: "Attorney Name",
        type: "text",
        required: true,
        placeholder: "Full name of the filing attorney",
      },
    ],
    system_prompt:
      "You are an expert US immigration attorney. Generate the document in English. Generate a formal legal argument brief section for an immigration case. Structure: Issue Presented, Legal Standard (cite the statute), Statement of Facts, Argument (applying law to facts), Conclusion. Use formal legal citation style.",
    steps: [
      {
        title: "Case",
        fields: ["case_name", "issue_presented"],
      },
      {
        title: "Legal Basis",
        fields: ["applicable_statute", "legal_standard"],
      },
      {
        title: "Argument",
        fields: ["facts", "argument"],
      },
      {
        title: "Conclusion",
        fields: ["conclusion", "attorney_name"],
      },
    ],
  },
  {
    id: "11",
    name: "Evidence Summary",
    slug: "evidence-summary",
    description:
      "Professional evidence summary and exhibit index for immigration filings",
    icon: "ClipboardList",
    category: "Inmigración",
    outputType: "Resumen",
    variables: [
      {
        name: "case_name",
        label: "Case Name",
        type: "text",
        required: true,
        placeholder: "E.g. Matter of Rodriguez, File No. A-123456789",
      },
      {
        name: "applicant_name",
        label: "Applicant Full Name",
        type: "text",
        required: true,
        placeholder: "Full legal name of the applicant",
      },
      {
        name: "submission_date",
        label: "Submission Date",
        type: "date",
        required: true,
      },
      {
        name: "exhibit_list",
        label: "Exhibit List",
        type: "textarea",
        required: true,
        placeholder: "List each exhibit — label, document name, brief description. One per line.\nE.g.\nExhibit A — Passport copy — Identity document\nExhibit B — Employment letter — Establishes qualifying employment",
      },
      {
        name: "relevance_statement",
        label: "Overall Relevance Statement",
        type: "textarea",
        required: true,
        placeholder: "Explain how the body of evidence supports the petition as a whole...",
      },
      {
        name: "attorney_name",
        label: "Attorney Name",
        type: "text",
        required: true,
        placeholder: "Full name of the filing attorney",
      },
    ],
    system_prompt:
      "You are an expert US immigration attorney. Generate the document in English. Generate a professional evidence summary / exhibit index for an immigration filing. List each piece of evidence with its exhibit label, document description, and relevance to the petition. Format as a structured table or numbered list.",
    steps: [
      {
        title: "Case Info",
        fields: ["case_name", "applicant_name", "submission_date"],
      },
      {
        title: "Evidence",
        fields: ["exhibit_list"],
      },
      {
        title: "Finalize",
        fields: ["relevance_statement", "attorney_name"],
      },
    ],
  },
  {
    id: "12",
    name: "Case Summary",
    slug: "case-summary",
    description:
      "Concise internal case summary memo for immigration matters",
    icon: "FolderOpen",
    category: "Inmigración",
    outputType: "Memo",
    variables: [
      {
        name: "client_name",
        label: "Client Full Name",
        type: "text",
        required: true,
        placeholder: "Full legal name of the client",
      },
      {
        name: "a_number",
        label: "A-Number",
        type: "text",
        required: false,
        placeholder: "E.g. A-123 456 789",
      },
      {
        name: "visa_type",
        label: "Visa / Case Type",
        type: "text",
        required: true,
        placeholder: "E.g. H-1B, Marriage-Based Green Card, Asylum",
      },
      {
        name: "case_stage",
        label: "Current Case Stage",
        type: "text",
        required: true,
        placeholder: "E.g. Petition filed, RFE received, Interview scheduled",
      },
      {
        name: "priority_date",
        label: "Priority Date",
        type: "text",
        required: false,
        placeholder: "E.g. January 1, 2022 (leave blank if N/A)",
      },
      {
        name: "filing_date",
        label: "Filing Date",
        type: "date",
        required: false,
      },
      {
        name: "key_dates",
        label: "Key Dates / Deadlines",
        type: "textarea",
        required: true,
        placeholder: "List important dates and deadlines, one per line...",
      },
      {
        name: "current_status",
        label: "Current Status",
        type: "textarea",
        required: true,
        placeholder: "Describe the current status of the case in detail...",
      },
      {
        name: "next_steps",
        label: "Recommended Next Steps",
        type: "textarea",
        required: true,
        placeholder: "List the recommended next actions and who is responsible...",
      },
      {
        name: "assigned_attorney",
        label: "Assigned Attorney",
        type: "text",
        required: true,
        placeholder: "Name of the attorney handling this case",
      },
    ],
    system_prompt:
      "You are an expert US immigration attorney. Generate the document in English. Generate a concise professional case summary memo for an immigration matter. Include client identification, case type, current status, key dates, and recommended next steps. This is an internal firm document.",
    steps: [
      {
        title: "Client",
        fields: ["client_name", "a_number", "visa_type"],
      },
      {
        title: "Case Status",
        fields: ["case_stage", "priority_date", "filing_date"],
      },
      {
        title: "Key Info",
        fields: ["key_dates", "current_status"],
      },
      {
        title: "Next Steps",
        fields: ["next_steps", "assigned_attorney"],
      },
    ],
  },
  {
    id: "15",
    name: "I-751 Cover Letter",
    slug: "i751-cover-letter",
    description:
      "USCIS cover letter for I-751 Petition to Remove Conditions on Residence",
    icon: "FileCheck",
    category: "Inmigración",
    outputType: "Cover Letter",
    variables: [
      // Step 1 — Applicant
      {
        name: "applicant_name",
        label: "Applicant Full Name",
        type: "text",
        required: true,
        placeholder: "Full legal name",
      },
      {
        name: "a_number",
        label: "A-Number",
        type: "text",
        required: false,
        placeholder: "e.g. A220-252-084",
      },
      {
        name: "date_of_birth",
        label: "Date of Birth",
        type: "date",
        required: true,
      },
      {
        name: "country_of_birth",
        label: "Country of Birth",
        type: "text",
        required: true,
        placeholder: "e.g. Mexico, Colombia",
      },
      {
        name: "applicant_address",
        label: "Applicant Address",
        type: "text",
        required: true,
        placeholder: "Street, Apt, City, State, ZIP",
      },
      {
        name: "applicant_phone",
        label: "Phone Number",
        type: "text",
        required: false,
      },
      // Step 2 — Case Details
      {
        name: "i751_basis",
        label: "I-751 Filing Basis",
        type: "select",
        required: true,
        options: [
          "Abuse / Battery Waiver (INA 216(c)(4)(C))",
          "Extreme Cruelty Waiver (INA 216(c)(4)(C))",
          "Good Faith Marriage — Joint Petition",
          "Good Faith Marriage — Divorce/Separation",
          "Death of Petitioning Spouse",
        ],
      },
      {
        name: "conditional_residency_expiry",
        label: "Conditional Residency Expiration Date",
        type: "date",
        required: false,
      },
      {
        name: "i129f_receipt",
        label: "I-129F Receipt Number",
        type: "text",
        required: false,
        placeholder: "e.g. WAC219007100",
      },
      {
        name: "i485_receipt",
        label: "I-485 Receipt Number",
        type: "text",
        required: false,
        placeholder: "e.g. IOE0921361286",
      },
      {
        name: "last_entry_date",
        label: "Last Entry to the U.S.",
        type: "date",
        required: false,
      },
      {
        name: "last_entry_port",
        label: "Port of Entry",
        type: "text",
        required: false,
        placeholder: "e.g. Nuevo Laredo, Texas",
      },
      // Step 3 — Legal Basis & Facts
      {
        name: "abuse_facts",
        label: "Facts Supporting the Waiver",
        type: "textarea",
        required: true,
        placeholder:
          "Describe the abuse, battery, or extreme cruelty suffered. Include timeline, impact on applicant and children, and why the applicant qualifies for this waiver...",
      },
      {
        name: "filing_delay_explanation",
        label: "Reason for Late Filing (if applicable)",
        type: "textarea",
        required: false,
        placeholder:
          "If the I-751 is filed after the 90-day window, explain why...",
      },
      // Step 4 — Family
      {
        name: "spouse_name",
        label: "U.S. Citizen Spouse Full Name",
        type: "text",
        required: false,
      },
      {
        name: "spouse_dob",
        label: "Spouse Date of Birth",
        type: "date",
        required: false,
      },
      {
        name: "children",
        label: "Children (if any)",
        type: "textarea",
        required: false,
        placeholder:
          "Child 1: [Name], DOB [Date], Country [Country], Status [LPR/USC]\nChild 2: ...",
      },
      // Step 5 — Evidence
      {
        name: "evidence_tabs",
        label: "Evidence Tabs",
        type: "textarea",
        required: true,
        placeholder:
          "Tab A: Form G-1650\nTab B: Form G-28\nTab C: Form I-751\nTab D: Copy of LPR Card, Passport, I-94\nTab E: Marriage Certificate, Joint evidence, Applicant Affidavit...",
      },
    ],
    system_prompt:
      "You are an expert US immigration attorney specializing in VAWA and removal of conditions cases. Generate a professional USCIS cover letter for an I-751 Petition to Remove Conditions on Residence. Use formal legal language throughout. STRUCTURE: (1) Date (use today's date), (2) USCIS filing address appropriate for I-751, (3) RE: line with applicant name, A-Number, and petition type, (4) Dear Officer salutation, (5) Opening paragraph identifying the applicant, her A-Number, conditional residency, and the basis for filing, (6) Factual paragraph explaining the marriage history and the abuse/waiver grounds with reference to INA 216(c)(4)(C), (7) If filed late, address the good cause for delay, (8) Paragraph listing the attached evidence by tab label and explaining what each proves, (9) Closing paragraph requesting approval, (10) Respectfully submitted signature block with [Attorney Name] placeholder if not provided. Do NOT invent any facts not in the provided information.",
    steps: [
      {
        title: "Applicant",
        fields: [
          "applicant_name",
          "a_number",
          "date_of_birth",
          "country_of_birth",
          "applicant_address",
          "applicant_phone",
        ],
      },
      {
        title: "Case Details",
        fields: [
          "i751_basis",
          "conditional_residency_expiry",
          "i129f_receipt",
          "i485_receipt",
          "last_entry_date",
          "last_entry_port",
        ],
      },
      {
        title: "Legal Basis & Facts",
        fields: ["abuse_facts", "filing_delay_explanation"],
      },
      {
        title: "Family",
        fields: ["spouse_name", "spouse_dob", "children"],
      },
      {
        title: "Evidence",
        fields: ["evidence_tabs"],
      },
    ],
  },
  {
    id: "16",
    name: "I-485 Cover Letter (245(i))",
    slug: "i485-245i-cover-letter",
    description:
      "USCIS cover letter for I-485 Adjustment of Status filed under INA 245(i)",
    icon: "Scale",
    category: "Inmigración",
    outputType: "Cover Letter",
    variables: [
      // Step 1 — Petitioner
      {
        name: "petitioner_name",
        label: "Petitioner Full Name",
        type: "text",
        required: true,
        placeholder: "U.S. Citizen or LPR filing the I-130",
      },
      {
        name: "petitioner_a_number",
        label: "Petitioner A-Number (if LPR)",
        type: "text",
        required: false,
        placeholder: "e.g. A092922496",
      },
      {
        name: "petitioner_status",
        label: "Petitioner Immigration Status",
        type: "select",
        required: true,
        options: [
          "U.S. Citizen by Birth",
          "U.S. Citizen by Naturalization",
          "Lawful Permanent Resident",
        ],
      },
      {
        name: "petitioner_address",
        label: "Petitioner Address",
        type: "text",
        required: true,
        placeholder: "Street, City, State, ZIP",
      },
      // Step 2 — Beneficiary
      {
        name: "beneficiary_name",
        label: "Beneficiary Full Name",
        type: "text",
        required: true,
      },
      {
        name: "beneficiary_other_name",
        label: "Other Name Used",
        type: "text",
        required: false,
        placeholder: "If any",
      },
      {
        name: "beneficiary_dob",
        label: "Beneficiary Date of Birth",
        type: "date",
        required: true,
      },
      {
        name: "beneficiary_country_of_birth",
        label: "Beneficiary Country of Birth",
        type: "text",
        required: true,
      },
      {
        name: "beneficiary_address",
        label: "Beneficiary Address",
        type: "text",
        required: true,
        placeholder: "Street, City, State, ZIP",
      },
      // Step 3 — 245(i) Eligibility
      {
        name: "family_relationship",
        label: "Family Relationship / Preference Category",
        type: "select",
        required: true,
        options: [
          "Immediate Relative (spouse, parent, child)",
          "F1 — Unmarried son/daughter of USC",
          "F2A — Spouse/child of LPR",
          "F2B — Unmarried son/daughter of LPR",
          "F3 — Married son/daughter of USC",
          "F4 — Brother/sister of USC",
        ],
      },
      {
        name: "underlying_petition_receipt",
        label: "Underlying I-130 Receipt Number",
        type: "text",
        required: true,
        placeholder: "e.g. WAC0117357120",
      },
      {
        name: "priority_date",
        label: "Priority Date of Underlying Petition",
        type: "text",
        required: true,
        placeholder: "e.g. 04/09/2001",
      },
      {
        name: "grandfathered_evidence",
        label: "Grandfathered Case Evidence",
        type: "textarea",
        required: true,
        placeholder:
          "Describe the approval notice — receipt number, receipt date, priority date (must be on or before April 30, 2001)...",
      },
      // Step 4 — Immigration History & Admissibility
      {
        name: "last_entry_date",
        label: "Date of Last Entry to the U.S.",
        type: "date",
        required: true,
      },
      {
        name: "last_entry_port",
        label: "Port of Last Entry",
        type: "text",
        required: true,
        placeholder: "e.g. Nuevo Laredo, Texas",
      },
      {
        name: "manner_of_entry",
        label: "Manner of Entry / Visa Class",
        type: "text",
        required: true,
        placeholder: "e.g. Admitted as B-2 tourist visa",
      },
      {
        name: "immigration_violations",
        label: "Immigration Violations / Inadmissibility (if any)",
        type: "textarea",
        required: false,
        placeholder:
          "e.g. Unauthorized employment, overstay. Explain why these do not bar adjustment under 245(i) or describe any hardship arguments...",
      },
      // Step 5 — Family & Employment
      {
        name: "marital_status",
        label: "Beneficiary Current Marital Status",
        type: "text",
        required: true,
      },
      {
        name: "spouse_name",
        label: "Spouse Name (if married)",
        type: "text",
        required: false,
      },
      {
        name: "children",
        label: "Children (if any)",
        type: "textarea",
        required: false,
        placeholder:
          "Child 1: [Name], DOB [Date], Country [Country], Status [USC/LPR/other]",
      },
      {
        name: "current_employment",
        label: "Current Employment in the U.S.",
        type: "text",
        required: false,
        placeholder: "e.g. Chef at Chuy's TexMex Restaurant since 11/2019",
      },
      {
        name: "hardship_factors",
        label: "Hardship / Discretionary Factors",
        type: "textarea",
        required: false,
        placeholder:
          "Factors supporting favorable discretion: family ties, community ties, children's needs, country conditions, length of U.S. residence...",
      },
      // Step 6 — Evidence
      {
        name: "evidence_tabs",
        label: "Evidence Tabs",
        type: "textarea",
        required: true,
        placeholder:
          "Tab A: Forms G-1650\nTab B: Form G-28 for Petitioner\nTab C: Form G-28 for Beneficiary\nTab D: Form I-130\nTab E: Form I-485\nTab F: Form I-485A\nTab G: Form I-765\nTab H: Identity documents\nTab I: I-130 Approval Notice + Proof of Physical Presence\nTab J: Form I-864\nTab K: Country conditions evidence\nTab L: Form I-693",
      },
    ],
    system_prompt:
      "You are an expert US immigration attorney specializing in adjustment of status cases. Generate a professional USCIS cover letter for an I-485 Application to Register Permanent Residence or Adjust Status filed under INA § 245(i). Use formal legal language throughout. STRUCTURE: (1) Date (use today's date), (2) USCIS filing address for I-485 filed under 245(i) in Texas (Vermont Service Center or National Benefits Center), (3) RE: line with petitioner name, beneficiary name, underlying petition receipt number, priority date, and form numbers being filed, (4) Dear Officer salutation, (5) Opening paragraph identifying the petitioner, beneficiary, their relationship, and the forms being submitted, (6) INA 245(i) eligibility paragraph — explain the grandfathered petition (receipt number, priority date on or before April 30, 2001, approval), (7) Immigration history paragraph — last entry, status, any violations and why they do not bar adjustment under 245(i), (8) Hardship and discretionary factors paragraph (if provided), (9) Paragraph listing attached evidence by tab and its purpose, (10) Closing paragraph requesting favorable adjudication, (11) Respectfully submitted signature block with [Attorney Name] placeholder if not provided. Do NOT invent any facts not in the provided information.",
    steps: [
      {
        title: "Petitioner",
        fields: [
          "petitioner_name",
          "petitioner_a_number",
          "petitioner_status",
          "petitioner_address",
        ],
      },
      {
        title: "Beneficiary",
        fields: [
          "beneficiary_name",
          "beneficiary_other_name",
          "beneficiary_dob",
          "beneficiary_country_of_birth",
          "beneficiary_address",
        ],
      },
      {
        title: "245(i) Eligibility",
        fields: [
          "family_relationship",
          "underlying_petition_receipt",
          "priority_date",
          "grandfathered_evidence",
        ],
      },
      {
        title: "Immigration History & Admissibility",
        fields: [
          "last_entry_date",
          "last_entry_port",
          "manner_of_entry",
          "immigration_violations",
        ],
      },
      {
        title: "Family & Employment",
        fields: [
          "marital_status",
          "spouse_name",
          "children",
          "current_employment",
          "hardship_factors",
        ],
      },
      {
        title: "Evidence",
        fields: ["evidence_tabs"],
      },
    ],
  },
  // ============================================================
  // Templates 17–26: Common Immigration Case Types
  // ============================================================
  {
    id: "17",
    name: "I-130 Family Petition Cover Letter",
    slug: "i130-cover-letter",
    description: "USCIS cover letter for I-130 Petition for Alien Relative",
    icon: "Users",
    category: "Inmigración",
    outputType: "Cover Letter",
    variables: [
      {
        name: "petitioner_name",
        label: "Petitioner Full Name",
        type: "text",
        required: true,
      },
      {
        name: "petitioner_dob",
        label: "Petitioner Date of Birth",
        type: "date",
        required: true,
      },
      {
        name: "petitioner_status",
        label: "Petitioner Immigration Status",
        type: "select",
        required: true,
        options: [
          "U.S. Citizen by Birth",
          "U.S. Citizen by Naturalization",
          "Lawful Permanent Resident",
        ],
      },
      {
        name: "petitioner_a_number",
        label: "Petitioner A-Number (if any)",
        type: "text",
        required: false,
      },
      {
        name: "petitioner_address",
        label: "Petitioner Address",
        type: "text",
        required: true,
      },
      {
        name: "beneficiary_name",
        label: "Beneficiary Full Name",
        type: "text",
        required: true,
      },
      {
        name: "beneficiary_dob",
        label: "Beneficiary Date of Birth",
        type: "date",
        required: true,
      },
      {
        name: "beneficiary_country_of_birth",
        label: "Beneficiary Country of Birth",
        type: "text",
        required: true,
      },
      {
        name: "beneficiary_relationship",
        label: "Relationship to Petitioner",
        type: "select",
        required: true,
        options: [
          "Spouse",
          "Child (under 21, unmarried)",
          "Son/Daughter (21+ or married)",
          "Parent",
          "Sibling/Brother/Sister",
        ],
      },
      {
        name: "proof_of_relationship",
        label: "Proof of Relationship",
        type: "textarea",
        required: true,
        placeholder:
          "Describe the key documents proving the relationship (birth cert, marriage cert, etc.)",
      },
      {
        name: "proof_of_status",
        label: "Proof of Petitioner Status",
        type: "textarea",
        required: true,
        placeholder:
          "Documents proving petitioner's U.S. citizenship or LPR status...",
      },
      {
        name: "evidence_tabs",
        label: "Evidence Tab List",
        type: "textarea",
        required: true,
        placeholder:
          "Tab A: Form G-1650\nTab B: Form G-28\nTab C: Form I-130\nTab D: Proof of petitioner status\nTab E: Proof of relationship\n...",
      },
    ],
    steps: [
      {
        title: "Petitioner",
        fields: [
          "petitioner_name",
          "petitioner_dob",
          "petitioner_status",
          "petitioner_a_number",
          "petitioner_address",
        ],
      },
      {
        title: "Beneficiary",
        fields: [
          "beneficiary_name",
          "beneficiary_dob",
          "beneficiary_country_of_birth",
          "beneficiary_relationship",
        ],
      },
      {
        title: "Supporting Documents",
        fields: ["proof_of_relationship", "proof_of_status"],
      },
      {
        title: "Evidence",
        fields: ["evidence_tabs"],
      },
    ],
    system_prompt:
      "You are an expert US immigration attorney. Generate a professional USCIS cover letter for an I-130 Petition for Alien Relative. STRUCTURE: (1) Today's date, (2) USCIS address appropriate for I-130, (3) RE: I-130 petition — petitioner name, beneficiary name, relationship, (4) Dear Officer, (5) Opening identifying petitioner status and beneficiary relationship, (6) Legal eligibility paragraph citing INA 201/203 family preference or immediate relative category, (7) Summary of proof of relationship, (8) Evidence tab list with purpose of each exhibit, (9) Request for approval, (10) Signature block. Do NOT invent any facts not provided.",
  },
  {
    id: "18",
    name: "I-485 Immediate Relative Cover Letter",
    slug: "i485-cover-letter",
    description:
      "USCIS cover letter for I-485 Adjustment of Status — Immediate Relative (spouse, child, parent of USC)",
    icon: "FileCheck",
    category: "Inmigración",
    outputType: "Cover Letter",
    variables: [
      {
        name: "applicant_name",
        label: "Applicant Full Name",
        type: "text",
        required: true,
      },
      {
        name: "a_number",
        label: "A-Number (if any)",
        type: "text",
        required: false,
      },
      {
        name: "dob",
        label: "Date of Birth",
        type: "date",
        required: true,
      },
      {
        name: "country_of_birth",
        label: "Country of Birth",
        type: "text",
        required: true,
      },
      {
        name: "applicant_address",
        label: "Applicant Address",
        type: "text",
        required: true,
      },
      {
        name: "adjustment_basis",
        label: "Basis for Adjustment",
        type: "select",
        required: true,
        options: [
          "Marriage to U.S. Citizen",
          "Child of U.S. Citizen (under 21)",
          "Parent of U.S. Citizen (21+)",
          "Other Immediate Relative",
        ],
      },
      {
        name: "i130_receipt",
        label: "I-130 Receipt Number",
        type: "text",
        required: false,
      },
      {
        name: "i130_approval_date",
        label: "I-130 Approval Date",
        type: "text",
        required: false,
      },
      {
        name: "petitioner_name",
        label: "Petitioner Full Name",
        type: "text",
        required: true,
      },
      {
        name: "last_entry_date",
        label: "Last Entry Date into U.S.",
        type: "date",
        required: true,
      },
      {
        name: "last_entry_port",
        label: "Port of Last Entry",
        type: "text",
        required: true,
      },
      {
        name: "visa_class_at_entry",
        label: "Visa Class at Last Entry",
        type: "text",
        required: true,
        placeholder: "e.g. K-1, B-2, F-1",
      },
      {
        name: "current_status",
        label: "Current Immigration Status",
        type: "text",
        required: true,
      },
      {
        name: "immigration_issues",
        label: "Immigration History Issues",
        type: "textarea",
        required: false,
        placeholder:
          "Any unlawful presence, prior removal, or other issues...",
      },
      {
        name: "marital_status",
        label: "Marital Status",
        type: "text",
        required: true,
      },
      {
        name: "spouse_name",
        label: "Spouse Name (if applicable)",
        type: "text",
        required: false,
      },
      {
        name: "children",
        label: "Children (including step-children)",
        type: "textarea",
        required: false,
        placeholder: "List any children including step-children...",
      },
      {
        name: "evidence_tabs",
        label: "Evidence Tab List",
        type: "textarea",
        required: true,
        placeholder:
          "Tab A: Form G-1650\nTab B: Form G-28\nTab C: I-130 and Approval Notice\nTab D: Form I-485\nTab E: I-765 and I-131\nTab F: Identity documents\nTab G: Proof of relationship\nTab H: I-864 Affidavit of Support\nTab I: I-693 Medical Exam",
      },
    ],
    steps: [
      {
        title: "Applicant",
        fields: [
          "applicant_name",
          "a_number",
          "dob",
          "country_of_birth",
          "applicant_address",
        ],
      },
      {
        title: "Basis for Adjustment",
        fields: [
          "adjustment_basis",
          "i130_receipt",
          "i130_approval_date",
          "petitioner_name",
        ],
      },
      {
        title: "Immigration History",
        fields: [
          "last_entry_date",
          "last_entry_port",
          "visa_class_at_entry",
          "current_status",
          "immigration_issues",
        ],
      },
      {
        title: "Family",
        fields: ["marital_status", "spouse_name", "children"],
      },
      {
        title: "Evidence",
        fields: ["evidence_tabs"],
      },
    ],
    system_prompt:
      "You are an expert US immigration attorney. Generate a professional USCIS cover letter for an I-485 Application to Register Permanent Residence for an immediate relative of a U.S. citizen. STRUCTURE: (1) Today's date, (2) USCIS address, (3) RE: I-485 — applicant name, A-Number if any, basis (immediate relative — specify relationship), (4) Dear Officer, (5) Opening identifying applicant, petitioner, their relationship, and the I-130 approval, (6) Admissibility paragraph — lawful entry, current status, any issues addressed, (7) Evidence paragraph listing each tab and its purpose, (8) Request for approval and interview, (9) Signature block. Do NOT invent any facts not provided.",
  },
  {
    id: "19",
    name: "I-129F K-1 Fiancé Petition Cover Letter",
    slug: "i129f-cover-letter",
    description:
      "USCIS cover letter for I-129F Petition for Alien Fiancé(e) (K-1 visa)",
    icon: "Heart",
    category: "Inmigración",
    outputType: "Cover Letter",
    variables: [
      {
        name: "petitioner_name",
        label: "Petitioner Full Name",
        type: "text",
        required: true,
      },
      {
        name: "petitioner_dob",
        label: "Petitioner Date of Birth",
        type: "date",
        required: true,
      },
      {
        name: "petitioner_address",
        label: "Petitioner Address",
        type: "text",
        required: true,
      },
      {
        name: "petitioner_prior_marriages",
        label: "Petitioner Prior Marriages",
        type: "select",
        required: true,
        options: [
          "No prior marriages",
          "One prior marriage — ended by divorce",
          "One prior marriage — ended by death",
          "Two or more prior marriages",
        ],
      },
      {
        name: "fiance_name",
        label: "Fiancé(e) Full Name",
        type: "text",
        required: true,
      },
      {
        name: "fiance_dob",
        label: "Fiancé(e) Date of Birth",
        type: "date",
        required: true,
      },
      {
        name: "fiance_country",
        label: "Fiancé(e) Country of Birth/Citizenship",
        type: "text",
        required: true,
      },
      {
        name: "fiance_address",
        label: "Fiancé(e) Address Abroad",
        type: "text",
        required: true,
      },
      {
        name: "fiance_prior_marriages",
        label: "Fiancé(e) Prior Marriages",
        type: "select",
        required: true,
        options: [
          "No prior marriages",
          "One prior marriage — ended by divorce",
          "One prior marriage — ended by death",
          "Two or more prior marriages",
        ],
      },
      {
        name: "in_person_meeting_date",
        label: "In-Person Meeting Date",
        type: "date",
        required: true,
      },
      {
        name: "in_person_meeting_location",
        label: "In-Person Meeting Location",
        type: "text",
        required: true,
        placeholder: "City, Country where couple met in person",
      },
      {
        name: "relationship_history",
        label: "Relationship History",
        type: "textarea",
        required: true,
        placeholder:
          "How did the couple meet? Describe the relationship history and intent to marry within 90 days of K-1 entry...",
      },
      {
        name: "communications_evidence",
        label: "Evidence of Ongoing Communication",
        type: "textarea",
        required: false,
        placeholder:
          "Describe evidence of ongoing communication: phone records, emails, social media, video calls...",
      },
      {
        name: "evidence_tabs",
        label: "Evidence Tab List",
        type: "textarea",
        required: true,
        placeholder:
          "Tab A: Form G-1650\nTab B: Form G-28\nTab C: Form I-129F\nTab D: Petitioner proof of citizenship\nTab E: Fiancé(e) identity documents\nTab F: Proof of in-person meeting\nTab G: Evidence of ongoing relationship (photos, messages, tickets)\nTab H: Prior divorce decrees (if applicable)",
      },
    ],
    steps: [
      {
        title: "U.S. Citizen Petitioner",
        fields: [
          "petitioner_name",
          "petitioner_dob",
          "petitioner_address",
          "petitioner_prior_marriages",
        ],
      },
      {
        title: "Foreign National Fiancé(e)",
        fields: [
          "fiance_name",
          "fiance_dob",
          "fiance_country",
          "fiance_address",
          "fiance_prior_marriages",
        ],
      },
      {
        title: "Relationship",
        fields: [
          "in_person_meeting_date",
          "in_person_meeting_location",
          "relationship_history",
          "communications_evidence",
        ],
      },
      {
        title: "Evidence",
        fields: ["evidence_tabs"],
      },
    ],
    system_prompt:
      "You are an expert US immigration attorney. Generate a professional USCIS cover letter for an I-129F Petition for Alien Fiancé(e) (K-1 visa). STRUCTURE: (1) Today's date, (2) USCIS address, (3) RE: I-129F — petitioner name, fiancé(e) name, (4) Dear Officer, (5) Opening identifying the petitioner as a U.S. citizen and fiancé(e) nationality, (6) Paragraph establishing the bona fide relationship — how they met, in-person meeting date and location (within 2 years), intent to marry within 90 days of K-1 entry, (7) If prior marriages, confirm they were legally terminated, (8) Evidence of ongoing relationship paragraph, (9) Tab-by-tab evidence summary, (10) Request for approval, (11) Signature block. Do NOT invent any facts not provided.",
  },
  {
    id: "20",
    name: "I-360 VAWA Self-Petition Cover Letter",
    slug: "i360-vawa-cover-letter",
    description:
      "USCIS cover letter for I-360 VAWA Self-Petition (abuse by USC or LPR spouse/parent)",
    icon: "Shield",
    category: "Inmigración",
    outputType: "Cover Letter",
    variables: [
      {
        name: "petitioner_name",
        label: "Self-Petitioner Full Name",
        type: "text",
        required: true,
      },
      {
        name: "a_number",
        label: "A-Number (if any)",
        type: "text",
        required: false,
      },
      {
        name: "dob",
        label: "Date of Birth",
        type: "date",
        required: true,
      },
      {
        name: "country_of_birth",
        label: "Country of Birth",
        type: "text",
        required: true,
      },
      {
        name: "petitioner_address",
        label: "Petitioner Address",
        type: "text",
        required: true,
      },
      {
        name: "abuser_name",
        label: "Abuser Full Name",
        type: "text",
        required: true,
      },
      {
        name: "abuser_status",
        label: "Abuser Immigration Status",
        type: "select",
        required: true,
        options: ["U.S. Citizen", "Lawful Permanent Resident"],
      },
      {
        name: "abuser_relationship",
        label: "Abuser Relationship to Petitioner",
        type: "select",
        required: true,
        options: ["Spouse", "Former Spouse", "Parent", "Step-parent"],
      },
      {
        name: "abuser_a_number",
        label: "Abuser A-Number (if known)",
        type: "text",
        required: false,
      },
      {
        name: "marriage_details",
        label: "Marriage Details",
        type: "textarea",
        required: true,
        placeholder:
          "Date and place of marriage, current status of marriage...",
      },
      {
        name: "abuse_facts",
        label: "Abuse Facts",
        type: "textarea",
        required: true,
        placeholder:
          "Describe the battery or extreme cruelty suffered — physical, emotional, psychological abuse, timeline, location, impact on self and children...",
      },
      {
        name: "good_moral_character",
        label: "Good Moral Character Evidence",
        type: "textarea",
        required: true,
        placeholder:
          "Describe evidence of good moral character: employment, taxes, community ties, no criminal history...",
      },
      {
        name: "shared_residence",
        label: "Shared Residence with Abuser",
        type: "textarea",
        required: true,
        placeholder:
          "Describe where and when petitioner lived with the abuser — address, dates, evidence...",
      },
      {
        name: "evidence_tabs",
        label: "Evidence Tab List",
        type: "textarea",
        required: true,
        placeholder:
          "Tab A: Form G-1650\nTab B: Form G-28\nTab C: Form I-360\nTab D: Petitioner identity documents\nTab E: Proof of relationship to abuser (marriage cert, birth cert)\nTab F: Proof of abuser's USC/LPR status\nTab G: Proof of shared residence\nTab H: Evidence of abuse (police reports, medical records, photos)\nTab I: Evidence of good moral character\nTab J: Petitioner affidavit with certified translation\nTab K: Affidavits of support from witnesses",
      },
    ],
    steps: [
      {
        title: "Self-Petitioner",
        fields: [
          "petitioner_name",
          "a_number",
          "dob",
          "country_of_birth",
          "petitioner_address",
        ],
      },
      {
        title: "Abuser",
        fields: [
          "abuser_name",
          "abuser_status",
          "abuser_relationship",
          "abuser_a_number",
        ],
      },
      {
        title: "Abuse & Eligibility",
        fields: [
          "marriage_details",
          "abuse_facts",
          "good_moral_character",
          "shared_residence",
        ],
      },
      {
        title: "Evidence",
        fields: ["evidence_tabs"],
      },
    ],
    system_prompt:
      "You are an expert US immigration attorney specializing in VAWA cases. Generate a confidential professional USCIS cover letter for an I-360 VAWA Self-Petition. Note that VAWA filings are confidential under INA 384. STRUCTURE: (1) Today's date, (2) USCIS Vermont Service Center address (VAWA filings go to VSC), (3) RE: I-360 VAWA Self-Petition — petitioner name, relationship to abuser, (4) Dear Officer, (5) Opening identifying petitioner and abuser relationship/status, (6) Eligibility paragraph citing INA 204(a)(1)(A)(iii) or (B)(ii) — battery or extreme cruelty by USC/LPR spouse or parent, (7) Facts paragraph describing the abuse — be specific and persuasive, (8) Shared residence paragraph, (9) Good moral character paragraph, (10) Evidence tab list with each exhibit's purpose, (11) Request for approval, (12) Signature block. Do NOT invent any facts not provided. Keep tone professional and advocacy-focused.",
  },
  {
    id: "21",
    name: "I-918 U Visa Cover Letter",
    slug: "i918-u-visa-cover-letter",
    description:
      "USCIS cover letter for I-918 U Nonimmigrant Status (crime victim visa)",
    icon: "UserCheck",
    category: "Inmigración",
    outputType: "Cover Letter",
    variables: [
      {
        name: "petitioner_name",
        label: "Petitioner Full Name",
        type: "text",
        required: true,
      },
      {
        name: "a_number",
        label: "A-Number (if any)",
        type: "text",
        required: false,
      },
      {
        name: "dob",
        label: "Date of Birth",
        type: "date",
        required: true,
      },
      {
        name: "country_of_birth",
        label: "Country of Birth",
        type: "text",
        required: true,
      },
      {
        name: "petitioner_address",
        label: "Petitioner Address",
        type: "text",
        required: true,
      },
      {
        name: "current_immigration_status",
        label: "Current Immigration Status",
        type: "text",
        required: true,
        placeholder: "e.g. Undocumented, B-2 overstay, LPR",
      },
      {
        name: "qualifying_crime",
        label: "Qualifying Crime",
        type: "select",
        required: true,
        options: [
          "Domestic Violence",
          "Sexual Assault",
          "Stalking",
          "Kidnapping",
          "False Imprisonment",
          "Felonious Assault",
          "Other Qualifying Crime",
        ],
      },
      {
        name: "crime_date_location",
        label: "Crime Date and Location",
        type: "text",
        required: true,
        placeholder: "Approximate date and city/state where crime occurred",
      },
      {
        name: "law_enforcement_agency",
        label: "Law Enforcement Agency",
        type: "text",
        required: true,
        placeholder:
          "Name of police department, DA's office, or other certifying agency",
      },
      {
        name: "i918b_certifying_official",
        label: "I-918B Certifying Official",
        type: "text",
        required: true,
        placeholder:
          "Name and title of the official who signed the I-918B certification",
      },
      {
        name: "helpfulness_facts",
        label: "Helpfulness to Law Enforcement",
        type: "textarea",
        required: true,
        placeholder:
          "How has the petitioner been helpful, is being helpful, or is likely to be helpful to law enforcement in the investigation or prosecution of the qualifying crime?",
      },
      {
        name: "crime_facts",
        label: "Crime Facts",
        type: "textarea",
        required: true,
        placeholder:
          "Describe the qualifying criminal activity the petitioner suffered — timeline, what happened, impact on petitioner...",
      },
      {
        name: "inadmissibility_waivers",
        label: "Inadmissibility Grounds & Waivers",
        type: "textarea",
        required: false,
        placeholder:
          "Any grounds of inadmissibility and the I-192 waiver requested, if applicable...",
      },
      {
        name: "family_derivatives",
        label: "Derivative Family Members",
        type: "textarea",
        required: false,
        placeholder:
          "List any qualifying family members being included as derivative U visa petitioners (I-918A): Name, relationship, DOB, country of birth...",
      },
      {
        name: "evidence_tabs",
        label: "Evidence Tab List",
        type: "textarea",
        required: true,
        placeholder:
          "Tab A: Form G-1650\nTab B: Form G-28\nTab C: Form I-918\nTab D: Form I-918B — Law Enforcement Certification\nTab E: Petitioner identity documents\nTab F: Personal statement / affidavit\nTab G: Evidence of qualifying criminal activity\nTab H: Evidence of helpfulness to law enforcement\nTab I: I-192 waiver (if applicable)",
      },
    ],
    steps: [
      {
        title: "Petitioner",
        fields: [
          "petitioner_name",
          "a_number",
          "dob",
          "country_of_birth",
          "petitioner_address",
          "current_immigration_status",
        ],
      },
      {
        title: "Crime & Certification",
        fields: [
          "qualifying_crime",
          "crime_date_location",
          "law_enforcement_agency",
          "i918b_certifying_official",
        ],
      },
      {
        title: "Helpfulness & Facts",
        fields: ["helpfulness_facts", "crime_facts", "inadmissibility_waivers"],
      },
      {
        title: "Family Derivatives",
        fields: ["family_derivatives"],
      },
      {
        title: "Evidence",
        fields: ["evidence_tabs"],
      },
    ],
    system_prompt:
      "You are an expert US immigration attorney specializing in U visa cases. Generate a professional USCIS cover letter for an I-918 U Nonimmigrant Status petition. STRUCTURE: (1) Today's date, (2) USCIS Vermont Service Center address (U visa filings), (3) RE: I-918 U Visa Petition — petitioner name, qualifying crime, (4) Dear Officer, (5) Opening identifying petitioner and the qualifying crime suffered, (6) U visa eligibility paragraph citing INA 101(a)(15)(U) — four statutory requirements: suffered qualifying criminal activity, suffered substantial abuse, has been/is being/is likely to be helpful to law enforcement, qualifying crime violated U.S. law, (7) Facts paragraph describing the crime and petitioner's suffering, (8) Helpfulness paragraph describing cooperation with law enforcement and I-918B certification, (9) Inadmissibility paragraph and waiver arguments if applicable, (10) Derivative family members if included, (11) Evidence tab list, (12) Request for approval, (13) Signature block. Do NOT invent any facts not provided.",
  },
  {
    id: "22",
    name: "I-589 Asylum Cover Letter",
    slug: "i589-cover-letter",
    description:
      "USCIS cover letter for I-589 Application for Asylum and Withholding of Removal",
    icon: "Globe",
    category: "Inmigración",
    outputType: "Cover Letter",
    variables: [
      {
        name: "applicant_name",
        label: "Applicant Full Name",
        type: "text",
        required: true,
      },
      {
        name: "a_number",
        label: "A-Number (if any)",
        type: "text",
        required: false,
      },
      {
        name: "dob",
        label: "Date of Birth",
        type: "date",
        required: true,
      },
      {
        name: "country_of_origin",
        label: "Country of Origin",
        type: "text",
        required: true,
      },
      {
        name: "nationality",
        label: "Nationality",
        type: "text",
        required: true,
      },
      {
        name: "date_of_entry",
        label: "Date of Entry into U.S.",
        type: "date",
        required: true,
      },
      {
        name: "port_of_entry",
        label: "Port of Entry",
        type: "text",
        required: true,
      },
      {
        name: "current_status",
        label: "Current Immigration Status",
        type: "text",
        required: true,
      },
      {
        name: "asylum_grounds",
        label: "Asylum Grounds",
        type: "textarea",
        required: true,
        placeholder:
          "Check all that apply and explain: Race / Religion / Nationality / Political Opinion / Particular Social Group. Identify the specific protected ground and why the applicant is targeted...",
      },
      {
        name: "persecutor",
        label: "Persecutor",
        type: "textarea",
        required: true,
        placeholder:
          "Who is the persecutor? Government, non-government actor that the government is unable or unwilling to control?",
      },
      {
        name: "past_persecution",
        label: "Past Persecution",
        type: "textarea",
        required: true,
        placeholder:
          "Describe specific incidents of past persecution — dates, what happened, injuries, threats, who was responsible...",
      },
      {
        name: "well_founded_fear",
        label: "Well-Founded Fear of Future Persecution",
        type: "textarea",
        required: true,
        placeholder:
          "Describe the well-founded fear of future persecution if returned — what will happen and why...",
      },
      {
        name: "country_conditions",
        label: "Country Conditions",
        type: "textarea",
        required: true,
        placeholder:
          "Describe the general country conditions supporting the asylum claim — human rights reports, news articles, State Department reports...",
      },
      {
        name: "derivatives",
        label: "Derivative Applicants",
        type: "textarea",
        required: false,
        placeholder:
          "List any derivative applicants (spouse and/or children under 21 included in I-589): Name, relationship, DOB, country of birth...",
      },
      {
        name: "evidence_tabs",
        label: "Evidence Tab List",
        type: "textarea",
        required: true,
        placeholder:
          "Tab A: Form G-1650\nTab B: Form G-28\nTab C: Form I-589\nTab D: Applicant identity documents and passport\nTab E: Applicant declaration / personal statement\nTab F: Supporting affidavits from witnesses\nTab G: Country conditions evidence (State Dept reports, news, NGO reports)\nTab H: Evidence of past persecution (police reports, medical records, photos)\nTab I: Evidence of political/religious/social group membership",
      },
    ],
    steps: [
      {
        title: "Principal Applicant",
        fields: [
          "applicant_name",
          "a_number",
          "dob",
          "country_of_origin",
          "nationality",
          "date_of_entry",
          "port_of_entry",
          "current_status",
        ],
      },
      {
        title: "Asylum Basis",
        fields: ["asylum_grounds", "persecutor", "past_persecution", "well_founded_fear"],
      },
      {
        title: "Country Conditions",
        fields: ["country_conditions"],
      },
      {
        title: "Derivative Applicants",
        fields: ["derivatives"],
      },
      {
        title: "Evidence",
        fields: ["evidence_tabs"],
      },
    ],
    system_prompt:
      "You are an expert US immigration attorney specializing in asylum law. Generate a professional USCIS asylum cover letter for an I-589 Application for Asylum and Withholding of Removal. STRUCTURE: (1) Today's date, (2) USCIS Asylum Office or address (note: affirmative asylum filings go to USCIS Asylum Office), (3) RE: I-589 Asylum Application — applicant name, A-Number if any, country of origin, (4) Dear Officer, (5) Opening identifying applicant and country of origin, (6) Legal standard paragraph citing INA 101(a)(42) — refugee definition: persecution on account of race, religion, nationality, political opinion, or particular social group; also cite withholding standard, (7) Past persecution paragraph — specific incidents, dates, persecutors, (8) Well-founded fear paragraph — what will happen if returned and why, (9) Country conditions paragraph corroborating the fear with external evidence, (10) Derivative applicants if included, (11) Evidence tab list, (12) Request for asylum grant, (13) Signature block. Do NOT invent any facts not provided. Tone should be professional and persuasive.",
  },
  {
    id: "23",
    name: "N-400 Naturalization Cover Letter",
    slug: "n400-cover-letter",
    description: "USCIS cover letter for N-400 Application for Naturalization",
    icon: "Star",
    category: "Inmigración",
    outputType: "Cover Letter",
    variables: [
      {
        name: "applicant_name",
        label: "Applicant Full Name",
        type: "text",
        required: true,
      },
      {
        name: "a_number",
        label: "A-Number",
        type: "text",
        required: true,
      },
      {
        name: "dob",
        label: "Date of Birth",
        type: "date",
        required: true,
      },
      {
        name: "country_of_birth",
        label: "Country of Birth",
        type: "text",
        required: true,
      },
      {
        name: "applicant_address",
        label: "Applicant Address",
        type: "text",
        required: true,
      },
      {
        name: "lpr_since",
        label: "LPR (Green Card) Since Date",
        type: "date",
        required: true,
      },
      {
        name: "nat_basis",
        label: "Naturalization Basis",
        type: "select",
        required: true,
        options: [
          "5-year LPR — General",
          "3-year LPR — Married to USC",
          "Military Service",
          "Other",
        ],
      },
      {
        name: "spouse_citizen",
        label: "U.S. Citizen Spouse (if 3-year basis)",
        type: "text",
        required: false,
        placeholder: "If 3-year basis: U.S. Citizen spouse name and citizenship date",
      },
      {
        name: "continuous_residence_issues",
        label: "Continuous Residence Issues",
        type: "textarea",
        required: false,
        placeholder:
          "Any trips outside the U.S. over 6 months, or other continuous residence issues? Explain and provide good cause if applicable...",
      },
      {
        name: "good_moral_character_issues",
        label: "Good Moral Character Issues",
        type: "textarea",
        required: false,
        placeholder:
          "Any arrests, convictions, tax issues, failure to support dependents, or other GMC issues? Describe and explain...",
      },
      {
        name: "english_civics_exemption",
        label: "English / Civics Exemption (if applicable)",
        type: "textarea",
        required: false,
        placeholder:
          "If claiming English or civics exemption (disability, age+years), describe the basis here. Otherwise leave blank.",
      },
      {
        name: "evidence_tabs",
        label: "Evidence Tab List",
        type: "textarea",
        required: true,
        placeholder:
          "Tab A: Form G-1650\nTab B: Form G-28\nTab C: Form N-400\nTab D: Copy of Permanent Resident Card (front and back)\nTab E: Passport photos and copy of ID\nTab F: Travel history documentation\nTab G: Tax returns (last 5 years)\nTab H: Marriage certificate (if 3-year basis)\nTab I: Divorce decrees for any prior marriages\nTab J: Arrest/conviction records and dispositions (if applicable)",
      },
    ],
    steps: [
      {
        title: "Applicant",
        fields: [
          "applicant_name",
          "a_number",
          "dob",
          "country_of_birth",
          "applicant_address",
          "lpr_since",
        ],
      },
      {
        title: "Naturalization Basis",
        fields: [
          "nat_basis",
          "spouse_citizen",
          "continuous_residence_issues",
        ],
      },
      {
        title: "Eligibility & Character",
        fields: [
          "good_moral_character_issues",
          "english_civics_exemption",
        ],
      },
      {
        title: "Evidence",
        fields: ["evidence_tabs"],
      },
    ],
    system_prompt:
      "You are an expert US immigration attorney. Generate a professional USCIS cover letter for an N-400 Application for Naturalization. STRUCTURE: (1) Today's date, (2) USCIS field office address, (3) RE: N-400 Naturalization — applicant name, A-Number, LPR date, (4) Dear Officer, (5) Opening identifying applicant and basis for naturalization (5-year or 3-year), (6) Eligibility paragraph: LPR since date, continuous residence, physical presence (18 months for 3-year, 30 months for 5-year), (7) Good moral character paragraph — if any issues, address them forthrightly; if none, state the record is clean, (8) Any trip/residence issues addressed, (9) Evidence tab list, (10) Request for approval and interview scheduling, (11) Signature block. Do NOT invent any facts not provided.",
  },
  {
    id: "24",
    name: "I-765 Employment Authorization Cover Letter",
    slug: "i765-cover-letter",
    description:
      "USCIS cover letter for I-765 Application for Employment Authorization Document (EAD)",
    icon: "Briefcase",
    category: "Inmigración",
    outputType: "Cover Letter",
    variables: [
      {
        name: "applicant_name",
        label: "Applicant Full Name",
        type: "text",
        required: true,
      },
      {
        name: "a_number",
        label: "A-Number (if any)",
        type: "text",
        required: false,
      },
      {
        name: "dob",
        label: "Date of Birth",
        type: "date",
        required: true,
      },
      {
        name: "applicant_address",
        label: "Applicant Address",
        type: "text",
        required: true,
      },
      {
        name: "ead_category",
        label: "EAD Eligibility Category",
        type: "select",
        required: true,
        options: [
          "(c)(9) — Pending I-485 Adjustment",
          "(c)(14) — Deferred Action",
          "(c)(33) — DACA Renewal",
          "(a)(5) — Asylee",
          "(a)(12) — TPS",
          "(c)(10) — Withholding of Removal granted",
          "(c)(8) — Pending Asylum (180+ days)",
          "Other — specify in notes",
        ],
      },
      {
        name: "underlying_case",
        label: "Underlying Case / Receipt Number",
        type: "text",
        required: true,
        placeholder:
          "Describe the underlying petition or status (e.g. I-485 receipt number, DACA case number, asylum receipt...)",
      },
      {
        name: "ead_notes",
        label: "Additional Notes",
        type: "textarea",
        required: false,
        placeholder:
          "Any additional facts relevant to the EAD request (renewal, DACA grant date, etc.)...",
      },
      {
        name: "evidence_tabs",
        label: "Evidence Tab List",
        type: "textarea",
        required: true,
        placeholder:
          "Tab A: Form G-1650\nTab B: Form G-28\nTab C: Form I-765 with eligibility category\nTab D: Copy of prior EAD (if renewal)\nTab E: Receipt notice for underlying petition\nTab F: Applicant identity documents and photos",
      },
    ],
    steps: [
      {
        title: "Applicant",
        fields: ["applicant_name", "a_number", "dob", "applicant_address"],
      },
      {
        title: "EAD Category",
        fields: ["ead_category", "underlying_case", "ead_notes"],
      },
      {
        title: "Evidence",
        fields: ["evidence_tabs"],
      },
    ],
    system_prompt:
      "You are an expert US immigration attorney. Generate a professional USCIS cover letter for an I-765 Application for Employment Authorization Document. STRUCTURE: (1) Today's date, (2) USCIS address appropriate for I-765, (3) RE: I-765 EAD Application — applicant name, eligibility category, (4) Dear Officer, (5) Opening identifying applicant and eligibility category with statutory/regulatory citation, (6) Eligibility paragraph explaining basis for EAD (cite 8 C.F.R. 274a.12 category), (7) Underlying case status if applicable, (8) Evidence tab list, (9) Request for approval, (10) Signature block. Do NOT invent any facts not provided.",
  },
  {
    id: "25",
    name: "I-131 Advance Parole / Travel Document Cover Letter",
    slug: "i131-cover-letter",
    description:
      "USCIS cover letter for I-131 Application for Travel Document (Advance Parole or Refugee Travel Document)",
    icon: "Plane",
    category: "Inmigración",
    outputType: "Cover Letter",
    variables: [
      {
        name: "applicant_name",
        label: "Applicant Full Name",
        type: "text",
        required: true,
      },
      {
        name: "a_number",
        label: "A-Number (if any)",
        type: "text",
        required: false,
      },
      {
        name: "dob",
        label: "Date of Birth",
        type: "date",
        required: true,
      },
      {
        name: "applicant_address",
        label: "Applicant Address",
        type: "text",
        required: true,
      },
      {
        name: "document_type",
        label: "Document Type Requested",
        type: "select",
        required: true,
        options: [
          "Advance Parole (pending I-485)",
          "Refugee Travel Document (asylee/refugee)",
          "Re-entry Permit (LPR abroad)",
        ],
      },
      {
        name: "underlying_petition",
        label: "Underlying Petition / Status",
        type: "text",
        required: true,
        placeholder:
          "I-485 receipt number, asylum approval, or LPR A-Number",
      },
      {
        name: "travel_purpose",
        label: "Purpose of Travel",
        type: "textarea",
        required: true,
        placeholder:
          "Why is travel necessary? Emergency family matter, business, medical, etc.?",
      },
      {
        name: "destination_countries",
        label: "Destination Countries",
        type: "text",
        required: true,
        placeholder: "Country/countries to be visited",
      },
      {
        name: "estimated_departure",
        label: "Estimated Departure Date",
        type: "date",
        required: false,
      },
      {
        name: "estimated_return",
        label: "Estimated Return Date",
        type: "date",
        required: false,
      },
      {
        name: "evidence_tabs",
        label: "Evidence Tab List",
        type: "textarea",
        required: true,
        placeholder:
          "Tab A: Form G-1650\nTab B: Form G-28\nTab C: Form I-131\nTab D: Copy of passport and any prior travel documents\nTab E: Receipt notice for pending I-485 (if advance parole)\nTab F: Evidence of emergency / purpose of travel (medical records, death certificate, business letter, etc.)",
      },
    ],
    steps: [
      {
        title: "Applicant",
        fields: [
          "applicant_name",
          "a_number",
          "dob",
          "applicant_address",
          "document_type",
        ],
      },
      {
        title: "Travel Details",
        fields: [
          "underlying_petition",
          "travel_purpose",
          "destination_countries",
          "estimated_departure",
          "estimated_return",
        ],
      },
      {
        title: "Evidence",
        fields: ["evidence_tabs"],
      },
    ],
    system_prompt:
      "You are an expert US immigration attorney. Generate a professional USCIS cover letter for an I-131 Application for Travel Document. STRUCTURE: (1) Today's date, (2) USCIS address, (3) RE: I-131 Travel Document — applicant name, document type requested, (4) Dear Officer, (5) Opening identifying applicant and type of travel document requested, (6) Eligibility paragraph — for advance parole: pending I-485, 8 C.F.R. 212.5; for refugee travel document: asylum/refugee status, (7) Purpose of travel paragraph — destination, reason, duration, (8) Important note for advance parole: advise that travel without approved AP for pending I-485 may constitute abandonment of the application, (9) Evidence tab list, (10) Request for expedited processing if emergency, (11) Request for approval, (12) Signature block. Do NOT invent any facts not provided.",
  },
  {
    id: "26",
    name: "I-539 Extension / Change of Status Cover Letter",
    slug: "i539-cover-letter",
    description:
      "USCIS cover letter for I-539 Application to Extend or Change Nonimmigrant Status",
    icon: "RefreshCw",
    category: "Inmigración",
    outputType: "Cover Letter",
    variables: [
      {
        name: "applicant_name",
        label: "Applicant Full Name",
        type: "text",
        required: true,
      },
      {
        name: "a_number",
        label: "A-Number (if any)",
        type: "text",
        required: false,
      },
      {
        name: "dob",
        label: "Date of Birth",
        type: "date",
        required: true,
      },
      {
        name: "applicant_address",
        label: "Applicant Address",
        type: "text",
        required: true,
      },
      {
        name: "current_status",
        label: "Current Nonimmigrant Status",
        type: "text",
        required: true,
        placeholder: "e.g. B-2 Tourist, F-1 Student, J-2 Dependent",
      },
      {
        name: "authorized_stay_expiry",
        label: "Authorized Stay Expiration Date (I-94)",
        type: "date",
        required: true,
      },
      {
        name: "request_type",
        label: "Request Type",
        type: "select",
        required: true,
        options: [
          "Extend current nonimmigrant status",
          "Change to B-2 Tourist",
          "Change to F-1 Student",
          "Change to other status",
        ],
      },
      {
        name: "desired_status",
        label: "Desired New Status (if changing)",
        type: "text",
        required: false,
        placeholder: "If changing, desired new status",
      },
      {
        name: "reason_for_extension",
        label: "Reason for Extension / Change",
        type: "textarea",
        required: true,
        placeholder:
          "Why is the extension or change of status needed? Medical treatment, studies, family situation, etc.?",
      },
      {
        name: "maintained_status",
        label: "Maintained Status Confirmation",
        type: "textarea",
        required: true,
        placeholder:
          "Confirm the applicant has maintained lawful status since entry — no unauthorized employment, no violations...",
      },
      {
        name: "derivatives",
        label: "Co-Applicants (Derivatives)",
        type: "textarea",
        required: false,
        placeholder:
          "Any derivative co-applicants on the same I-539? Name, relationship, DOB, A-Number...",
      },
      {
        name: "evidence_tabs",
        label: "Evidence Tab List",
        type: "textarea",
        required: true,
        placeholder:
          "Tab A: Form G-1650\nTab B: Form G-28\nTab C: Form I-539\nTab D: Copy of I-94 and visa stamp\nTab E: Passport copy\nTab F: Evidence of reason for extension (medical records, school enrollment, etc.)\nTab G: Financial evidence (bank statements, sponsor letter)\nTab H: Ties to home country (property, employment abroad, family)",
      },
    ],
    steps: [
      {
        title: "Applicant",
        fields: [
          "applicant_name",
          "a_number",
          "dob",
          "applicant_address",
          "current_status",
          "authorized_stay_expiry",
        ],
      },
      {
        title: "Request",
        fields: [
          "request_type",
          "desired_status",
          "reason_for_extension",
          "maintained_status",
        ],
      },
      {
        title: "Derivatives",
        fields: ["derivatives"],
      },
      {
        title: "Evidence",
        fields: ["evidence_tabs"],
      },
    ],
    system_prompt:
      "You are an expert US immigration attorney. Generate a professional USCIS cover letter for an I-539 Application to Extend or Change Nonimmigrant Status. STRUCTURE: (1) Today's date, (2) USCIS address, (3) RE: I-539 — applicant name, current status, extension or change requested, (4) Dear Officer, (5) Opening identifying applicant, current nonimmigrant status, and whether this is an extension or a change, (6) Eligibility paragraph — applicant has maintained lawful status, filed timely, (7) Reason paragraph explaining the purpose and necessity of the extension or change, (8) If change of status: address eligibility for the requested status, (9) Financial ability to remain without working unlawfully, (10) Ties to home country if relevant, (11) Evidence tab list, (12) Request for approval, (13) Signature block. Do NOT invent any facts not provided.",
  },
];

const translationTemplates: Template[] = [
  {
    id: "14",
    name: "Certified Translation (Spanish → English)",
    slug: "certified-translation",
    description:
      "Translate affidavits, declarations, and USCIS documents from Spanish to English and receive a complete package: English translation + original + USCIS-compliant certificate of translation",
    icon: "Languages",
    category: "Immigration — Translation",
    outputType: "Translation Package",
    endpoint: "/api/translate",
    system_prompt: "",
    variables: [
      {
        name: "document_type",
        label: "Document Type",
        type: "select",
        required: true,
        options: [
          "Affidavit / Sworn Statement",
          "Personal Declaration",
          "Support Letter / Carta de Apoyo",
          "Birth Certificate / Acta de Nacimiento",
          "Marriage Certificate / Acta de Matrimonio",
          "Divorce Decree / Decreto de Divorcio",
          "Death Certificate / Acta de Defunción",
          "Police Records / Antecedentes Penales",
          "Court Document / Documento Judicial",
          "Power of Attorney / Poder Notarial",
          "Medical Records / Expediente Médico",
          "Other / Otro",
        ],
      },
      {
        name: "spanish_variant",
        label: "Spanish Dialect / Region of Origin",
        type: "select",
        required: true,
        options: [
          "Mexican Spanish",
          "Colombian Spanish",
          "Central American Spanish (Guatemala, Honduras, El Salvador, Nicaragua)",
          "South American Spanish (Peru, Bolivia, Ecuador)",
          "Southern Cone Spanish (Argentina, Chile, Uruguay)",
          "Caribbean Spanish (Dominican Republic, Cuba, Puerto Rico)",
          "General / Standard Spanish",
        ],
      },
      {
        name: "subject_name",
        label: "Full Name of Document Subject",
        type: "text",
        required: true,
        placeholder: "e.g. María Elena García Pérez",
      },
      {
        name: "original_text",
        label: "Original Spanish Text",
        type: "textarea",
        required: true,
        placeholder: "Paste the full Spanish text here...",
      },
      {
        name: "translator_name",
        label: "Translator / Certifier Name",
        type: "text",
        required: true,
        placeholder: "e.g. Aaron G. Christensen",
      },
      {
        name: "translator_qualifications",
        label: "Translator Qualifications",
        type: "text",
        required: true,
        placeholder: "e.g. Certified paralegal fluent in Spanish and English with 10+ years immigration experience",
      },
    ],
    steps: [
      {
        title: "Document Details",
        fields: ["document_type", "spanish_variant", "subject_name"],
      },
      {
        title: "Original Text",
        fields: ["original_text"],
      },
      {
        title: "Translator Information",
        fields: ["translator_name", "translator_qualifications"],
      },
    ],
  },
];

export const templates: Template[] = [...baseTemplates, ...immigrationTemplates, ...translationTemplates];

export function getTemplateBySlug(slug: string): Template | undefined {
  return templates.find((t) => t.slug === slug);
}
