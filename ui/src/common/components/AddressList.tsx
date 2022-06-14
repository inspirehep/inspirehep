import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList, { SEPARATOR_MIDDLEDOT } from './InlineList';
import Address from './Address';

function renderAddress(address: any) {
  return <Address address={address} />;
}

function AddressList({
  addresses
}: any) {
  return (
    <InlineList
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      wrapperClassName="di"
      items={addresses}
      // FIXME: set extractKey explictly
      separator={SEPARATOR_MIDDLEDOT}
      renderItem={renderAddress}
    />
  );
}

AddressList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  addresses: PropTypes.instanceOf(List),
};

AddressList.defaultProps = {
  addresses: null,
};

export default AddressList;
