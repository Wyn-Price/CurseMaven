import { config } from "dotenv";
import http from "http";
import app from "./app";
config()

const server = http.createServer(app);

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});