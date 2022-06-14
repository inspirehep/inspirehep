import React from 'react';
import { Map, List } from 'immutable';
import InlineList, {
  InlineUL,
  SEPARATOR_COMMA,
} from '../../common/components/InlineList';

function postalAddressesContainWord(postalAddresses: $TSFixMe, word: $TSFixMe) {
  return postalAddresses.some(
    (address: $TSFixMe) => address.toLowerCase().indexOf(word.toLowerCase()) > -1
  );
}

type Props = {
    address: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

function InstitutionAddress({ address }: Props) {
  const postalAddresses = address.get('postal_address', List());
  const city = address.getIn(['cities', 0]);
  const country = address.get('country');
  return (
    <span>
      {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
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

export default InstitutionAddress;
