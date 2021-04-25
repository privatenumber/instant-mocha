# instant-mocha [![Latest version](https://badgen.net/npm/v/instant-mocha)](https://npm.im/instant-mocha) [![Monthly downloads](https://badgen.net/npm/dm/instant-mocha)](https://npm.im/instant-mocha) [![Install size](https://packagephobia.now.sh/badge?p=instant-mocha)](https://packagephobia.now.sh/result?p=instant-mocha)

Build tests with Webpack and run them with Mocha in one command

## 🚀 Install
```sh
npm i -D instant-mocha
```

## 👨‍🏫 Usage
```sh
instant-mocha --webpack-config <Webpack config path> [test paths...]
```

You can either use [`npx`](https://www.npmjs.com/package/npx) or add it to `package.json` scripts to invoke it. (eg. `npx instant-mocha ...`)

### Options
#### --webpack-config
Path to the Webpack config.

#### -w, --watch
Watch mode. Re-compiles the Webpack build and re-run tests on file-changes.

Supports all options from Mocha CLI.

For more options:
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

## FAQ

### How do I enable source-maps?
Set [`devtool: 'source-map'`](https://webpack.js.org/configuration/devtool/) in your Webpack config.

### How do I add a progress bar?
Add [webpackbar](https://github.com/unjs/webpackbar) to your Webpack config.

### How is it different from [mocha-webpack](https://github.com/zinserjan/mocha-webpack) or its fork [mochapack](https://github.com/sysgears/mochapack)?

[mocha-webpack](https://github.com/zinserjan/mocha-webpack) is no longer maintained, and its fork [mochapack](https://github.com/sysgears/mochapack) doesn't have Webpack 5 support. (The implementation is also over-engineered and convoluted.)

I made a simpler version that supports both Webpack 4 & 5. Some notable improvements include:
- **Written in TypeScript** whereas `mocha-webpack` uses [Flow](https://github.com/facebook/flow).
- **Doesn't add another file-watching mechanism** Just relies on Webpack's watcher instead.
- **Doesn't write to the file-system** Instead, builds are completely in-memory. `mocha-webpack` writes to a temporary hidden directory for Mocha to read from.
- **Loosely coupled with Mocha and Webpack** The API surface interacted with is very narrow so it works with most versions.
