import React, { useState } from 'react';
import { List } from 'immutable';
import { Button } from 'antd';

const LiteratureSearchKeywords = ({ classifierResults }) => {
  const [showKeywords, setShowKeywords] = useState(false);

  if (!classifierResults) {
    return null;
  }

  const completeOutput = classifierResults.get('complete_output');
  if (!completeOutput) {
    return null;
  }

  const filteredKeywords =
    completeOutput.get('filtered_core_keywords') ?? List();
  const coreKeywords = completeOutput.get('core_keywords') ?? List();
  const fulltextUsed = classifierResults.get('fulltext_used');

  const labels = [
    ...filteredKeywords.map((item) => item?.get?.('keyword')).toArray(),
    ...coreKeywords.map((item) => item?.get?.('keyword')).toArray(),
  ].filter(Boolean);

  const allKeywords = [...new Set(labels)];

  const visibleKeywords = showKeywords ? allKeywords : allKeywords.slice(0, 4);

  return (
    <div>
      <p
        className={
          filteredKeywords.size > 1
            ? 'filtered-accept-core-keyword'
            : 'filtered-accept-keyword'
        }
      >
        {filteredKeywords.size} Filtered core keywords from{' '}
        {fulltextUsed ? 'fulltext' : 'metadata'}
      </p>
      {visibleKeywords.join(', ')}
      {allKeywords.length > 4 && (
        <div>
          <Button
            type="link"
            onClick={() => setShowKeywords((prev) => !prev)}
            style={{ padding: 0 }}
          >
            {showKeywords ? 'Hide keywords' : 'Show all keywords'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LiteratureSearchKeywords;
