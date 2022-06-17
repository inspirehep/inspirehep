import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import { Link } from 'react-router-dom';

import { LITERATURE } from '../../common/routes';
import pluralizeUnlessSingle from '../../common/utils';
import InlineList from '../../common/components/InlineList';
import LiteratureTitle from '../../common/components/LiteratureTitle';

function renderLiteratureRecord(literatureRecord: any) {
  const title = literatureRecord.getIn(['titles', 0]);
  return (
    <Link
      data-test-id="author-link"
      to={`${LITERATURE}/${literatureRecord.get('control_number')}`}
    >
      {/* @ts-ignore */}
      <LiteratureTitle title={title} />
    </Link>
  );
}

function LiteratureRecordsList({
  literatureRecords
}: any) {
  return (
    <InlineList
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      label={`INSPIRE ${pluralizeUnlessSingle(
        'paper',
        literatureRecords && literatureRecords.size
      )}`}
      items={literatureRecords}
      extractKey={(literatureRecord: any) => literatureRecord.get('control_number')}
      renderItem={renderLiteratureRecord}
    />
  );
}

LiteratureRecordsList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  literatureRecords: PropTypes.instanceOf(List),
};

export default LiteratureRecordsList;
