import { defineConfig } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import { fixupPluginRules } from '@eslint/compat';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';

const coreRules = {
  'array-callback-return': ['error', { allowImplicit: true }],
  'arrow-body-style': ['error', 'as-needed'],
  'block-scoped-var': 'error',
  camelcase: ['error', { properties: 'never', ignoreDestructuring: false }],
  'getter-return': ['error', { allowImplicit: true }],
  'no-cond-assign': ['error', 'always'],
  'no-inner-declarations': [
    'error',
    'functions',
    { blockScopedFunctions: 'allow' },
  ],
  'no-self-assign': ['error', { props: false }],
  'no-template-curly-in-string': 'error',
  'no-unused-vars': [
    'error',
    { vars: 'all', args: 'after-used', ignoreRestSiblings: true },
  ],
  'no-use-before-define': [
    'error',
    {
      classes: true,
      functions: true,
      variables: true,
      allowNamedExports: false,
    },
  ],
  'valid-typeof': ['error', { requireStringLiterals: true }],
  'class-methods-use-this': [
    'error',
    {
      exceptMethods: [
        'render',
        'getChildContext',
        'componentDidMount',
        'shouldComponentUpdate',
        'componentDidUpdate',
        'componentWillUnmount',
        'componentDidCatch',
        'getSnapshotBeforeUpdate',
      ],
    },
  ],
  'consistent-return': 'error',
  'default-case': ['error', { commentPattern: '^no default$' }],
  'dot-notation': ['error', { allowKeywords: true }],
  eqeqeq: ['error', 'always', { null: 'ignore' }],
  'guard-for-in': 'error',
  'no-alert': 'warn',
  'no-await-in-loop': 'error',
  'no-bitwise': 'error',
  'no-console': 'warn',
  'no-continue': 'error',
  'no-else-return': ['error', { allowElseIf: false }],
  'no-eval': 'error',
  'no-extend-native': 'error',
  'no-extra-bind': 'error',
  'no-extra-label': 'error',
  'no-implied-eval': 'error',
  'no-iterator': 'error',
  'no-label-var': 'error',
  'no-labels': ['error', { allowLoop: false, allowSwitch: false }],
  'no-lone-blocks': 'error',
  'no-lonely-if': 'error',
  'no-loop-func': 'error',
  'no-multi-assign': 'error',
  'no-multi-str': 'error',
  'no-nested-ternary': 'error',
  'no-new': 'error',
  'no-new-func': 'error',
  'no-new-object': 'error',
  'no-new-symbol': 'error',
  'no-new-wrappers': 'error',
  'no-octal-escape': 'error',
  'no-param-reassign': ['error', { props: false }],
  'no-proto': 'error',
  'no-restricted-globals': [
    'error',
    'isFinite',
    'isNaN',
    'addEventListener',
    'blur',
    'close',
    'closed',
    'confirm',
    'defaultStatus',
    'defaultstatus',
    'event',
    'external',
    'find',
    'focus',
    'frameElement',
    'frames',
    'history',
    'innerHeight',
    'innerWidth',
    'length',
    'location',
    'locationbar',
    'menubar',
    'moveBy',
    'moveTo',
    'name',
    'onblur',
    'onerror',
    'onfocus',
    'onload',
    'onresize',
    'onunload',
    'open',
    'opener',
    'opera',
    'outerHeight',
    'outerWidth',
    'pageXOffset',
    'pageYOffset',
    'parent',
    'print',
    'removeEventListener',
    'resizeBy',
    'resizeTo',
    'screen',
    'screenLeft',
    'screenTop',
    'screenX',
    'screenY',
    'scroll',
    'scrollbars',
    'scrollBy',
    'scrollTo',
    'scrollX',
    'scrollY',
    'self',
    'status',
    'statusbar',
    'stop',
    'toolbar',
    'top',
  ],
  'no-restricted-properties': [
    'error',
    {
      object: 'global',
      property: 'isFinite',
      message: 'Please use Number.isFinite instead',
    },
    {
      object: 'self',
      property: 'isFinite',
      message: 'Please use Number.isFinite instead',
    },
    {
      object: 'window',
      property: 'isFinite',
      message: 'Please use Number.isFinite instead',
    },
    {
      object: 'global',
      property: 'isNaN',
      message: 'Please use Number.isNaN instead',
    },
    {
      object: 'self',
      property: 'isNaN',
      message: 'Please use Number.isNaN instead',
    },
    {
      object: 'window',
      property: 'isNaN',
      message: 'Please use Number.isNaN instead',
    },
  ],
  'no-restricted-syntax': [
    'error',
    {
      selector: 'ForInStatement',
      message:
        'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
    },
    {
      selector: 'ForOfStatement',
      message:
        'iterators/generators require regenerator-runtime, which is too heavyweight for this guide to allow them. Separately, loops should be avoided in favor of array iterations.',
    },
    {
      selector: 'LabeledStatement',
      message:
        'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
    },
  ],
  'no-return-assign': ['error', 'always'],
  'no-return-await': 'error',
  'no-script-url': 'error',
  'no-self-compare': 'error',
  'no-sequences': 'error',
  'no-shadow': 'error',
  'no-throw-literal': 'error',
  'no-underscore-dangle': ['error', { allow: ['_source', '_id'] }],
  'no-undef-init': 'error',
  'no-unneeded-ternary': ['error', { defaultAssignment: false }],
  'no-unused-expressions': [
    'error',
    {
      allowShortCircuit: false,
      allowTernary: false,
      allowTaggedTemplates: false,
    },
  ],
  'no-useless-concat': 'error',
  'no-useless-computed-key': 'error',
  'no-useless-constructor': 'error',
  'no-useless-rename': 'error',
  'no-useless-return': 'error',
  'no-var': 'error',
  'no-void': 'error',
  'object-shorthand': ['error', 'always', { avoidQuotes: true }],
  'one-var': ['error', 'never'],
  'operator-assignment': ['error', 'always'],
  'prefer-arrow-callback': 'error',
  'prefer-const': [
    'error',
    { destructuring: 'any', ignoreReadBeforeAssign: true },
  ],
  'prefer-destructuring': [
    'error',
    {
      VariableDeclarator: { array: false, object: true },
      AssignmentExpression: { array: true, object: true },
    },
  ],
  'prefer-numeric-literals': 'error',
  'prefer-promise-reject-errors': ['error', { allowEmptyReject: true }],
  'prefer-rest-params': 'error',
  'prefer-spread': 'error',
  'prefer-template': 'error',
  radix: 'error',
  'global-require': 'error',
  'lines-around-directive': 'error',
  'lines-between-class-members': [
    'error',
    'always',
    { exceptAfterSingleLine: false },
  ],
  'new-cap': [
    'error',
    {
      capIsNew: false,
      capIsNewExceptions: ['Immutable.Map', 'Immutable.Set', 'Immutable.List'],
    },
  ],
  'no-array-constructor': 'error',
  'spaced-comment': [
    'error',
    'always',
    {
      line: { exceptions: ['-', '+'], markers: ['=', '!'] },
      block: { exceptions: ['-', '+'], markers: ['=', '!'], balanced: true },
    },
  ],
  'symbol-description': 'error',
  'unicode-bom': ['error', 'never'],
  'vars-on-top': 'error',
  yoda: 'error',
};

