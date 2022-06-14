import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { InlineUL, SEPARATOR_COMMA } from './InlineList';

function Address({
  address
}: any) {
  const placeName = address.get('place_name');
  const city = address.getIn(['cities', 0]);
  const state = address.get('state');
  const country = address.get('country');
  return (
    <span>
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  address: PropTypes.instanceOf(Map).isRequired,
};

export default Address;
