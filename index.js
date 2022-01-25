const os = require('os');
const fs = require('fs');
const CSS_VARIABLE_DECLARATION = /^--/;
const CSS_VARIABLE_USE = /(var\([a-zA-Z0-9-]+\))/;
const HTML_NODE = /^html([#.:[][#.:_[\]\-a-zA-Z0-9]+)?(?:\s|$)/;

class CSSVariable {
  constructor(name, selector, value) {
    this.name = name;
    this.selector = selector;
    this.value = value;
  }

  isUsed(value) {
    return value.includes(`var(${this.name})`);
  }

  wrapAndReplace(selector, prop, value, important) {
    // Get new selector & value
    const newSelector = this._mixSelectors(this.selector, selector.split(',')).join(',');
    const newValue = value.replaceAll(`var(${this.name})`, this.value);

    // Return the rule
    return (important === true)
      ? `${newSelector} { ${prop}: ${newValue}!important; }`
      : `${newSelector} { ${prop}: ${newValue}; }`;
  }

  _mixSelectors(varSelector, ruleSelectors) {
    return ruleSelectors.map((ruleSelector) => {
      if (HTML_NODE.test(ruleSelector)) {
        const varHtmlMatch = HTML_NODE.exec(varSelector);
        const ruleHtmlMatch = HTML_NODE.exec(ruleSelector);
        if (varHtmlMatch !== null) {
          return `html${varHtmlMatch[1] || ''}${ruleHtmlMatch[1] || ''} ${ruleSelector.replace(HTML_NODE, '').trim()}`;
        } else {
          return ruleSelector.replace(`html${ruleHtmlMatch[1] || ''}`, `html${ruleHtmlMatch[1] || ''} ${varSelector}`);
        }
      } else {
        return `${varSelector} ${ruleSelector.trim()}`;
      }
    });
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
                generatedRules.push(
                  cssVariable.wrapAndReplace(
                    rule.selector,
                    declaration.prop,
                    declaration.value,
                    declaration.important
                  )
                );
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
