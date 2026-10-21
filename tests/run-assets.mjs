import { build } from "esbuild";
import { mkdtemp, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const directory = await mkdtemp(join(tmpdir(), "tenda-asset-tests-"));
try {
  const entries=(await readdir(new URL('.',import.meta.url))).filter(name=>name.endsWith('.test.ts')).sort();
  for(const entry of entries){
  const outfile = join(directory, entry+".mjs");
  await build({
    entryPoints: [fileURLToPath(new URL("./"+entry, import.meta.url))],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile,
    logLevel: "warning",
  });
  await import(pathToFileURL(outfile).href);
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}
