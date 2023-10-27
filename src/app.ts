import express from "express";
import dotenv from "dotenv";
dotenv.config();
import config from "config";
import colors from "colors";
import fileupload from "express-fileupload";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import hpp from "hpp";
import cors from "cors";
import xssClean from "./middleware/xssClean";
import rateLimiter from "./middleware/rateLimiter";
import errorHandler from "./middleware/error";
import connectDB from "../config/db";

const port = process.env.PORT ?? config.get<number>("port");
const environment = process.env.NODE_ENV ?? config.get<string>("environment");

// Connect to database
connectDB();

// Routes
import bootcamps from "./routes/bootcamps";
import courses from "./routes/courses";
import auth from "./routes/auth";
import users from "./routes/users";
import reviews from "./routes/reviews";

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// File uploading
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xssClean);

// Rate limiting
app.use(rateLimiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS (Cross-Origin Resource Sharing)
// Use only for development or public API
app.use(cors());

// Set static folder
app.use(express.static("public"));

// Mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

app.use(errorHandler);

const serverStatus = `Server is running in ${environment} mode on port ${port}`;
const server = app.listen(port, () => {
  console.log(colors.yellow.bold(serverStatus));
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error, promise) => {
  console.log(colors.red(`Error: ${err.message}`));
  // Close server & exit process
  server.close(() => process.exit(1));
});
