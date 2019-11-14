import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

function ConferenceLocation({ location }) {
  const city = location.getIn(['cities', 0]);
  const country = location.get('country');
  const renderSeparator = city && country;
  return (
    <span>
      {city}
      {renderSeparator && ', '}
      {country}
    </span>
  );
}

ConferenceLocation.propTypes = {
  location: PropTypes.instanceOf(Map).isRequired,
};

export default ConferenceLocation;
