import fs from "node:fs";
import path from "node:path";
const __dirname = import.meta.dirname;

const interceptors = [];

const files = fs
    .readdirSync(path.join(__dirname, "."))
    .filter((file) => file.endsWith(".js") && file !== "index.js");

for (const file of files) {
    const interceptorPath = path.join(__dirname, file);
    const interceptor = await import(interceptorPath).then((i) => i.default);
    interceptors.push(interceptor);
}

export default interceptors;
