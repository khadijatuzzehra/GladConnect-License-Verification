import express from "express";
import dotenv from "dotenv";
import route from "./routes/index.routes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", route);

app.get("/", (req, res) => {
  res.send("Hello from Express using .env!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
