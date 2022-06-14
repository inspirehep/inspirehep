import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList, {
  SEPARATOR_MIDDLEDOT,
} from '../../common/components/InlineList';
import InstitutionAddress from './InstitutionAddress';

function renderAddress(address: any) {
  return <InstitutionAddress address={address} />;
}

function InstitutionAddressList({
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

InstitutionAddressList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  addresses: PropTypes.instanceOf(List),
};

InstitutionAddressList.defaultProps = {
  addresses: null,
};

export default InstitutionAddressList;
