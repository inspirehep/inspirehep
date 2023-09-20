import React from 'react';
import { List, Map } from 'immutable';

import InlineDataList, { SEPARATOR_MIDDLEDOT } from './InlineList';
import Address from './Address';

function renderAddress(address: Map<string, any>) {
  return <Address address={address} />;
}

function AddressList({ addresses }: { addresses: List<Map<string, any>> }) {
  return (
    <InlineDataList
      wrapperClassName="di"
      items={addresses}
      separator={SEPARATOR_MIDDLEDOT}
      renderItem={renderAddress}
    />
  );
}

AddressList.defaultProps = {
  addresses: null,
};

export default AddressList;
