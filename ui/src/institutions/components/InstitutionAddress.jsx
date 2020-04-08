import React from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import InlineList, {
  InlineUL,
  SEPARATOR_COMMA,
} from '../../common/components/InlineList';

function postalAddressesContainWord(postalAddresses, word) {
  return postalAddresses.some(
    address => address.toLowerCase().indexOf(word.toLowerCase()) > -1
  );
}

function InstitutionAddress({ address }) {
  const postalAddresses = address.get('postal_address', List());
  const city = address.getIn(['cities', 0]);
  const country = address.get('country');
  return (
    <span>
      <InlineUL separator={SEPARATOR_COMMA} wrapperClassName="di">
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
  address: PropTypes.instanceOf(Map).isRequired,
};

export default InstitutionAddress;
