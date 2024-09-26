import React from 'react';
import { Map } from 'immutable';

import { InlineUL, SEPARATOR_COMMA } from './InlineList';

function Address({ address }: { address: Map<string, any> }) {
  const placeName = address.get('place_name');
  const city = address.getIn(['cities', 0]) as string;
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

export default Address;
