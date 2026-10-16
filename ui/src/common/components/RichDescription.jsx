import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import katex from 'katex';
import 'katex/dist/katex.min.css';

import SanitizedHTML from './SanitizedHTML';

const ALLOWED_ATTRIBUTES_BY_TAG = { a: ['href', 'title'] };
const ALLOWED_HTML_TAGS = [
  'a',
  'b',
  'br',
  'div',
  'em',
  'i',
  'li',
  'ol',
  'p',
  'strong',
  'ul',
];

// Single `$` follows pandoc-like rules so currency like "CLP$2.498 (~EUR$2448)"
// is not treated as math: the opening `$` can't precede whitespace, nor precede
// a digit when glued to a word; the closing `$` can't follow whitespace or
// precede a digit.
const LATEX_REGEX = new RegExp(
  [
    String.raw`\$\$((?:\\[\s\S]|[^\\])+?)\$\$`,
    String.raw`\\\[((?:\\[\s\S]|[^\\])+?)\\\]`,
    String.raw`\\\(((?:\\[\s\S]|[^\\])+?)\\\)`,
    String.raw`(?:(?<![\w$\\])\$(?![\s$])|(?<=\w)\$(?![\s$\d]))((?:\\[\s\S]|[^$\\])+?)(?<!\s)\$(?!\d)`,
  ].join('|'),
  'g'
);

function renderLatexInTextNode(node) {
  const text = node.nodeValue;
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;
  let match = LATEX_REGEX.exec(text);
  while (match) {
    const [raw, ...groups] = match;
    const tex = groups.find((group) => group !== undefined);
    const displayMode = raw.startsWith('$$') || raw.startsWith('\\[');
    if (match.index > lastIndex) {
      fragment.append(text.slice(lastIndex, match.index));
    }
    const span = document.createElement('span');
    span.innerHTML = katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
    });
    fragment.append(span);
    lastIndex = match.index + raw.length;
    match = LATEX_REGEX.exec(text);
  }
  if (lastIndex > 0) {
    fragment.append(text.slice(lastIndex));
    node.replaceWith(fragment);
  }
}

function renderLatex(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }
  textNodes.forEach(renderLatexInTextNode);
}

function RichDescription({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      renderLatex(ref.current);
    }
  }, [children]);

  return (
    <div ref={ref}>
      <SanitizedHTML
        allowedAttributes={ALLOWED_ATTRIBUTES_BY_TAG}
        allowedTags={ALLOWED_HTML_TAGS}
        html={children}
      />
    </div>
  );
}

RichDescription.propTypes = {
  children: PropTypes.node,
};

export default RichDescription;
