import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Map } from 'immutable';
import { getRecordIdFromRef, getAuthorName } from '../../../common/utils';
import { AUTHORS } from '../../../common/routes';

function Advisor({ advisor }) {
  const name = advisor.get('name');
  const $ref = advisor.getIn(['record', '$ref']);
  const recordId = getRecordIdFromRef($ref);
  const profileOrSearchUrl = recordId
    ? `${AUTHORS}/${recordId}`
    : `${AUTHORS}?q=${encodeURIComponent(name)}`;
  return <Link to={profileOrSearchUrl}>{getAuthorName(advisor)}</Link>;
}

Advisor.propTypes = {
  advisor: PropTypes.instanceOf(Map).isRequired,
};

export default Advisor;
