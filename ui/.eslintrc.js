module.exports = {
  "parserOptions": {
    "parser": "@babel/eslint-parser",
    "project": 'tsconfig.json',
    "tsconfigRootDir": __dirname,
    "sourceType": "module",
    "requireConfigFile": false,
  },
  "ignorePatterns": ['.eslintrc.js', 'craco.config.js'],
  "plugins": [
    "react-hooks"
  ],
  "extends": [
    "airbnb",
    'airbnb-typescript',
    "prettier"
  ],
  "env": {
    "browser": true,
    "jest": true
  },
  "rules": {
    "react/prefer-stateless-function": "off",
    "no-param-reassign": [
      "error",
      {
        "props": false
      }
    ],
    "no-underscore-dangle": [
      "error",
      {
        "allow": [
          "_source",
          "_id"
        ]
      }
    ],
    "jsx-a11y/anchor-is-valid": [
      "error",
      {
        "components": [
          "Link"
        ],
        "specialLink": [
          "to",
          "hrefLeft",
          "hrefRight"
        ],
        "aspects": [
          "noHref",
          "invalidHref",
          "preferButton"
        ]
      }
    ],
    "import/no-extraneous-dependencies": [
      "off",
      {
        "devDependencies": [
          "**/*.test.jsx?"
        ]
      }
    ],
    "import/prefer-default-export": "off",
    "react/no-unused-prop-types": "off",
    "react/require-default-props": "off",
    "react/prop-types": "off",
    "react/forbid-prop-types": 0,
    "react-hooks/exhaustive-deps": "warn",
    "react/jsx-filename-extension": [2, { "extensions": [".js", ".jsx", ".ts", ".tsx"] }],
    "react-hooks/rules-of-hooks": "error",
    "react/jsx-props-no-spreading": "off",
    "default-param-last": "off",
    "import/no-cycle": "off",
    "jsx-a11y/control-has-associated-label": "warn",
    "react/jsx-no-constructed-context-values": "warn",
    "no-import-assign": "warn",
    "react/function-component-definition": "warn",
    "react/destructuring-assignment": "warn",
    "react/no-unstable-nested-components": "warn",
    "prefer-regex-literals": "warn",
    "react/jsx-indent": "off",
    "react/jsx-closing-tag-location": "off",
    "react/jsx-wrap-multilines": "off",
    "comma-dangle": "off",
    "@typescript-eslint/comma-dangle": "off",
    "@typescript-eslint/semi": "off",
    "@typescript-eslint/indent": "off",
    "react/jsx-one-expression-per-line": "off",
    "@typescript-eslint/object-curly-spacing": "off",
    "@typescript-eslint/default-param-last": "off",
    "@typescript-eslint/space-before-function-paren": "off",
    "react/default-props-match-prop-types": 'off',
    "@typescript-eslint/quotes": "off", 
    "@typescript-eslint/lines-between-class-members": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "react/function-component-definition": "off",
    "jsx-a11y/control-has-associated-label": "off",
    "react/destructuring-assignment": "off",
    "react/no-unstable-nested-components": "off",
    "func-names": "off",
    "prefer-regex-literals": "off",
    "react/destructuring-assignment": "off",
    "react/jsx-no-constructed-context-values": "off",
    "@typescript-eslint/space-before-blocks": "off"
  },
  "overrides": [
    {
      "files": [
        "src/middlewares/*.js"
      ],
      "rules": {
        "arrow-body-style": "off"
      }
    }
  ],
  "settings": {
    "import/resolver": {
      "node": {
        "extensions": [".js", ".jsx", ".ts", ".tsx"]
      }
    },
    "react": {
      "version": "detect"
    }
  }
}
