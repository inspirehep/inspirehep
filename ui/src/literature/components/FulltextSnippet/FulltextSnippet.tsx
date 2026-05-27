import React from 'react';
import SanitizedHTML from '../../../common/components/SanitizedHTML';

import './FulltextSnippet.less';

const renderSnippet = (snippet: string) => <SanitizedHTML html={snippet} />;

export const FulltextSnippet = ({ snippet }: { snippet: string }) => (
  <div className="__FulltextSnippet__">
    {`"`}
    {renderSnippet(snippet)}
    {` ..."`}
  </div>
);
