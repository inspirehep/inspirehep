import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Map } from 'immutable';
import { getRecordIdFromRef } from '../../../common/utils';
import { AUTHORS } from '../../../common/routes';

function Advisor({ advisor }) {
  const name = advisor.get('name');
  const $ref = advisor.getIn(['record', '$ref']);
  const recordId = getRecordIdFromRef($ref);
  return recordId ? <Link to={`${AUTHORS}/${recordId}`}>{name}</Link> : name;
}

Advisor.propTypes = {
  advisor: PropTypes.instanceOf(Map).isRequired,
};

export default Advisor;
