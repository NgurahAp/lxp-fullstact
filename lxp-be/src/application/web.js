import express from "express";
import { errorMiddleware } from "../middleware/error-middleware.js";
import { publicRouter } from "../route/public-api.js";
import { trainingRouter } from "../route/api.js";

const web = express();
// 1. Middleware untuk parsing JSON
web.use(express.json());
// 2. Routers
web.use(publicRouter);
web.use(trainingRouter);

// 3. Error middleware harus TERAKHIR
web.use(errorMiddleware);

export { web };
