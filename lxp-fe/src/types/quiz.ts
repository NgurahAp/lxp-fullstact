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

interface Question {
  question: string;
  options: string[];
}

export interface QuizData {
  id: number;
  title: string;
  quizScore: number;
  createdAt: string | number | Date;
  updatedAt: string | number | Date;
  meeting: Meeting;
}

interface QuizSubmissionAnswer {
  questionIndex: number;
  selectedAnswer?: number;
}

export interface QuizSubmissionPayload {
  answers: QuizSubmissionAnswer[];
}

export interface QuizSubmissionParams {
  quizId: string;
  answers: QuizSubmissionAnswer[];
}

export interface QuizQuestion {
  id: number;
  title: string;
  quizScore: number;
  questions: Question[];
  meeting: Meeting;
}

export interface QuizResponse {
  data: QuizData;
}
