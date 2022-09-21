import React from 'react';
// @ts-ignore
import SanitizedHTML from 'react-sanitized-html';

import './FulltextSnippet.scss';

const renderSnippet = (snippet: string) => <SanitizedHTML html={snippet} />;

export const FulltextSnippet = ({ snippet }: { snippet: string }) => (
  <div className="__FulltextSnippet__">
    {`"`}
    {renderSnippet(snippet)}
    {` ..."`}
  </div>
);
