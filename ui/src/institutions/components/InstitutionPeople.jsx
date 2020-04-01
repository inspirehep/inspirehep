import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { AUTHORS } from '../../common/routes';

function InstitutionPeople({ recordId }) {
  return (
    <span>
      List of{' '}
      <Link to={`${AUTHORS}?q=positions.record.$ref:${recordId}`}>People</Link>
    </span>
  );
}

InstitutionPeople.propTypes = {
  recordId: PropTypes.number.isRequired,
};

export default InstitutionPeople;
