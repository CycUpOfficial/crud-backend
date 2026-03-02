import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const prismaClientDir = join(process.cwd(), "node_modules", ".prisma", "client");
const prismaClientPkgPath = join(prismaClientDir, "package.json");

if (!existsSync(prismaClientDir)) {
    process.exit(0);
}

let needsWrite = true;
let nextPackageJson = { type: "commonjs" };

if (existsSync(prismaClientPkgPath)) {
    try {
        const current = JSON.parse(readFileSync(prismaClientPkgPath, "utf8"));
        nextPackageJson = { ...current, type: "commonjs" };
        if (current.type === "commonjs") {
            needsWrite = false;
        }
    } catch {
        needsWrite = true;
    }
}

if (needsWrite) {
    writeFileSync(
        prismaClientPkgPath,
        `${JSON.stringify(nextPackageJson, null, 2)}\n`,
        "utf8"
    );
}