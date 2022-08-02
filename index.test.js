const fs = require("fs");
const postcss = require("postcss");

const plugin = require("./");

function run(input, opts = {}) {
  return postcss([plugin(opts)]).process(input, { from: undefined });
}

it("throw an error if there is no output option", () => {
  const input = fs.readFileSync("./test/input.css", { encoding: "utf8" });
  expect(() => run(input)).toThrowError(new Error("Missing output parameter"));
});

it("leave the original CSS unchanged", async () => {
  const input = fs.readFileSync("./test/input.css", { encoding: "utf8" });
  let result = await run(input, { output: "./test/output.css" });
  expect(result.css).toEqual(input);
  expect(result.warnings()).toHaveLength(0);
});

it("extract rules with CSS variables to a new file", async () => {
  const input = fs.readFileSync("./test/input.css", { encoding: "utf8" });
  let result = await run(input, { output: "./test/output.css" });
  expect(fs.readFileSync("./test/output.css", { encoding: "utf8" })).toEqual(
    fs.readFileSync("./test/expected.css", { encoding: "utf8" })
  );
  expect(result.warnings()).toHaveLength(0);
});
