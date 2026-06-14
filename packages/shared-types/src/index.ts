export interface Doctor {
  id: string;
  patientId: string;
  name: string;
  specialty?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface EmergencyContact {
  id: string;
  patientId: string;
  name: string;
  relationship: string;
  phone: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  purpose?: string | null;
  sideEffects?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface MedicationLookupResponse {
  cached: boolean;
  data: {
    purpose: string;
    sideEffects: string;
    warnings: string;
  };
  disclaimer: string;
}

export type EventType = 'APPOINTMENT' | 'MEDICATION' | 'TASK';
export type ReminderStatus = 'ACTIVE' | 'COMPLETED' | 'MISSED';

export interface Event {
  id: string;
  patientId: string;
  title: string;
  description?: string | null;
  type: EventType;
  startDateTime: string | Date;
  reminderMinutes?: number | null;
  status: ReminderStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface PatientNote {
  id: string;
  patientId: string;
  title: string;
  content: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  language: string;
  role: Role;
  
  subscriptionStatus: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  trialEndsAt?: string | Date | null;
  currentPeriodEnd?: string | Date | null;

  createdAt?: string | Date;
  updatedAt?: string | Date;
  patients?: Patient[];
}

export interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string | Date;
  gender?: string | null;
  notes?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  
  // Relations (optional for partial fetches)
  doctors?: Doctor[];
  contacts?: EmergencyContact[];
  medications?: Medication[];
  events?: Event[];
  patientNotes?: PatientNote[];
}
