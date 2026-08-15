import { execFile } from "node:child_process";
import { mkdir, readFile, rm } from "node:fs/promises";
import { promisify } from "node:util";
import { resolve } from "node:path";

const execFileAsync = promisify(execFile);
const rootDirectory = resolve(import.meta.dirname, "..");
const manifestPath = resolve(rootDirectory, "dist/manifest.json");
const releaseDirectory = resolve(rootDirectory, "release");

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const archivePath = resolve(
  releaseDirectory,
  `js-giri-v${manifest.version}.zip`,
);

await mkdir(releaseDirectory, { recursive: true });
await rm(archivePath, { force: true });

// Chrome Web Store expects manifest.json and the other extension files at the
// archive root, so archive the contents of dist rather than dist itself.
await execFileAsync(
  "zip",
  ["-r", "-q", "-X", archivePath, "."],
  { cwd: resolve(rootDirectory, "dist") },
);

console.log(`Created ${archivePath}`);
