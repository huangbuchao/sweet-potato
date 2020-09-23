# sweet-potato :sweet_potato:

provide two applications: Chrome Extension and [Standalone](./shells/electron/README.md) (based on electron).

[![Build Status](https://github.com/huangbuchao/sweet-potato/workflows/ci%20status/badge.svg?branch=master&event=push)](https://github.com/huangbuchao/sweet-potato/actions)

# Instruction :christmas_tree:

## Installation(Download or Manual manipulate)

**Make sure your Node and NPM version is latest**

### I. Download :jack_o_lantern:

1. [download install package](https://sweet-potato-devtools-chrome.now.sh/PotatoDevTools.zip)
2. unzip
3. Navigate to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "LOAD UNPACKED"
6. Select extracted extension folder (PotatoDevTools)

### II. Manual install :ghost:

1. clone repository to local.
2. run `npm intall`
3. run `npm run build:chrome`
4. open `chrome://extensions/` page select `./shells/chrome/build/PotatoDevTools` directory.

### III. Install Standalone :gift:

Redirect to [this document](./shells/electron/README.md).

## Development

~~~
git clone xxx
~~~

~~~
npm install
npm run dev
~~~

now open `http://localhost:8024` in your broswer.

## Shortcut Directive

Input follow shortcut directives in the **Console Pane** to get a node context directly.

1. `$h` = current selected node.
2. `$h0` = `$h`
3. `$h1`-`$h4` = previously selected nodes.
4. `$hh(string | regexp | uuid)` This function will return a array contained qualified nodes.

## FAQ

:jack_o_lantern:
:snail:

## Feedback

`new issue` or `pull request`

## TODO

1. derive more features in the future. follow [UPDATE_LOG.md](./UPDATE_LOG.md).

2. slice packages. that mean will to slice some standalone npm packages. in the @potato namespace. it's flexible to use.
e.g: just add `@potato/devtools-core` to your package.json dependencies fields.