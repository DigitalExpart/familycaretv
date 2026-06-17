export interface Task {
  id: string;
  userId: string;
  patientId?: string;
  title: string;
  category: 'MORNING' | 'DAYTIME' | 'EVENING';
  completed: boolean;
  date: string;
}

export interface DailyJournal {
  id: string;
  userId: string;
  content: string;
  date: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  schoolName?: string;
  grade?: string;
  teacher?: string;
  teacherPhone?: string;
  schoolHours?: string;
  busNumber?: string;
  tasks?: ChildTask[];
  events?: ChildCalendarEvent[];
  notes?: ChildNote[];
}

export interface ChildTask {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}

export interface ChildCalendarEvent {
  id: string;
  title: string;
  date: string;
}

export interface ChildNote {
  id: string;
  content: string;
}

export interface MusicCategory {
  id: string;
  name: string;
  tracks?: MusicTrack[];
}

export interface MusicTrack {
  id: string;
  title: string;
  language: string;
  youtubeUrl?: string;
  audioUrl?: string;
  description?: string;
}

export interface ColoringPage {
  id: string;
  title: string;
  imageUrl: string;
  language: string;
}

export interface Pet {
  id: string;
  name: string;
  breed?: string;
  age?: number;
  weight?: number;
  veterinarians?: Veterinarian[];
  clinics?: EmergencyClinic[];
  vaccinations?: PetVaccination[];
  medications?: PetMedication[];
  notes?: PetNote[];
}

export interface Veterinarian {
  id: string;
  name: string;
  phone?: string;
}

export interface EmergencyClinic {
  id: string;
  name: string;
  phone?: string;
}

export interface PetVaccination {
  id: string;
  vaccineName: string;
  dateGiven?: string;
  nextDue?: string;
}

export interface PetMedication {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
}

export interface PetNote {
  id: string;
  content: string;
}
