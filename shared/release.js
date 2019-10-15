#!/usr/bin/env node

const fs = require("fs");
const inquirer = require("inquirer");
const semver = require("semver");
const pkg = require("../package.json");
const manifest = require("../shells/chrome/manifest.json");
const {join} = require("path");
const { exec } = require("child_process");

const currentVersion = pkg.version;

(async () => {
  const { newVersion } = await inquirer.prompt([{
    type: "input",
    name: "newVersion",
    message: `Please provide a version (current: ${currentVersion}):`
  }]);

  if(!semver.valid(newVersion)) {
    console.error(`Invalid version: ${newVersion}`);
    process.exit(1);
  }

  if (semver.lt(newVersion, currentVersion)) {
    console.error(`New version (${newVersion}) cannot be lower than current version (${currentVersion}).`)
    process.exit(1)
  }

  const { commitMessage } = await inquirer.prompt([{
    type: "input",
    name: "commitMessage",
    message: `Please input this commit message (default: null):`
  }]);

  const { yes } = await inquirer.prompt([{
    type: "confirm",
    name: "yes",
    message: `Release ${newVersion}?`
  }]);

  if(yes) {
    pkg.version = newVersion;
    manifest.version = newVersion;
    manifest.version_name = newVersion;

    fs.writeFileSync(join(__dirname, "..", "package.json"), JSON.stringify(pkg, null, 2));
    fs.writeFileSync(join(__dirname, "..", "shells/chrome/manifest.json"), JSON.stringify(manifest, null, 2));
  }else{
    process.exit(1);
  }

  await exec(`npm run gitpush release ${commitMessage}`);

  await exec("npm run deploy");
})();