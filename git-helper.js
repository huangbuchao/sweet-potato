#!/bin/usr/env node

const { execSync } = require("child_process");
const { version } = require("./package.json");

const args = process.argv.slice(2);
const commitMessagePrefix = {
  default: ":flower::honeybee:chore: update a little",
  frontend: ":snail::deciduous_tree:chore: ",
  backend: ":seedling::cat2:chore: ",
  shared: ":turtle::shell:chore: ",
  agent: ":earth_asia::dragon:chore: ",
  shells: ":mushroom::jack_o_lantern:chore: ",
  release: ":tada::tada::tada:release version: "
};

function push(arg1 = "default", ...argRest) {
  try {
    execSync("git add .");
    execSync(`git commit -m "${commitMessagePrefix[arg1]}${argRest && argRest.join(" ")}"`);
    execSync("git push");
    if(arg1 === "release") {
      execSync(`git tag v${version}`);
      execSync(`git push origin v${version}`);
    }
  } catch (error) {
    console.error(error);
  }
}

push(...args);