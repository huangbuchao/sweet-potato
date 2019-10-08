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

function push(arg1 = "default", arg2 = "update a little") {
  console.log(arg1, arg2);
  try {
    console.log('pendding');
    execSync("git add .");
    execSync(`git commit -m "${commitMessagePrefix[arg1]}${arg2}"`);
    execSync("git push");
    console.log('push done');
  } catch (error) {
    console.error(error);
  }
}

push(...args);