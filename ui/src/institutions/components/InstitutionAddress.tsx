import React from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import InlineList, {
  InlineUL,
  SEPARATOR_COMMA,
} from '../../common/components/InlineList';

function postalAddressesContainWord(postalAddresses: any, word: any) {
  return postalAddresses.some(
    (address: any) => address.toLowerCase().indexOf(word.toLowerCase()) > -1
  );
}

function InstitutionAddress({
  address
}: any) {
  const postalAddresses = address.get('postal_address', List());
  const city = address.getIn(['cities', 0]);
  const country = address.get('country');
  return (
    <span>
      {/* @ts-ignore */}
      <InlineUL separator={SEPARATOR_COMMA} wrapperClassName="di">
       {/* @ts-ignore */}
        {postalAddresses.size > 0 && <InlineList items={postalAddresses} />}
        {city &&
          !postalAddressesContainWord(postalAddresses, city) && (
            <span>{city}</span>
          )}
        {country &&
          !postalAddressesContainWord(postalAddresses, country) && (
            <span>{country}</span>
          )}
      </InlineUL>
    </span>
  );
}

InstitutionAddress.propTypes = {
  /* @ts-ignore */
  address: PropTypes.instanceOf(Map).isRequired,
};

export default InstitutionAddress;
