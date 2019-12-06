import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { addOrdinalSuffix } from '../../common/utils';
import { CONFERENCES } from '../../common/routes';

function ConferenceSeries({ series }) {
  const name = series.get('name');
  const number = series.get('number');
  return (
    <span>
      {number ? (
        <span>{addOrdinalSuffix(number)} conference</span>
      ) : (
        <span>Conference</span>
      )}
      {' in the '}
      <Link to={`${CONFERENCES}?q=series.name:${name}&start_date=all`}>
        {name}
      </Link>
      {' series'}
    </span>
  );
}

ConferenceSeries.propTypes = {
  series: PropTypes.instanceOf(Map).isRequired,
};

export default ConferenceSeries;
