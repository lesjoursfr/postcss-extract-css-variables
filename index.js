const os = require('os');
const fs = require('fs');
const CSS_VARIABLE_DECLARATION = /^--/;
const CSS_VARIABLE_USE = /(var\([a-zA-Z0-9-]+\))/;

class CSSVariable {
  constructor(name, selector, value) {
    this.name = name;
    this.selector = selector;
    this.value = value;
  }

  isUsed(value) {
    return value.includes(`var(${this.name})`);
  }

  wrapAndReplace(selector, prop, value) {
    let newSelector = selector.split(',').map((el) => `${this.selector} ${el.trim()}`).join(',');
    let newValue = value.replaceAll(`var(${this.name})`, this.value);

    return `${newSelector} { ${prop}: ${newValue}; }`;
  }
}

/**
 * @type {import('postcss').PluginCreator}
 */
module.exports = (opts = {}) => {
  // Check if we have an output path
  if (opts.output === undefined) {
    // Throw an error if we haven't an output parameter
    throw new Error('Missing output parameter');
  }

  // Return the PostCSS plugin
  return {
    postcssPlugin: 'postcss-extract-css-variables',

    Root(root) {
      let cssVariablesHolder = [];

      // Look for CSS variable declaration
      for (const rule of root.nodes) {
        // Check the type of node
        if (rule.type === 'atrule' || rule.type === 'comment') {
          // Skip this rule
          continue;
        }

        // Check nodes
        for (const declaration of rule.nodes) {
          if (CSS_VARIABLE_DECLARATION.test(declaration.prop)) {
            // Add the CSS variable
            cssVariablesHolder.push(new CSSVariable(declaration.prop, rule.selector, declaration.value));
          }
        }
      }

      // Open a stream for the destination file
      const generatedRules = [];

      // Look for CSS variable use
      for (const rule of root.nodes) {
        // Check the type of node
        if (rule.type === 'atrule' || rule.type === 'comment') {
          // Skip this rule
          continue;
        }

        // Check nodes
        for (const declaration of rule.nodes) {
          if (CSS_VARIABLE_USE.test(declaration.value)) {
            for (const cssVariable of cssVariablesHolder) {
              if (cssVariable.isUsed(declaration.value)) {
                generatedRules.push(cssVariable.wrapAndReplace(rule.selector, declaration.prop, declaration.value));
              }
            }
          }
        }
      }

      // Write the generated rules to the output file
      fs.writeFileSync(opts.output, generatedRules.join(os.EOL), { encoding: 'utf8', mode: 0o666, flag: 'w' });
    },
  };
};

module.exports.postcss = true;
