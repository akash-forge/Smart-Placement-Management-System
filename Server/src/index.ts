// src/index.ts
import 'dotenv/config'; // loads .env — install with `npm i dotenv` if not already a dependency
import express from 'express';
import path from 'path';
import uploadRouter from './controller/uploadController';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRouter from './routes/userRoute';
import companyRouter from './routes/companyRoute';
import staffRouter from './routes/staffRoute';
import studentRouter from './routes/studentRoute';
import jobRouter from './routes/jobRoute';
import profileRouter from './routes/profileRoute';
import metricsRouter from './routes/metricsRoute';
import certificationRouter from './routes/certificationRoute';
import projectRouter from './routes/projectRoute';
import resumeRouter from './routes/resumeRoute';
import applicationRouter from './routes/applicationRoute';
import { CLIENT_URL, PORT } from './config/env';

const app = express();
app.use(express.json());
app.use(bodyParser.json());

// Was `cors()` with no options — that allows requests from ANY origin.
// Restrict it to your actual frontend via CLIENT_URL in .env
// (falls back to the Vite dev server default if unset).
app.use(cors({ origin: CLIENT_URL, credentials: true }));

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use('/upload', uploadRouter);
app.use('/user', userRouter);
app.use('/company', companyRouter);
app.use('/staff', staffRouter);
app.use('/student', studentRouter);
app.use('/jobs', jobRouter);
app.use('/profile', profileRouter);
app.use('/metrics', metricsRouter);
app.use('/certification', certificationRouter);
app.use('/project', projectRouter);
app.use('/resume', resumeRouter);
app.use('/application', applicationRouter);

// Centralized error handler — controllers can now just `next(error)` on
// unexpected failures instead of every single one repeating its own
// try/catch -> res.status(500).json(...) boilerplate. Existing controllers
// still work unchanged since they already catch and respond themselves;
// this is a safety net for anything that isn't caught.
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
