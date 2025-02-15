import "dotenv/config";
import connectDB from "./db/index.js";
import app from "./app.js";

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error connecting to MONGO DB", error);
    });

    app.listen(process.env.PORT, () => {
      console.log("⚙️ Server is started on PORT", process.env.PORT);
    });
  })
  .catch((err) => {
    console.log("Error connecting to MONGO DB", err);
  });

/** 
import express from "express";

(async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      "Connected to the database",
      connectionInstance.connection.host
    );
    const app = express();
    app.on("error", (error) => {
      console.log("Error connecting to database", error);
    });
    app.listen(process.env.PORT, () => {
      console.log(`App is listening on PORT ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("error connecting the databse", error);
  }
})();

**/
