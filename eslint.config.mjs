/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "dist/**",
      ".git/**",
      ".vercel/**",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "off",
    },
  },
];

export default config;
