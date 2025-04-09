import { DetailStudentResponse, StudentsResponse } from "../types/students";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "../config/api";

export const getStudents = async (): Promise<StudentsResponse> => {
  const token = Cookies.get("token");

  try {
    const response = await axios.get(`${API_URL}/instructorStudents`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Kamu tidak memiliki hak akses Mengambil data");
      }
      throw new Error(
        error.response?.data?.message || "Terjadi kesalahan pada server"
      );
    }
    throw new Error("Terjadi kesalahan yang tidak diketahui");
  }
};

export const getDetailStudent = async (
  studentId: string | undefined
): Promise<DetailStudentResponse> => {
  const token = Cookies.get("token");

  try {
    const response = await axios.get(
      `${API_URL}/instructorStudents/${studentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Kamu tidak memiliki hak akses Mengambil data");
      }
      if (error.response?.status === 404) {
        throw new Error("Data peserta tidak ditemukan");
      }
      throw new Error(
        error.response?.data?.message || "Terjadi kesalahan pada server"
      );
    }
    throw new Error("Terjadi kesalahan yang tidak diketahui");
  }
};
