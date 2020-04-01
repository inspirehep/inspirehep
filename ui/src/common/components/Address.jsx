import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { InlineUL, SEPARATOR_COMMA } from './InlineList';

function Address({ address }) {
  const placeName = address.get('place_name');
  const city = address.getIn(['cities', 0]);
  const state = address.get('state');
  const country = address.get('country');
  return (
    <span>
      <InlineUL separator={SEPARATOR_COMMA} wrapperClassName="di">
        {placeName && <span>{placeName}</span>}
        {city && <span>{city}</span>}
        {state && <span>{state}</span>}
        {country && <span>{country}</span>}
      </InlineUL>
    </span>
  );
}

Address.propTypes = {
  address: PropTypes.instanceOf(Map).isRequired,
};

export default Address;
