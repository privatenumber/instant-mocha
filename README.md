<p align="center">
  <img src=".github/logo.svg" width="112px">
</p>

<h1 align="center">
  instant-mocha
  <br>
  <a href="https://npm.im/instant-mocha"><img src="https://badgen.net/npm/v/instant-mocha"></a> <a href="https://npm.im/instant-mocha"><img src="https://badgen.net/npm/dm/instant-mocha"></a> <a href="https://packagephobia.now.sh/result?p=instant-mocha"><img src="https://packagephobia.now.sh/badge?p=instant-mocha"></a>
</h1>

Build tests with Webpack and run them with Mocha in one command

### Features
- Source-map support
- Builds and runs in-memory
- Inherits Mocha CLI
- Supports Webpack 5 & Mocha 8

_How does it compare to [mocha-webpack](https://github.com/zinserjan/mocha-webpack) / [mochapack](https://github.com/sysgears/mochapack)?_ Answered in the [FAQ](#how-is-it-different-from-mocha-webpack-or-its-fork-mochapack).

<sub>Support this project by ⭐️ starring and sharing it. [Follow me](https://github.com/privatenumber) to see what other cool projects I'm working on! ❤️</sub>

## 🚀 Install
```sh
npm i -D mocha webpack instant-mocha
```

Note: `webpack` and `mocha` are peer-dependencies so you can provide any version

## 👨‍🏫 Usage
```sh
instant-mocha --webpack-config <Webpack config path> [test paths/globs...]
```

You can either use [`npx`](https://www.npmjs.com/package/npx) (eg. `npx instant-mocha ...`) or add it to [`package.json` scripts](https://nodejs.dev/learn/the-package-json-guide) (eg. `npm test`) to invoke it. 

### Options
#### --webpack-config
Path to the Webpack config.

#### -w, --watch
Watch mode. Re-compiles the Webpack build and re-run tests on file-changes.

#### Supports all options from Mocha CLI
For more info, run:
```sh
instant-mocha --help
```

### Example
```sh
instant-mocha ---webpack-config webpack.config.js --require setup.js 'tests/*.spec.js'
```
- Load Webpack config from `webpack.config.js`
- Load setup script from `setup.js`. _Note, this is not apart of the build and is loaded directly from Node.js_
- Find and run tests that matches glob `tests/*.spec.js`

## 💁‍♀️ FAQ

### How do I enable source-maps?
Set [`devtool: 'source-map'`](https://webpack.js.org/configuration/devtool/) in your Webpack config.

### How do I add a progress bar?
Add [webpackbar](https://github.com/unjs/webpackbar) to your Webpack config.

### Are `node_modules` automatically externalized?
They can't be automatically externalized because it's possible some dependencies require bundling or pre-processing. For example, packages in [ESM format](https://nodejs.org/api/esm.html) or deep-dependencies that are stubbed for testing.

It's recommended to externalize what you can in your [Webpack config](https://webpack.js.org/configuration/externals/) to speed up the build though. Consider using [`webpack-node-externals`](https://github.com/liady/webpack-node-externals) to do this.

### How is it different from [mocha-webpack](https://github.com/zinserjan/mocha-webpack) or its fork [mochapack](https://github.com/sysgears/mochapack)?

_First of all, major thanks to [mocha-webpack](https://github.com/zinserjan/mocha-webpack) for the original implementation and serving the community._

This project was created from scratch because `mocha-webpack` is no longer maintained and doesn't have Webpack 5 support (and neither does its fork, [mochapack](https://github.com/sysgears/mochapack)).

Some notable improvements include:
- **Written in TypeScript** whereas `mocha-webpack` uses [Flow](https://github.com/facebook/flow).
- **Doesn't re-implement another file-watching mechanism** Relies on Webpack's watcher instead.
- **Loosely coupled with Mocha and Webpack** The API surface used is very narrow so it works with most versions, (eg. Webpack 4 & 5).
- **Correct exit codes** Mocha and `mocha-webpack` returns the number of failed tests as the exit code. instant-mocha only uses exit code `1` for any test failures as per [Bash convention](https://tldp.org/LDP/abs/html/exitcodes.html).
- **Smaller size** Reuses a lot from Webpack & Mocha so it's much lighter: [![instant-mocha install size](https://packagephobia.now.sh/badge?p=instant-mocha)](https://packagephobia.now.sh/result?p=instant-mocha) vs [![mocha-webpack install size](https://packagephobia.now.sh/badge?p=mocha-webpack)](https://packagephobia.now.sh/result?p=mocha-webpack)

## 💼 License
MIT © Hiroki Osame

Logo made by <a href="https://www.flaticon.com/free-icon/instant-coffee_3063818" title="monkik">monkik</a>
