import morgan from "morgan";
import express from "express";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.use("/api/chat", chatRoutes);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
