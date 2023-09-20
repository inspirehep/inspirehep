import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { List, Map } from 'immutable';

import InlineDataList from './InlineList';
import { pluralizeUnlessSingle } from '../utils';
import { INSTITUTIONS_PID_TYPE, EXPERIMENTS_PID_TYPE } from '../constants';

function extractKeyFromRelatedRecord(relatedRecord: Map<string, any>) {
  return relatedRecord.get('control_number');
}

function RelatedRecordsList({
  relatedRecords,
  relationType,
  label,
  pidType,
}: {
  relatedRecords: List<any>;
  relationType: string;
  label: string;
  pidType: typeof INSTITUTIONS_PID_TYPE | typeof EXPERIMENTS_PID_TYPE;
}) {
  const renderRelatedRecord = useCallback(
    (relatedRecord) => (
      <Link to={`/${pidType}/${relatedRecord.get('control_number')}`}>
        {relatedRecord.get('legacy_ICN') || relatedRecord.get('legacy_name')}
      </Link>
    ),
    [pidType]
  );

  return (
    <InlineDataList
      label={`${relationType} ${pluralizeUnlessSingle(
        label,
        relatedRecords && relatedRecords.size
      )}`}
      items={relatedRecords}
      extractKey={extractKeyFromRelatedRecord}
      renderItem={renderRelatedRecord}
    />
  );
}

export default RelatedRecordsList;
