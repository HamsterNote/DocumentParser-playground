import reactConfig from '@system-ui-js/development-base/eslint.react.config.js'

const ignoreConfig = {
  ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**', 'public/**']
}

export default [ignoreConfig, ...reactConfig]
