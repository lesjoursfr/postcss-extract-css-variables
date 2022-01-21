# postcss-extract-css-variables

[PostCSS] plugin to extract rules with CSS variables.

[PostCSS]: https://github.com/postcss/postcss

```css
/* Input example */
.lj-color-35 {
  --lj-color-main: #fda92a;
  --lj-color-alpha: rgba(253,169,42,.75);
  --lj-color-light: #fdde2a;
  --lj-color-mixed: #fdc42a
}

.selector-1 {
    background-color: var(--lj-color-main);
    content: "";
    display: inline-block;
    height: 5px;
    margin-right: 10px;
    width: 18px
}
```

```css
/* Output example */
.lj-color-35 .selector-1 { background-color: #fda92a; }
```

## Usage

**Step 1:** Install plugin:

```sh
npm install --save-dev postcss postcss-extract-css-variables
```

**Step 2:** Check you project for existed PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

If you do not use PostCSS, add it according to [official docs]
and set this plugin in settings.

**Step 3:** Add the plugin add the end of the plugins list:

```diff
module.exports = {
  plugins: [
    require('autoprefixer'),
+   require('postcss-extract-css-variables')({ output: './output.css' })
  ]
}
```

[official docs]: https://github.com/postcss/postcss#usage
