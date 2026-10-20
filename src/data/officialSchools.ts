export interface OfficialSchool {
  id: string;
  name: string;
  educationLevel: string;
  city: string;
  state: string;
  active: boolean;
  studentRegistrationAllowed: boolean;
}

export const OFFICIAL_STUDENT_SCHOOLS: OfficialSchool[] = [
  {
    id: 'sch_sec_tec_1',
    name: 'Escuela Secundaria Técnica 1 Luis Donaldo Colosio',
    educationLevel: 'Secundaria',
    city: 'Caborca',
    state: 'Sonora',
    active: true,
    studentRegistrationAllowed: true,
  },
  {
    id: 'sch_sec_tec_8',
    name: 'Escuela Secundaria Técnica 8 "Profr Armando E. Estrella Ortega"',
    educationLevel: 'Secundaria',
    city: 'Caborca',
    state: 'Sonora',
    active: true,
    studentRegistrationAllowed: true,
  },
  {
    id: 'sch_sec_gral_caborca',
    name: 'Escuela Secundaria General Heroes De Caborca',
    educationLevel: 'Secundaria',
    city: 'Caborca',
    state: 'Sonora',
    active: true,
    studentRegistrationAllowed: true,
  },
  {
    id: 'sch_sec_est_6',
    name: 'Escuela Secundaria Estatal No.6 Coronel José María Girón',
    educationLevel: 'Secundaria',
    city: 'Caborca',
    state: 'Sonora',
    active: true,
    studentRegistrationAllowed: true,
  },
];

export const ALLOWED_STUDENT_SCHOOL_IDS = OFFICIAL_STUDENT_SCHOOLS.map(s => s.id);
