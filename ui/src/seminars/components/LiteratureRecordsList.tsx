import React from 'react';
import { List, Map } from 'immutable';
import { Link } from 'react-router-dom';

import { LITERATURE } from '../../common/routes';
import { pluralizeUnlessSingle } from '../../common/utils';
import InlineDataList from '../../common/components/InlineList';
import LiteratureTitle from '../../common/components/LiteratureTitle';

function renderLiteratureRecord(literatureRecord: Map<string, any>) {
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

function LiteratureRecordsList({
  literatureRecords,
}: {
  literatureRecords: List<Map<string, any>>;
}) {
  return (
    <InlineDataList
      label={`INSPIRE ${pluralizeUnlessSingle(
        'paper',
        literatureRecords && literatureRecords.size
      )}`}
      items={literatureRecords}
      extractKey={(literatureRecord: Map<string, any>) =>
        literatureRecord.get('control_number')
      }
      renderItem={renderLiteratureRecord}
    />
  );
}

export default LiteratureRecordsList;
