import React, { useCallback } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import { List } from 'immutable';
import InlineList from './InlineList';
import pluralizeUnlessSingle from '../utils';
import { INSTITUTIONS_PID_TYPE, EXPERIMENTS_PID_TYPE } from '../constants';

function extractKeyFromRelatedRecord(relatedRecord: $TSFixMe) {
  return relatedRecord.get('control_number');
}

type Props = {
    relatedRecords?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    relationType: string;
    label: string;
    pidType: $TSFixMe; // TODO: PropTypes.oneOf([INSTITUTIONS_PID_TYPE, EXPERIMENTS_PID_TYPE])
};

function RelatedRecordsList({ relatedRecords, relationType, label, pidType }: Props) {
  const renderRelatedRecord = useCallback(
    relatedRecord => (
      <Link to={`/${pidType}/${relatedRecord.get('control_number')}`}>
        {relatedRecord.get('legacy_ICN') || relatedRecord.get('legacy_name')}
      </Link>
    ),
    [pidType]
  );

  return (
    <InlineList
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
