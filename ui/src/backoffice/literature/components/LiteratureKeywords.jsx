import React from 'react';
import { Badge } from 'antd';
import { List } from 'immutable';

const LiteratureKeywords = ({ classifierResults }) => {
  if (!classifierResults) return null;

  const completeOutput = classifierResults.get('complete_output');
  if (!completeOutput) return null;

  const fulltextUsed = classifierResults.get('fulltext_used');

  const coreKeywords = completeOutput.get('core_keywords') ?? List();
  const filteredCoreKeywords =
    completeOutput.get('filtered_core_keywords') ?? List();

  const coreCount = coreKeywords.size;
  const filteredCount = filteredCoreKeywords.size;

  return (
    <div>
      <p className="decision-core-keywords">
        {coreCount} core keywords from {fulltextUsed ? 'fulltext' : 'metadata'}
      </p>
      <p className="decision-filtered-core-keywords-title">
        {filteredCount} Filtered{filteredCount > 0 ? ' :' : ''}
      </p>
      <div className="decision-filtered-core-keywords-list">
        {filteredCoreKeywords.map((keyword) => {
          const label = keyword.get('keyword');
          const count = keyword.get('number');

          return (
            <div
              key={label}
              className="decision-filtered-core-keywords-list-inner"
            >
              <div style={{ paddingRight: 12 }}>{label}</div>
              <div style={{ minWidth: 36, textAlign: 'right' }}>
                <Badge count={count} color="green" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiteratureKeywords;