const importRules = {
  'import/no-named-as-default': 'error',
  'import/no-mutable-exports': 'error',
  'import/first': 'error',
  'import/no-duplicates': 'error',
  'import/extensions': [
    'error',
    'ignorePackages',
    { js: 'never', jsx: 'never', ts: 'never', tsx: 'never' },
  ],
  'import/order': ['error', { groups: [['builtin', 'external', 'internal']] }],
  'import/newline-after-import': 'error',
  'import/no-absolute-path': 'error',
  'import/no-dynamic-require': 'error',
  'import/no-webpack-loader-syntax': 'error',
  'import/no-named-default': 'error',
  'import/no-self-import': 'error',
  'import/no-cycle': 'error',
  'import/no-useless-path-segments': 'error',
  'import/namespace': 'off',
  'import/no-unresolved': [
    'error',
    {
      ignore: ['\\?react$'],
    },
  ],
  // false-positives on CJS-interop default exports (immutable, axios, formik...)
  'import/no-named-as-default-member': 'off',
};

const reactRules = {
  'react/jsx-boolean-value': ['error', 'never'],
  'react/jsx-no-bind': [
    'error',
    {
      ignoreRefs: true,
      allowArrowFunctions: true,
      allowFunctions: false,
      allowBind: false,
      ignoreDOMComponents: true,
    },
  ],
  'react/jsx-no-duplicate-props': ['error', { ignoreCase: true }],
  'react/jsx-pascal-case': ['error', { allowAllCaps: true }],
  'react/jsx-filename-extension': [
    2,
    {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
  ],
  'react/no-danger': 'warn',
  'react/no-did-update-set-state': 'error',
  'react/no-will-update-set-state': 'error',
  'react/prefer-es6-class': ['error', 'always'],
  'react/self-closing-comp': 'error',
  'react/sort-comp': [
    'error',
    {
      order: [
        'static-methods',
        'instance-variables',
        'lifecycle',
        '/^on.+$/',
        'getters',
        'setters',
        '/^(get|set)(?!(InitialState$|DefaultProps$|ChildContext$)).+$/',
        'instance-methods',
        'everything-else',
        'rendering',
      ],
      groups: {
        lifecycle: [
          'displayName',
          'propTypes',
          'contextTypes',
          'childContextTypes',
          'mixins',
          'statics',
          'defaultProps',
          'constructor',
          'getDefaultProps',
          'getInitialState',
          'state',
          'getChildContext',
          'componentWillMount',
          'componentDidMount',
          'componentWillReceiveProps',
          'shouldComponentUpdate',
          'componentWillUpdate',
          'componentDidUpdate',
          'componentWillUnmount',
        ],
        rendering: ['/^render.+$/', 'render'],
      },
    },
  ],
  'react/style-prop-object': 'error',
  'react/no-array-index-key': 'error',
  'react/forbid-foreign-prop-types': ['warn', { allowInPropTypes: true }],
  'react/void-dom-elements-no-children': 'error',
  'react/default-props-match-prop-types': 'error',
  'react/no-unused-state': 'error',
  'react/no-typos': 'error',
  'react/jsx-curly-brace-presence': [
    'error',
    { props: 'never', children: 'never' },
  ],
  'react/no-access-state-in-setstate': 'error',
  'react/button-has-type': 'error',
  'react/no-this-in-sfc': 'error',
  'react/prop-types': 'off',
  'react-hooks/exhaustive-deps': 'warn',
  'react-hooks/rules-of-hooks': 'error',
};

const jsxA11yRules = {
  'jsx-a11y/label-has-for': [
    'error',
    { required: { every: ['nesting', 'id'] }, allowChildren: false },
  ],
  'jsx-a11y/no-autofocus': ['error', { ignoreNonDOM: true }],
  'jsx-a11y/no-interactive-element-to-noninteractive-role': [
    'error',
    { tr: ['none', 'presentation'] },
  ],
  'jsx-a11y/no-noninteractive-element-to-interactive-role': [
    'error',
    {
      ul: [
        'listbox',
        'menu',
        'menubar',
        'radiogroup',
        'tablist',
        'tree',
        'treegrid',
      ],
      ol: [
        'listbox',
        'menu',
        'menubar',
        'radiogroup',
        'tablist',
        'tree',
        'treegrid',
      ],
      li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
      table: ['grid'],
      td: ['gridcell'],
    },
  ],
  'jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['tabpanel'] }],
  'jsx-a11y/anchor-is-valid': [
    'error',
    {
      components: ['Link'],
      specialLink: ['to', 'hrefLeft', 'hrefRight'],
      aspects: ['noHref', 'invalidHref', 'preferButton'],
    },
  ],
  'jsx-a11y/no-static-element-interactions': 'off',
  'jsx-a11y/click-events-have-key-events': 'off',
};

export default defineConfig([
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],
    extends: [
      js.configs.recommended,
      importPlugin.flatConfigs.recommended,
      reactPlugin.configs.flat.recommended,
      reactPlugin.configs.flat['jsx-runtime'],
      jsxA11y.flatConfigs.recommended,
      prettierConfig,
    ],

    plugins: {
      'react-hooks': fixupPluginRules(reactHooks),
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        vi: 'readonly',
      },
      ecmaVersion: 2020,
      parser: tsParser,
    },

    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },

    rules: {
      ...coreRules,
      ...importRules,
      ...reactRules,
      ...jsxA11yRules,

      'prettier/prettier': 'error',
    },
  },
  {
    files: ['src/middlewares/*.js'],

    rules: {
      'arrow-body-style': 'off',
    },
  },
  {
    files: ['**/__tests__/**'],

    rules: {
      // conflicts with the vi.mock()/namespace-import
      // property reassignment pattern used throughout the test suite
      'no-import-assign': 'off',
      'no-useless-assignment': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],

    plugins: {
      '@typescript-eslint': typescriptEslint,
    },

    rules: {
      'no-nested-ternary': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',

      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': ['error'],

      // import/named can't resolve TS type-only named exports reliably;
      // TypeScript's own type checker already covers this
      'import/named': 'off',
    },
  },
]);
