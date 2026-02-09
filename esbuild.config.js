import { readFileSync } from "fs";
import { build } from "esbuild";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

await build({
    bundle: true,
    define: {
        __VERSION__: JSON.stringify(packageJson.version),
    },
    entryPoints: ["src/index.js"],
    format: "esm",
    minify: true,
    outfile: "dist/index.js",
    platform: "node",
    target: "node20",
});

console.log(`Built dist/index.js (v${packageJson.version})`);
