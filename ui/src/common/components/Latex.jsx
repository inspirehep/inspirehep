import { useMemo } from 'react';
import DOMPurify from 'dompurify';
import PropTypes from 'prop-types';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const DELIMITERS = [
  { left: '$$', right: '$$', display: true },
  { left: '\\[', right: '\\]', display: true },
  { left: '\\(', right: '\\)', display: false },
  { left: '$', right: '$', display: false },
];

const PURIFY = {
  ADD_TAGS: ['none', 'mprescripts'], // APS MathML prescripts
  FORBID_TAGS: [
    'style',
    'form',
    'input',
    'button',
    'textarea',
    'select',
    'img',
    'video',
    'audio',
    'source',
    'picture',
    'image',
  ],
  FORBID_ATTR: ['style'],
  RETURN_DOM: true,
};

function findEndOfMath(delimiterValue, text, startIndex) {
  let index = startIndex;
  let braceLevel = 0;

  const delimLength = delimiterValue.length;

  while (index < text.length) {
    const character = text[index];

    if (
      braceLevel <= 0 &&
      text.slice(index, index + delimLength) === delimiterValue
    ) {
      return index;
    }
    if (character === '\\') {
      index++;
    } else if (character === '{') {
      braceLevel++;
    } else if (character === '}') {
      braceLevel--;
    }

    index++;
  }

  return -1;
}

function escapeRegex(text) {
  return text.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

const amsRegex = /^\\begin{/;

function splitAtDelimiters(text) {
  let index;
  const data = [];
  let splittedText = text;

  const regexLeft = new RegExp(
    `(${DELIMITERS.map((x) => escapeRegex(x.left)).join('|')})`
  );

  while (true) {
    index = splittedText.search(regexLeft);
    if (index === -1) {
      break;
    }
    if (index > 0) {
      data.push({
        type: 'text',
        data: splittedText.slice(0, index),
      });
      splittedText = splittedText.slice(index);
    }
    const current = splittedText;
    const i = DELIMITERS.findIndex((delim) => current.startsWith(delim.left));
    index = findEndOfMath(
      DELIMITERS[i].right,
      splittedText,
      DELIMITERS[i].left.length
    );
    if (index === -1) {
      break;
    }
    const rawData = splittedText.slice(0, index + DELIMITERS[i].right.length);
    const math = amsRegex.test(rawData)
      ? rawData
      : splittedText.slice(DELIMITERS[i].left.length, index);
    data.push({
      type: 'math',
      data: math,
      rawData,
      display: DELIMITERS[i].display,
    });
    splittedText = splittedText.slice(index + DELIMITERS[i].right.length);
  }

  if (splittedText !== '') {
    data.push({
      type: 'text',
      data: splittedText,
    });
  }

  return data;
}

function decodeEntities(text) {
  if (!text.includes('&')) return text;
  return new DOMParser().parseFromString(text, 'text/html').documentElement
    .textContent;
}

function renderLatex(text) {
  const parts = splitAtDelimiters(text);
  const html = parts
    .map((part, i) =>
      part.type === 'math' ? `<span data-latex="${i}"></span>` : part.data
    )
    .join('');
  const root = DOMPurify.sanitize(html, PURIFY);
  root.querySelectorAll('[data-latex]').forEach((el) => {
    const part = parts[el.getAttribute('data-latex')];
    el.removeAttribute('data-latex');
    if (part?.type !== 'math') return;
    const tex = decodeEntities(part.data);
    try {
      katex.render(tex, el, {
        displayMode: part.display,
      });
    } catch {
      el.replaceWith(tex);
    }
  });
  return root.innerHTML;
}

function Latex({ children }) {
  const html = useMemo(
    () => (typeof children === 'string' ? renderLatex(children) : null),
    [children]
  );
  return html === null ? (
    children
  ) : (
    // eslint-disable-next-line react/no-danger -- sanitized
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}

Latex.propTypes = { children: PropTypes.node };

export default Latex;
