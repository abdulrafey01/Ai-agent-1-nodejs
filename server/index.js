import morgan from "morgan";
import express from "express";
import chatRoutes from "./routes/chat.routes.js";
import lightingRoutes from "./routes/lighting.routes.js";
import cors from "cors";
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

app.use("/api/chat", chatRoutes);
app.use("/api/lighting", lightingRoutes);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
