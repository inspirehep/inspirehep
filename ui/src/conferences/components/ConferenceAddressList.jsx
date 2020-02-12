import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList, {
  SEPARATOR_MIDDLEDOT,
} from '../../common/components/InlineList';
import ConferenceAddress from './ConferenceAddress';

function renderConferenceAddress(address) {
  return <ConferenceAddress address={address} />;
}

function ConferenceAddressList({ addresses }) {
  return (
    <InlineList
      wrapperClassName="di"
      items={addresses}
      // FIXME: set extractKey explictly
      separator={SEPARATOR_MIDDLEDOT}
      renderItem={renderConferenceAddress}
    />
  );
}

ConferenceAddressList.propTypes = {
  addresses: PropTypes.instanceOf(List),
};

ConferenceAddressList.defaultProps = {
  addresses: null,
};

export default ConferenceAddressList;
