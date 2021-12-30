import express from "express";

const app = express();

app.get("/welcome", (req, res) => res.send("Hello"))

export default app