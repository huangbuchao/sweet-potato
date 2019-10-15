#!/usr/bin/env node

const { readFileSync, writeFileSync } = require("fs");
const { exec, execSync } = require("child_process");
const { join } = require("path");
const chalk = require("chalk");
const { version } = require("../../package.json");

const main = async buildId => {
  const root = join(__dirname, "..", buildId);
  const buildPath = join(root, "build");

  execSync(
    `node ${join(root, "./build")}`,
    {
      cwd: __dirname,
      env: {
        ...process.env,
        NODE_ENV: "production"
      },
      stdio: "inherit"
    }
  );

  await exec(
    `cp ${join(root, "now.json")} ${join(buildPath, "now.json")}`,
    {
      env: root
    }
  );

  const file = readFileSync(join(root, "now.json"));
  const json = JSON.parse(file);
  const alias = json.alias[0];

  const commit = execSync("git rev-parse HEAD").toString().trim().substr(0, 7);

  let date = new Date();
  date = `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`;

  const installationInstructions = buildId === "chrome" ?
    readFileSync(join(__dirname, "deploy.chrome.html")) :
    readFileSync(join(__dirname, "deploy.firefox.html"));

  let html = readFileSync(join(__dirname, "deploy.html")).toString();
  html = html.replace(/%version%/g, version);
  html = html.replace(/%commit%/g, commit);
  html = html.replace(/%date%/g, date);
  html = html.replace(/%installation%/, installationInstructions);

  writeFileSync(join(buildPath, "index.html"), html);

  console.log(chalk.blue(`Deploy to https://${alias}.now.sh .......`));

  await exec(
    `now --prod`,
    {
      cwd: buildPath,
      stdio: "inherit"
    }
  );
};


module.exports = main;
