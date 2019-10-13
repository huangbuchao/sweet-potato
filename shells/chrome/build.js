#!/usr/bin/env node

const chalk = require('chalk');
const {join} = require('path');
const build = require('../maker/build');

const main = async () => {
  await build(
    'chrome',
    join(__dirname, 'manifest.json'),
    join(__dirname, 'build')
  );

  console.log(chalk.green('\nThe Chrome extension has been built!'));
};

main();
