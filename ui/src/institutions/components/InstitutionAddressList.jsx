import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList, {
  SEPARATOR_MIDDLEDOT,
} from '../../common/components/InlineList';
import InstitutionAddress from './InstitutionAddress';

function renderAddress(address) {
  return <InstitutionAddress address={address} />;
}

function InstitutionAddressList({ addresses }) {
  return (
    <InlineList
      wrapperClassName="di"
      items={addresses}
      // FIXME: set extractKey explictly
      separator={SEPARATOR_MIDDLEDOT}
      renderItem={renderAddress}
    />
  );
}

InstitutionAddressList.propTypes = {
  addresses: PropTypes.instanceOf(List),
};

InstitutionAddressList.defaultProps = {
  addresses: null,
};

export default InstitutionAddressList;
