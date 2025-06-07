// entry file for node js system
import dotenv from "dotenv";
import { app } from "./app.js";
import sequelize from "./db/connection.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

// testing postgres connection
app.get("/test", async (req, res) => {
  try {
    await sequelize.authenticate();

    // const [results] = await sequelize.query("SELECT current_database()");

    res.send(`Connected to database: ${sequelize.config.database}`);
  } catch (error) {
    console.error("Database connection test failed:", error);
    res.status(500).send("Database connection failed");
  }
});

// setting up the server with database synchronization to prevent abnormalities b/w model and table in db
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection successful");

    //! sync can be a destructive operation, thus not suited for production. For production, use migration instead
    if (process.env.NODE_ENV === "development") {
      sequelize.sync({ alter: true }); // first check the current state of the table in the database, after that make neccesaary changes to match the model
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Error starting the server:", error);
    process.exit(1); // close the node process
  }
};

startServer();

// health check endpoint
app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: "healthy",
      database: sequelize.config.database,
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
    });
  }
});

export default app; // safety measures for deployment
