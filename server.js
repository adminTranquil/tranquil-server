import express from "express";
import cors from "cors";
import contactRoutes from "./routes/contact.js";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:3000", "https://thetranquilhospitalsltd.co.ke"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", contactRoutes);

app.get("/", (req, res) => {
  res.send("Tranquil Hospital Server is up and running!");
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
