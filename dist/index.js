"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const prisma_1 = __importDefault(require("./config/prisma"));
const PORT = process.env.PORT || 5000;
async function main() {
    await prisma_1.default.$connect();
    console.log("Connected to the database successfully.");
    const server = app_1.default.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
    const shutdown = async () => {
        console.log("Shutting down server...");
        await prisma_1.default.$disconnect();
        server.close(() => process.exit(0));
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}
main().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
