import axios from "axios";
import Cookies from "js-cookie";
import {
  CreateTrainingResponse,
  DetailTrainingResponse,
  GetTrainingInstructorResponse,
  TrainingResponse,
} from "../types/training";
import { API_URL } from "../config/api";

export const getTrainings = async (): Promise<TrainingResponse> => {
  const token = Cookies.get("token");

  try {
    const response = await axios.get(`${API_URL}/student/trainings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Gagal Mengambil data");
      }
      throw new Error(
        error.response?.data?.message || "Terjadi kesalahan pada server"
      );
    }
    throw new Error("Terjadi kesalahan yang tidak diketahui");
  }
};

export const getDetailTraining = async (
  trainingId: string | undefined
): Promise<DetailTrainingResponse> => {
  const token = Cookies.get("token");

  try {
    const response = await axios.get(
      `${API_URL}/student/trainings/${trainingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error("Pelatihan tidak ditemukan");
      }
      throw new Error(
        error.response?.data?.message || "Terjadi kesalahan pada server"
      );
    }
    throw new Error("Terjadi kesalahan yang tidak diketahui");
  }
};

export const getTrainingsInstructor =
  async (): Promise<GetTrainingInstructorResponse> => {
    const token = Cookies.get("token");

    try {
      const response = await axios.get(`${API_URL}/instructor/trainings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("Gagal Mengambil data");
        }
        if (error.response?.status === 403) {
          throw new Error("Anda tidak memiliki hak akses");
        }
        throw new Error(
          error.response?.data?.message || "Terjadi kesalahan pada server"
        );
      }
      throw new Error("Terjadi kesalahan yang tidak diketahui");
    }
  };

export const getInstructorDetailTraining = async (
  trainingId: string | undefined
): Promise<DetailTrainingResponse> => {
  const token = Cookies.get("token");

  try {
    const response = await axios.get(
      `${API_URL}/instructor/trainings/${trainingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error("Anda Tidak Memiliki Hak Akses");
      }
      if (error.response?.status === 404) {
        throw new Error("Training Tidak ditemukan");
      }
      throw new Error(
        error.response?.data?.message || "Terjadi kesalahan pada server"
      );
    }
    throw new Error("Terjadi kesalahan yang tidak diketahui");
  }
};

export const createTraining = async (
  payload: FormData
): Promise<CreateTrainingResponse> => {
  const token = Cookies.get("token");

  try {
    const response = await axios.post(`${API_URL}/trainings`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error("Kamu tidak memiliki hak akses");
      }
      if (error.response?.status === 404) {
        throw new Error("Kamu hanya bisa membuat pelatihan dengan id kamu");
      }
      throw new Error(
        error.response?.data?.message || "Terjadi kesalahan pada server"
      );
    }
    throw new Error("Terjadi kesalahan yang tidak diketahui");
  }
};
