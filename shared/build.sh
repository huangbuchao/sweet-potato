#!/bin/bash

source ./setbash.sh

../node_modules/.bin/webpack --config webpack.config.js $@
