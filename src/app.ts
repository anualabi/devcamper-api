import express from "express";
import dotenv from "dotenv";
dotenv.config();
import config from "config";

// Routes
import bootcamps from "./routes/bootcamps";

const port = process.env.PORT ?? config.get<number>("port");
const environment = process.env.NODE_ENV ?? config.get<string>("environment");

const app = express();

// Mount routers
app.use("/api/v1/bootcamps", bootcamps);

app.listen(port, () => {
  console.log(`Server is running in ${environment} mode on port ${port}`);
});
