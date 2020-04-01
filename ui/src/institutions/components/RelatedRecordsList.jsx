import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import InlineList from '../../common/components/InlineList';
import { INSTITUTIONS } from '../../common/routes';
import pluralizeUnlessSingle from '../../common/utils';

function renderRelatedRecord(relatedRecord) {
  return (
    <Link to={`${INSTITUTIONS}/${relatedRecord.get('control_number')}`}>
      {relatedRecord.get('legacy_ICN')}
    </Link>
  );
}

function extractKeyFromRelatedRecord(relatedRecord) {
  return relatedRecord.get('control_number');
}

function RelatedRecordsList({ relatedRecords, relationType }) {
  return (
    <InlineList
      label={`${relationType} ${pluralizeUnlessSingle(
        'Institution',
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
};

export default RelatedRecordsList;
