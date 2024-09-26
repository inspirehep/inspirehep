import React from 'react';
import { Link } from 'react-router-dom';
import { Map } from 'immutable';
import { getRecordIdFromRef, getAuthorName } from '../../../common/utils';
import { AUTHORS } from '../../../common/routes';

function Advisor({ advisor }: { advisor: Map<string, string> }) {
  const name = advisor.get('name');
  const $ref = advisor.getIn(['record', '$ref']) as string;
  const recordId = getRecordIdFromRef($ref);
  const profileOrSearchUrl = recordId
    ? `${AUTHORS}/${recordId}`
    : `${AUTHORS}?q=${encodeURIComponent(name as string)}`;

  return <Link to={profileOrSearchUrl}>{getAuthorName(advisor)}</Link>;
}

export default Advisor;
