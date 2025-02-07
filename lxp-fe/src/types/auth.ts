export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: {
    token: string;
    role: string;
  };
}

interface Training {
  id: number;
  title: string;
  description: string;
  image: string | null;
  status: string;
  averageScore: number;
}

export interface UserData {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar: string;
  trainings: Training[];
  totalTrainings: number;
  overallAverageScore: number;
}

export interface UserResponse {
  data: UserData;
}
