import React from 'react';
import { Map } from 'immutable';
import { InlineUL, SEPARATOR_COMMA } from './InlineList';

type Props = {
    address: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

function Address({ address }: Props) {
  const placeName = address.get('place_name');
  const city = address.getIn(['cities', 0]);
  const state = address.get('state');
  const country = address.get('country');
  return (
    <span>
      {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
      <InlineUL separator={SEPARATOR_COMMA} wrapperClassName="di">
        {placeName && <span>{placeName}</span>}
        {city && <span>{city}</span>}
        {state && <span>{state}</span>}
        {country && <span>{country}</span>}
      </InlineUL>
    </span>
  );
}

export default Address;
