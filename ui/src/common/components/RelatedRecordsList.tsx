import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import InlineList from './InlineList';
import pluralizeUnlessSingle from '../utils';
import { INSTITUTIONS_PID_TYPE, EXPERIMENTS_PID_TYPE } from '../constants';

function extractKeyFromRelatedRecord(relatedRecord) {
  return relatedRecord.get('control_number');
}

function RelatedRecordsList({ relatedRecords, relationType, label, pidType }) {
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

RelatedRecordsList.propTypes = {
  relatedRecords: PropTypes.instanceOf(List),
  relationType: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  pidType: PropTypes.oneOf([INSTITUTIONS_PID_TYPE, EXPERIMENTS_PID_TYPE])
    .isRequired,
};

export default RelatedRecordsList;
