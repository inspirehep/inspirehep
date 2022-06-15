import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import InlineList from './InlineList';
import pluralizeUnlessSingle from '../utils';
import { INSTITUTIONS_PID_TYPE, EXPERIMENTS_PID_TYPE } from '../constants';

function extractKeyFromRelatedRecord(relatedRecord: any) {
  return relatedRecord.get('control_number');
}

function RelatedRecordsList({
  relatedRecords,
  relationType,
  label,
  pidType
}: any) {
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
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  relatedRecords: PropTypes.instanceOf(List),
  relationType: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  pidType: PropTypes.oneOf([INSTITUTIONS_PID_TYPE, EXPERIMENTS_PID_TYPE])
    .isRequired,
};

export default RelatedRecordsList;
