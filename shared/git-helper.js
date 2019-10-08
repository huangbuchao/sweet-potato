#!/bin/usr/env node

const { execSync } = require("child_process");

const args = process.argv.slice(2);
console.log(args);
execSync("git add .");
execSync(`git commit -m ":snail::seedling:chore update"`);
execSync("git push");