const generatedPaths = ["packages/backend/confect", "packages/backend/convex"];

const run = (command: string[]) => {
  const result = Bun.spawnSync(command);

  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);

  return result.success;
};

const main = () => {
  if (!run(["bun", "run", "confect:codegen"])) {
    process.exitCode = 1;
    return;
  }

  if (!run(["git", "diff", "--exit-code", "--", ...generatedPaths])) {
    process.exitCode = 1;
    return;
  }

  const untracked = Bun.spawnSync([
    "git",
    "ls-files",
    "--others",
    "--exclude-standard",
    "--",
    ...generatedPaths,
  ]);
  if (!untracked.success) {
    process.stderr.write(
      "Could not inspect generated paths for untracked files\n"
    );
    process.exitCode = 1;
    return;
  }

  const untrackedPaths = untracked.stdout.toString().trim();

  if (untrackedPaths.length > 0) {
    process.stdout.write(`${untrackedPaths}\n`);
    process.stderr.write("Generated paths contain untracked files\n");
    process.exitCode = 1;
  }
};

main();
