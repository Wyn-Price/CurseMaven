import { config } from "dotenv";
import http from "http";
import app from "./app";
config()

const server = http.createServer(app);

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

process.on('SIGINT', () => {
  console.info("Interrupted");
  process.exit(0);
});

export default server