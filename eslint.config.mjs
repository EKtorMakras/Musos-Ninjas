import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import eslintPluginJsonc from "eslint-plugin-jsonc";
import js from "@eslint/js";
import globals from "globals";

const indentSize = 4;

export default [
    ...vue.configs["flat/essential"],
    ...vue.configs["flat/recommended"],
    ...eslintPluginJsonc.configs["flat/recommended-with-jsonc"],

    js.configs.recommended,

    { ignores: ["node_modules", "dist", "coverage", "lib/templates", "*.css", "*.bat"] },

    {
        files: ["**/*.{js,ts,vue,cjs,mjs}"],
        plugins: { vue },
        languageOptions: {
            parser: vueParser,
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                process: "readonly",
                require: "readonly",
                module: "readonly",
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            // ===== General ===== //
            indent: ["warn", indentSize, { SwitchCase: 1 }],
            "linebreak-style": ["warn", "unix"],
            quotes: ["warn", "double"],
            semi: ["warn", "always"],
            "no-empty": "warn",
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-cond-assign": ["warn", "always"],
            "no-multiple-empty-lines": ["warn", { max: 2, maxEOF: 0, maxBOF: 0 }],
            "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
            "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
            "init-declarations": "off",
            "no-inline-comments": "off",
            camelcase: "off",

            // ===== Vue ===== //
            "vue/script-indent": ["warn", indentSize],
            "vue/html-indent": [
                "warn",
                indentSize,
                { attribute: 1, baseIndent: 1, closeBracket: 0, alignAttributesVertically: true, ignores: [] },
            ],
            "vue/comment-directive": "off",
            "vue/no-v-model-argument": "off",
            "vue/no-v-html": "off",
            "vue/html-self-closing": ["warn", { html: { void: "always", normal: "never" }, svg: "never" }],
            "vue/require-default-prop": "off",
            "vue/component-name-in-template-casing": ["warn", "PascalCase"],
            "vue/multi-word-component-names": ["warn", { ignores: ["index", "default", "[id]"] }],
            "vue/valid-v-slot": ["warn", { allowModifiers: true }],
            "vue/attributes-order": [
                "warn",
                {
                    order: [
                        "DEFINITION",
                        "LIST_RENDERING",
                        "CONDITIONALS",
                        "RENDER_MODIFIERS",
                        "GLOBAL",
                        ["UNIQUE", "SLOT"],
                        "TWO_WAY_BINDING",
                        "OTHER_DIRECTIVES",
                        "OTHER_ATTR",
                        "EVENTS",
                        "CONTENT",
                    ],
                    alphabetical: false,
                },
            ],
        },
    },
];
