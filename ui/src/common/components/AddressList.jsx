import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineDataList, { SEPARATOR_MIDDLEDOT } from './InlineList';
import Address from './Address';

function renderAddress(address) {
  return <Address address={address} />;
}

function AddressList({ addresses }) {
  return (
    <InlineDataList
      wrapperClassName="di"
      items={addresses}
      // FIXME: set extractKey explictly
      separator={SEPARATOR_MIDDLEDOT}
      renderItem={renderAddress}
    />
  );
}

AddressList.propTypes = {
  addresses: PropTypes.instanceOf(List),
};

AddressList.defaultProps = {
  addresses: null,
};

export default AddressList;
