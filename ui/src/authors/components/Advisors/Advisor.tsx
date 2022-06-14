import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import { Map } from 'immutable';
import { getRecordIdFromRef, getAuthorName } from '../../../common/utils';
import { AUTHORS } from '../../../common/routes';

type Props = {
    advisor: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

function Advisor({ advisor }: Props) {
  const name = advisor.get('name');
  const $ref = advisor.getIn(['record', '$ref']);
  const recordId = getRecordIdFromRef($ref);
  const profileOrSearchUrl = recordId
    ? `${AUTHORS}/${recordId}`
    : `${AUTHORS}?q=${encodeURIComponent(name)}`;
  return <Link to={profileOrSearchUrl}>{getAuthorName(advisor)}</Link>;
}

export default Advisor;
