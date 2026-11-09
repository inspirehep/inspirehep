import { customizeValidator } from '@rjsf/validator-ajv8';

const DATE_FORMATS = [/^\d{4}$/, /^\d{4}-\d{2}$/, /^\d{4}-\d{2}-\d{2}$/];
const DATE_TIME_FORMAT =
  /^\d{4}-[0-1]\d-[0-3]\d[t\s][0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:z|[+-]\d\d:\d\d)?$/i;

// The backend validates with Python's `re.search`, which differs from JS
// regexes in two ways that made the editor stricter than the backend:
//  - `\w` is Unicode-aware (accented letters, ...), ASCII-only in JS
//  - `$` also matches right before a trailing newline
// The schema patterns are translated to the JS equivalent of Python's behavior.

const UNICODE_WORD_CHARS = '\\p{L}\\p{N}_';
const translateWordEscape = (isInsideClass: boolean) =>
  isInsideClass ? UNICODE_WORD_CHARS : `[${UNICODE_WORD_CHARS}]`;

const translateIdentityEscape = (char: '-' | "'", isInsideClass: boolean) =>
  char === '-' && isInsideClass ? '\\-' : char;

const translateEscapeSequence = (
  escapedChar: string,
  isInsideClass: boolean
) => {
  if (escapedChar === 'w') {
    return translateWordEscape(isInsideClass);
  }
  if (escapedChar === '-' || escapedChar === "'") {
    return translateIdentityEscape(escapedChar, isInsideClass);
  }
  return `\\${escapedChar}`;
};

const PYTHON_END_ANCHOR = '\\n?$';

const translatePythonPatternToJs = (pattern: string) => {
  let translated = '';
  let isInsideClass = false;

  for (let i = 0; i < pattern.length; i += 1) {
    const char = pattern[i];
    const isEscape = char === '\\' && i + 1 < pattern.length;

    if (isEscape) {
      i += 1;
      translated += translateEscapeSequence(pattern[i], isInsideClass);
    } else if (char === '$' && !isInsideClass) {
      translated += PYTHON_END_ANCHOR;
    } else {
      if (char === '[') {
        isInsideClass = true;
      } else if (char === ']') {
        isInsideClass = false;
      }
      translated += char;
    }
  }

  return translated;
};

const compileBackendCompatibleRegExp = (pattern: string, flags?: string) => {
  try {
    return new RegExp(translatePythonPatternToJs(pattern), `${flags ?? ''}u`);
  } catch {
    return new RegExp('');
  }
};

const validator = customizeValidator({
  customFormats: {
    email: /^.+@.+$/,
    date: (value) => DATE_FORMATS.some((format) => format.test(value)),
    'date-time': DATE_TIME_FORMAT,
  },

  ajvOptionsOverrides: {
    // Ajv passes `u` as the flags argument to `regExp` when this is true. We
    // keep it false so `compileBackendCompatibleRegExp` receives empty flags
    // and appends `u` itself, after translating the pattern: schema patterns
    // use identity escapes (`\-`, `\'`) that are invalid under `u` as-is.
    unicodeRegExp: false,
    code: {
      regExp: Object.assign(compileBackendCompatibleRegExp, {
        code: 'compileBackendCompatibleRegExp',
      }),
    },
  },
});

export default validator;
