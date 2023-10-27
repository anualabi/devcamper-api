import mongoose from "mongoose";
import config from "config";
import colors from "colors";

const connectDB = async () => {
  const db = config.get<string>("dbUri");

  const connect = await mongoose.connect(db, {
    useNewUrlParser: true,
  } as any);

  const dbStatus = `MongoDB Connected: ${connect.connection.host}`;
  console.log(colors.cyan.underline.bold(dbStatus));
};

export default connectDB;
