import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import logger from "./utils/logger.utils.js";
import morgan from "morgan";

// routes
import adminRouter from "./routes/admin.routes.js";

// build express app
const app = express();

app.use(
  cors({
    //! cautions change when deploy
    origin: "*",
    // origin: ['https://example.com'],
    credentials: true,
  })
);

const morganFormat = ":method :url :status :response-time ms";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes
app.use("/api/v1/admin", adminRouter);

export { app };
