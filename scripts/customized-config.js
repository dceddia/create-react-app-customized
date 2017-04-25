/*
  This module runs the scripts from react-scripts (Create React App)
  and gives an opportunity to override the Webpack config by creating
  a "config-overrides.dev.js" or "config-overrides.prod.js" file in the
  root of the project.

  The config-override file should export a single function that takes a
  config and returns the modified config, like this:

  module.exports = function(webpackConfig) {
    return webpackConfig;
  };
*/
var rewire = require('rewire');
var proxyquire = require('proxyquire');

switch(process.argv[2]) {
  // The "start" script is run during development mode
  case 'start':
    rewireModule('react-scripts/scripts/start.js', loadCustomizer('../config-overrides.dev'));
    break;
  // The "build" script is run to produce a production bundle
  case 'build':
    rewireModule('react-scripts/scripts/build.js', loadCustomizer('../config-overrides.prod'));
    break;
  // The "test" script runs all the tests with Jest
  case 'test':
    // Load customizations from the config-overrides.testing file.
    // That file should export a single function that takes a config and returns a config
    let customizer = loadCustomizer('../config-overrides.testing');
    proxyquire('react-scripts/scripts/test.js', {
      // When test.js asks for '../utils/createJestConfig' it will get this instead:
      '../utils/createJestConfig': (...args) => {
        // Use the existing createJestConfig function to create a config, then pass
        // it through the customizer
        var createJestConfig = require('react-scripts/utils/createJestConfig');
        return customizer(createJestConfig(...args));
      }
    });
    break;
  default:
    console.log('customized-config only supports "start", "build", and "test" options.');
    process.exit(-1);
}

// Attempt to load the given module and return null if it fails.
function loadCustomizer(module) {
  try {
    return require(module);
  } catch(e) {
    if(e.code !== "MODULE_NOT_FOUND") {
      throw e;
    }
  }

  // If the module doesn't exist, return a
  // noop that simply returns the config it's given.
  return config => config;
}

function rewireModule(modulePath, customizer) {
  // Load the module with `rewire`, which allows modifying the
  // script's internal variables.
  let defaults = rewire(modulePath);

  // Reach into the module, grab its global 'config' variable,
  // pass it through the customizer function, and then set it back.
  // 'config' is Create React App's built-in Webpack config.
  let config = defaults.__get__('config');
  config = customizer(Object.assign({}, config));
  defaults.__set__('config', config);
}
