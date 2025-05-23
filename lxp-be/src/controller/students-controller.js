import { ResponseError } from "../error/response-error.js";
import studentService from "../service/student-service.js";

const getStudents = async (req, res, next) => {
  try {
    const result = await studentService.getInstructorStudents(
      req.user,
      req.query
    );
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

const getDetailStudent = async (req, res, next) => {
  try {
    const result = await studentService.getDetailStudent(req.user, {
      studentId: req.params.studentId,
    });
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

export default {
  getStudents,
  getDetailStudent,
};
