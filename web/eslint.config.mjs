import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

/** Next 15 `eslint-config-next` is ESLintRC-style; FlatCompat bridges it to ESLint 9 flat config. */
export default [...compat.extends("next/core-web-vitals", "next/typescript")];
