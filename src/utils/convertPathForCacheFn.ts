import path from "path";

export default function (buildPath: string) {
  const absPath = path.resolve(process.cwd(), buildPath);

  const relativePath = path.relative(
    path.resolve(process.cwd(), "src"),
    absPath
  );

  const outPath = relativePath.replace(path.extname(relativePath), ".js");
  const outFile = path.resolve(process.cwd(), `.paraflux/cache/${outPath}`);

  return outFile;
}
