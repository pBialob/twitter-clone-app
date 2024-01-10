/** @type {import("prettier").Config} */
const config = {
  endOfLine: "crlf",
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
};

module.exports = config;
