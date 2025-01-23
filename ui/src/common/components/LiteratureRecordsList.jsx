import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import { Link } from 'react-router-dom';

import { LITERATURE } from '../routes';
import { pluralizeUnlessSingle } from '../utils';
import InlineDataList from './InlineList';
import LiteratureTitle from './LiteratureTitle';

function renderLiteratureRecord(literatureRecord) {
  const title = literatureRecord.getIn(['titles', 0]);
  return (
    <Link
      data-test-id="author-link"
      to={`${LITERATURE}/${literatureRecord.get('control_number')}`}
    >
      <LiteratureTitle title={title} />
    </Link>
  );
}

function LiteratureRecordsList({ literatureRecords }) {
  return (
    <InlineDataList
      label={`INSPIRE ${pluralizeUnlessSingle(
        'paper',
        literatureRecords && literatureRecords.size
      )}`}
      items={literatureRecords}
      extractKey={(literatureRecord) => literatureRecord.get('control_number')}
      renderItem={renderLiteratureRecord}
    />
  );
}

LiteratureRecordsList.propTypes = {
  literatureRecords: PropTypes.instanceOf(List),
};

export default LiteratureRecordsList;
