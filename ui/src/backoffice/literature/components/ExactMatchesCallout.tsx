import React from 'react';
import { Alert } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { List } from 'immutable';

import LinkWithTargetBlank from '../../../common/components/LinkWithTargetBlank';
import { LITERATURE } from '../../../common/routes';

type ExactMatchesCalloutProps = {
  exactMatches: List<number>;
};

const ExactMatchesCallout = ({ exactMatches }: ExactMatchesCalloutProps) => {
  const ids = exactMatches.toArray();
  const exactMatchesSearchUrl = `${LITERATURE}/search?q=${ids
    .map((id) => `recid:${id}`)
    .join('+or+')}`;

  return (
    <Alert
      message={
        <span>
          <strong>Duplicate IDs:</strong>{' '}
          <LinkWithTargetBlank href={exactMatchesSearchUrl}>
            {ids.join(' or ')}
            <ExportOutlined style={{ marginLeft: 4 }} />
          </LinkWithTargetBlank>
        </span>
      }
      description="When you resolve this error, restart the workflow to continue"
      type="error"
    />
  );
};

export default ExactMatchesCallout;
