import React from 'react';
import { List } from 'immutable';

import InlineList, {
  SEPARATOR_MIDDLEDOT,
} from '../../common/components/InlineList';
import InstitutionAddress from './InstitutionAddress';

function renderAddress(address: $TSFixMe) {
  return <InstitutionAddress address={address} />;
}

type OwnProps = {
    addresses?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

// @ts-expect-error ts-migrate(2565) FIXME: Property 'defaultProps' is used before being assig... Remove this comment to see the full error message
type Props = OwnProps & typeof InstitutionAddressList.defaultProps;

function InstitutionAddressList({ addresses }: Props) {
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

InstitutionAddressList.defaultProps = {
  addresses: null,
};

export default InstitutionAddressList;
