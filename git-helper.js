#!/bin/usr/env node

const { execSync } = require("child_process");

const args = process.argv.slice(2);
const commitMessagePrefix = {
  default: ":flower::honeybee:chore: ",
  frontend: ":snail::deciduous_tree:chore: ",
  backend: ":seedling::cat2:chore: ",
  shared: ":turtle::shell:chore: ",
  agent: ":earth_asia::dragon:chore: ",
  shells: ":mushroom::jack_o_lantern:chore: ",
};

function push(arg1 = "default", ...argRest) {
  try {
    execSync("git add .");
    execSync(`git commit -m "${commitMessagePrefix[arg1]}${argRest && argRest.join(" ")}"`);
    execSync("git push");
  } catch (error) {
    console.error(error);
  }
}

push(...args);