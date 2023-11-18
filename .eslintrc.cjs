/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  plugins: [
    'unused-imports',
  ],
  extends: [
    'eslint:recommended',
    'plugin:unicorn/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:testing-library/react',
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
    react: {
      version: 'detect',
    },
  },
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'eol-last': ['error', 'always'],
    'func-style': ['error', 'expression'],
    'indent': ['error', 2, {
      'SwitchCase': 1,
      'ignoredNodes': [
        'TemplateLiteral *',
      ],
    }],
    'jsx-quotes': ['error', 'prefer-double'],
    'no-multi-spaces': 'error',
    'no-multiple-empty-lines': ['error', {
      'max': 1,
      'maxBOF': 0,
      'maxEOF': 0,
    }],
    'no-unused-vars': 'off',
    'object-curly-spacing': ['error', 'always'],
    'prefer-arrow-callback': 'error',
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'space-before-function-paren': ['error', {
      'anonymous': 'always',
      'named': 'never',
      'asyncArrow': 'always',
    }],
    'space-infix-ops': ['error', { 'int32Hint': false }],
    'yoda': 'off',
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    'import/newline-after-import': ['error', {
      'count': 1,
    }],
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal', ['index', 'parent', 'sibling'], 'object', 'type'],
      'newlines-between': 'always',
      'pathGroupsExcludedImportTypes': ['builtin'],
      'alphabetize': { 'order': 'asc', 'caseInsensitive': true },
    }],
    // Disable this rule because it does not support the less-than operator.
    // @see: https://github.com/sindresorhus/eslint-plugin-unicorn/issues/2009
    'unicorn/explicit-length-check': 'off',
    // Allow the use of the Array.forEach method because of the preference for functional programming.
    'unicorn/no-array-for-each': 'off',
    // Allow the use of the Array.reduce method because of the preference for functional programming.
    'unicorn/no-array-reduce': 'off',
    // Allow null to be used because some libraries have different meanings for null and undefined.
    'unicorn/no-null': 'off',
    // Loosen some overly strict prevent abbreviation rules.
    'unicorn/prevent-abbreviations': ['error', {
      'replacements': {
        // Allow the use of this abbreviation when retrieving environment variables in Node.js, as it is used extensively.
        'env': false,
        // Allow the use of this abbreviation when defining the types of component properties in React, as it is used extensively.
        'props': false,
        // Allow the use of this abbreviation when retrieving DOM references in React, as it is used extensively.
        'ref': false,
      },
    }],
    // Disallow unused imports.
    'unused-imports/no-unused-imports': 'error',
    // Disallow unused variables and arguments, but allow them if they are prefixed with "_".
    'unused-imports/no-unused-vars': ['error', {
      'vars': 'all',
      'varsIgnorePattern': '^_',
      'args': 'after-used',
      'argsIgnorePattern': '^_',
    }],
    'react/function-component-definition': ['error', {
      'namedComponents': 'arrow-function',
      'unnamedComponents': 'arrow-function',
    }],
    'react/jsx-boolean-value': 'error',
    'react/jsx-closing-bracket-location': ['error', 'tag-aligned'],
    'react/jsx-closing-tag-location': 'error',
    'react/jsx-no-target-blank': 'off',
    'react/jsx-curly-brace-presence': ['error', 'never'],
    'react/jsx-curly-spacing': ['error', {
      'when': 'never',
      'attributes': true,
      'children': true,
    }],
    'react/jsx-equals-spacing': ['error', 'never'],
    'react/jsx-first-prop-new-line': ['error', 'multiline'],
    'react/jsx-fragments': ['error', 'syntax'],
    'react/jsx-handler-names': ['error', {
      'eventHandlerPrefix': 'handle',
      'eventHandlerPropPrefix': 'on',
      'checkLocalVariables': false,
      'checkInlineFunction': false,
    }],
    'react/jsx-newline': ['error', {
      'prevent': true,
    }],
    'react/jsx-no-useless-fragment': 'error',
    'react/jsx-props-no-multi-spaces': 'error',
    'react/jsx-sort-props': ['error', {
      'callbacksLast': false,
      'shorthandFirst': false,
      'shorthandLast': true,
      'multiline': 'ignore',
      'ignoreCase': true,
      'noSortAlphabetically': true,
      'reservedFirst': true,
      'locale': 'auto',
    }],
    'react/jsx-tag-spacing': ['error', {
      'closingSlash': 'never',
      'beforeSelfClosing': 'always',
      'afterOpening': 'never',
      'beforeClosing': 'never',
    }],
    'react/jsx-wrap-multilines': ['error', {
      'declaration': 'parens-new-line',
      'assignment': 'parens-new-line',
      'return': 'parens-new-line',
      'arrow': 'parens-new-line',
      'condition': 'parens-new-line',
      'logical': 'parens-new-line',
      'prop': 'parens-new-line',
    }],
    'react/no-unknown-property': 'off',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/self-closing-comp': 'error',
  },
  overrides: [
    {
      files: ['*.{ts,tsx}'],
      extends: [
        'plugin:import/typescript',
      ],
      settings: {
        'import/parsers': {
          '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
      },
      rules: {
        '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
        '@typescript-eslint/consistent-type-imports': ['error', {
          'prefer': 'type-imports',
        }],
        '@typescript-eslint/indent': ['error', 2, {
          'SwitchCase': 1,
          'ignoredNodes': ['TemplateLiteral *', 'TSTypeParameterInstantiation'],
        }],
        '@typescript-eslint/member-delimiter-style': ['error', {
          'multiline': {
            'delimiter': 'semi',
            'requireLast': true,
          },
          'singleline': {
            'delimiter': 'semi',
            'requireLast': false,
          },
        }],
        '@typescript-eslint/no-misused-promises': ['error', {
          'checksVoidReturn': {
            'attributes': false,
          },
        }],
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/object-curly-spacing': ['error', 'always'],
        '@typescript-eslint/quotes': ['error', 'single'],
        '@typescript-eslint/semi': ['error', 'always'],
        '@typescript-eslint/space-before-function-paren': ['error', {
          'anonymous': 'always',
          'named': 'never',
          'asyncArrow': 'always',
        }],
        '@typescript-eslint/space-infix-ops': ['error', { 'int32Hint': false }],
      },
    },
    {
      files: [
        '*.test.{js,jsx,ts,tsx}',
        '**/__tests__/**',
      ],
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/prefer-ts-expect-error': 'off',
      },
    },
  ],
};
