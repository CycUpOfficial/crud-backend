import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import citiesRoutes from "./routes/cities.routes.js";
import itemsRoutes from "./routes/items.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import ratingsRoutes from "./routes/ratings.routes.js";
import { requireAuth } from "./middlewares/auth.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const allowedOrigins = new Set([env.frontend.url]);
const corsOptions = {
	origin: (origin, callback) => {
		if (!origin) {
			callback(null, true);
			return;
		}
		if (allowedOrigins.has(origin)) {
			callback(null, true);
			return;
		}
		callback(new Error(`CORS blocked for origin: ${origin}`));
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
if (env.storage.driver === "local") {
	app.use("/uploads", express.static("uploads"));
}

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

if (env.nodeEnv !== "production") {
	app.get("/api/docs", (req, res) => {
		res.sendFile(path.resolve(__dirname, "..", "cycup.yml"));
	});
}

app.use("/api", requireAuth);
app.use("/api", dashboardRoutes);
app.use("/api", healthRoutes);
app.use("/api", authRoutes);
app.use("/api", profileRoutes);
app.use("/api", categoriesRoutes);
app.use("/api", citiesRoutes);
app.use("/api", itemsRoutes);
app.use("/api", adminRoutes);
app.use("/api/items/:itemId/ratings", ratingsRoutes);

app.use(errorHandler);



export default app;