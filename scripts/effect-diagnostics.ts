const projects = [
  ...new Bun.Glob("{apps,packages}/*/tsconfig.json").scanSync(),
].toSorted();

const main = () => {
  if (projects.length === 0) {
    process.stderr.write("No workspace tsconfig.json files were found\n");
    process.exitCode = 1;
    return;
  }

  const failures = projects.filter((project) => {
    const result = Bun.spawnSync([
      "bunx",
      "effect-language-service",
      "diagnostics",
      "--project",
      project,
      "--format",
      "github-actions",
    ]);

    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);

    return !result.success;
  });

  if (failures.length > 0) {
    process.stderr.write(
      `Effect diagnostics failed for ${failures.join(", ")}\n`
    );
    process.exitCode = 1;
  }
};

main();
