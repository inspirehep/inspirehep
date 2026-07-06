import DOMPurify from 'dompurify';

interface Props {
  html: string;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  className?: string;
}

// Mirrors sanitize-html v2 defaults to preserve the behavior of the old react-sanitized-html component.
const DEFAULT_ALLOWED_TAGS = [
  'address',
  'article',
  'aside',
  'footer',
  'header',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hgroup',
  'main',
  'nav',
  'section',
  'blockquote',
  'dd',
  'div',
  'dl',
  'dt',
  'figcaption',
  'figure',
  'hr',
  'li',
  'ol',
  'p',
  'pre',
  'ul',
  'a',
  'abbr',
  'b',
  'bdi',
  'bdo',
  'br',
  'cite',
  'code',
  'data',
  'dfn',
  'em',
  'i',
  'kbd',
  'mark',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
  'var',
  'wbr',
  'caption',
  'col',
  'colgroup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
];
const DEFAULT_ALLOWED_ATTR = ['href', 'name', 'target', 'src'];

function sanitizeHtml(
  html: string,
  allowedTags?: string[],
  allowedAttributes?: Record<string, string[]>
): string {
  const config: DOMPurify.Config = {
    ALLOWED_TAGS: allowedTags ?? DEFAULT_ALLOWED_TAGS,
  };
  if (allowedAttributes) {
    config.ALLOWED_ATTR = [...new Set(Object.values(allowedAttributes).flat())];
    DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
      const tag = node.tagName.toLowerCase() ?? '';
      if (!(allowedAttributes[tag] ?? []).includes(data.attrName)) {
        data.keepAttr = false;
      }
    });
  } else {
    config.ALLOWED_ATTR = DEFAULT_ALLOWED_ATTR;
  }
  try {
    return String(DOMPurify.sanitize(html ?? '', config));
  } finally {
    if (allowedAttributes) {
      DOMPurify.removeHook('uponSanitizeAttribute');
    }
  }
}

const SanitizedHTML = ({
  html,
  allowedTags,
  allowedAttributes,
  className,
}: Props) => (
  <div
    className={className}
    dangerouslySetInnerHTML={{
      __html: sanitizeHtml(html, allowedTags, allowedAttributes),
    }}
  />
);

export default SanitizedHTML;
