#!/usr/bin/env node

"use strict"

const chalk = require("chalk");
const AmdZip = require("adm-zip");
const logUpdate = require("log-update");
const { dots } = require("cli-spinners");
const { join, relative } = require("path");
const { exec } = require("child-process-promise");
const { copy, ensureDir, move, remove } = require("fs-extra");

const STATIC_FILES = [
  "icons",
  "popups",
  "main.html",
  "pane.html"
];

const relativePath = path => relative(process.cwd(), path);

const logPromise = async (promise, text, completedLabel = "") => {
  const { frames, interval } = dots;
  let index = 0;

  const id = setInterval(() => {
    index = ++index % frames.length;
    logUpdate(`${chalk.yellow(frames[index])} ${text} ${chalk.gray("- pending, this may take a few seconds")}`);
  }, interval);

  const result = await promise;

  clearInterval(id);

  logUpdate(`${chalk.green("√")} ${text} ${chalk.gray(completedLabel)}`);
  logUpdate.done();

  return result;
}

const preProcess = async (destinationPath, tempPath) => {
  await remove(destinationPath);
  await remove(tempPath);
  await ensureDir(tempPath);
}

const build = async (tempPath, manifestPath) => {
  const binPath = join(tempPath, "bin");
  const zipPath = join(tempPath, "zip");
  const webpackPath = join(__dirname, "..", "..", "node_modules", ".bin", "webpack");

  await exec(
    `${webpackPath} --config webpack.config.js --output-path ${binPath}`,
    {
      cwd: __dirname,
      env: Object.assign({}, process.env, { NODE_ENV: "production" })
    }
  );

  await ensureDir(zipPath);

  await copy(binPath, join(zipPath, "build"));
  await copy(manifestPath, join(zipPath, "manifest.json"));
  await Promise.all(
    STATIC_FILES.map(file => copy(join(__dirname, file), join(zipPath, file)))
  );

  const zip = new AmdZip();
  zip.addLocalFolder(zipPath);
  zip.writeZip(join(tempPath, `packed.zip`));
}

const postProcess = async (tempPath, destinationPath) => {
  const unpackedSourcePath = join(tempPath, "zip");
  const packedSourcePath = join(tempPath, "packed.zip");
  const packedDestPath = join(destinationPath, "packed.zip");
  const unpackedDestPath = join(destinationPath, "unpacked");

  await move(unpackedSourcePath, unpackedDestPath);
  await move(packedSourcePath, packedDestPath);
  await remove(tempPath); // Clean up temp directory and files
}

const main = async (buildId, manifestPath, destinationPath) => {
  try {
    const tempPath = join(__dirname, "build", buildId);

    await logPromise(
      preProcess(destinationPath, tempPath),
      "Preparing build"
    );

    await logPromise(
      build(tempPath, manifestPath),
      "Building extension",
      `- temporary files in ${relativePath(tempPath)}`
    );

    const builtUnpackedPath = join(destinationPath, "unpacked");

    await logPromise(
      postProcess(tempPath, destinationPath),
      "Unpacking extension",
      `- artifacts in ${relativePath(destinationPath)}`
    );

    return builtUnpackedPath;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  return null;
}

module.exports = main;