import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**/*']
  },
  {
    files: ['**/*.rules'],
    plugins: {
      'firebase-rules': firebaseRulesPlugin
    },
    languageOptions: {
      globals: {
        ...globals.browser
      }
    },
    rules: {
      ...firebaseRulesPlugin.configs['flat/recommended'].rules
    }
  }
];
