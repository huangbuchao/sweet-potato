#!/usr/bin/env node

const deploy = require('../maker/deploy');

const main = async () => await deploy('chrome');

main();
