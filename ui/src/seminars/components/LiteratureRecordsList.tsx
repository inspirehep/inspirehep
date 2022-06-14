import React from 'react';
import { List } from 'immutable';

// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';

import { LITERATURE } from '../../common/routes';
import pluralizeUnlessSingle from '../../common/utils';
import InlineList from '../../common/components/InlineList';
import LiteratureTitle from '../../common/components/LiteratureTitle';

function renderLiteratureRecord(literatureRecord: $TSFixMe) {
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

type Props = {
    literatureRecords?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

function LiteratureRecordsList({ literatureRecords }: Props) {
  return (
    <InlineList
      label={`INSPIRE ${pluralizeUnlessSingle(
        'paper',
        literatureRecords && literatureRecords.size
      )}`}
      items={literatureRecords}
      extractKey={(literatureRecord: $TSFixMe) => literatureRecord.get('control_number')}
      renderItem={renderLiteratureRecord}
    />
  );
}

export default LiteratureRecordsList;
