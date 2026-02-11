import app from "./app.js";
import { env } from "./config/env.js";

const startServer = async () => {
    app.listen(env.port, () => {
        console.log(`Server running on http://localhost:${env.port}`);
    });
};

void startServer();