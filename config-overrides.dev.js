const path = require('path');

module.exports = function(config) {
  // Use your own ESLint file
  config.eslint.useEslintrc = true;

  // Ignore SASS files in the "catchall" loader
  config.module.loaders[0].exclude.push(/\.scss$/);

  // Add the SASS loader
  config.module.loaders.push({
    test: /\.scss$/,
    loaders: ["style", "css", "sass"]
  });

  // Allow importing anything under 'src' as if it were a module.
  // So you can "import Icon from 'components/Icon'" instead of
  // "import Icon from '../components/Icon'"
  config.resolve.fallback = [...config.resolve.fallback, path.resolve('src')];

  return config;
}
