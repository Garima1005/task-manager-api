import app from "./app";
import prisma from "./config/prisma";

const PORT = process.env.PORT || 5000;

async function main() {
  await prisma.$connect();

  console.log("Connected to the database successfully.");

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  const shutdown = async () => {
    console.log("Shutting down server...");
    await prisma.$disconnect();
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
