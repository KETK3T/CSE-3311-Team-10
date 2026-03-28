const {defineConfig} = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')


module.exports = defineConfig([
	expoConfig,
	{
		ignores: ['dist/**', 'node_modules/**', '.expo/**'],
		rules: {
			'no-restricted-syntax': [
				'warn',
				{
					selector: "Literal[value=/supabase\\.co/]",
					message: 'Avoid hardcoding Supabase URLs... Please use environment variables.'
				},
			],

			'no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
			'no-undef': 'error',

			'react/jsx-key': 'error',
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',

			'eqeqeq': ['error', 'always'],
			'no-debugger': 'error',


		},
	},
])