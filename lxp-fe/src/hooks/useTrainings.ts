import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  CreateTrainingResponse,
  DeleteTrainingResponse,
  DetailTrainingData,
  GetTrainingInstructorResponse,
  TrainingResponse,
  UpdateTrainingParams,
} from "../types/training";
import {
  createTraining,
  deleteTraining,
  getDetailTraining,
  getInstructorDetailTraining,
  getTrainings,
  getTrainingsInstructor,
  updateTraining,
} from "../service/trainingService.ts";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const useGetTrainings = (): UseQueryResult<TrainingResponse, Error> => {
  return useQuery({
    queryKey: ["training"],
    queryFn: async () => {
      const response = await getTrainings();
      const trainingData = response.data;

      return trainingData;
    },
  });
};

export const useGetTrainingsInstructor = (): UseQueryResult<
  GetTrainingInstructorResponse,
  Error
> => {
  return useQuery({
    queryKey: ["trainingInstructor"],
    queryFn: async () => {
      const response = await getTrainingsInstructor();
      const trainingData = response;
      return trainingData;
    },
  });
};

export const useGetDetailTrainings = (
  trainingId: string | undefined
): UseQueryResult<DetailTrainingData, Error> => {
  return useQuery({
    queryKey: ["detailTraining"],
    queryFn: async () => {
      const response = await getDetailTraining(trainingId);
      const detailTrainingData = response.data;

      return detailTrainingData;
    },
  });
};

export const useGetInstructorDetailTrainings = (
  trainingId: string | undefined
): UseQueryResult<DetailTrainingData, Error> => {
  return useQuery({
    queryKey: ["detailTrainingInstructor"],
    queryFn: async () => {
      const response = await getInstructorDetailTraining(trainingId);
      const detailTrainingData = response.data;

      return detailTrainingData;
    },
  });
};

export const useCreateTraining = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (training: FormData) => createTraining(training),

    onSuccess: () => {
      // Invalidate related queries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ["trainingInstructor"],
      });

      // Show success notification
      toast.success("Pelatihan berhasil dibuat");
      navigate(`/instructorCourse`);
    },

    onError: (error: Error) => {
      console.log(error.message);
      toast.error("Gagal membuat pelatihan");
    },
  });
};

export const useUpdateTraining = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<CreateTrainingResponse, Error, UpdateTrainingParams>({
    mutationFn: (params) => updateTraining(params),

    onSuccess: () => {
      // Invalidate related queries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ["updateTraining"],
      });

      // Show success notification
      toast.success("Pelatihan berhasil diedit");
      navigate(`/instructorCourse`);
    },

    onError: (error: Error) => {
      console.log(error.message);
      toast.error("Gagal mengedit pelatihan");
    },
  });
};

export const useDeleteTraining = (trainingId: string | undefined) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<DeleteTrainingResponse, Error>({
    mutationFn: () => deleteTraining(trainingId),

    onSuccess: () => {
      // Invalidate related queries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ["detailTraining"],
      });

      // Show success notification
      toast.success("Pelatihan berhasi dihapus");
      navigate(`/instructorCourse`);
    },

    onError: (error: Error) => {
      console.log(error.message);
      toast.error("Gagal menghapus pelatihan");
    },
  });
};
