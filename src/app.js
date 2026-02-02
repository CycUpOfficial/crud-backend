import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import citiesRoutes from "./routes/cities.routes.js";
import { requireAuth } from "./middlewares/auth.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const setupBullBoard = async () => {
	if (process.env.NODE_ENV === "production") return;

	const { createBullBoard } = await import("@bull-board/api");
	const { BullMQAdapter } = await import("@bull-board/api/bullMQAdapter");
	const { ExpressAdapter } = await import("@bull-board/express");
	const { emailQueue } = await import("./queues/email.queue.js");

	const serverAdapter = new ExpressAdapter();
	serverAdapter.setBasePath("/admin/queues");

	createBullBoard({
		queues: [new BullMQAdapter(emailQueue)],
		serverAdapter
	});

	app.use("/admin/queues", serverAdapter.getRouter());
};

void setupBullBoard();

app.use("/api", requireAuth);
app.use("/api", healthRoutes);
app.use("/api", authRoutes);
app.use("/api", profileRoutes);
app.use("/api", categoriesRoutes);
app.use("/api", citiesRoutes);

app.use(errorHandler);

export default app;