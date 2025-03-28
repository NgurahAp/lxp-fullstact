interface Training {
  id: number;
  title: string;
  description: string;
}

interface Meeting {
  id: number;
  title: string;
  meetingDate: string | null;
  training: Training;
}

interface Submission {
  answer: string;
  score: number;
}

export interface ModuleData {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  meeting: Meeting;
  submission: Submission;
}

export interface ModuleResponse {
  data: ModuleData;
}

export interface SubmitModuleResponse {
  data: ModuleData;
}
