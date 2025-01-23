import React from 'react';
import PropTypes from 'prop-types';
import { LoginOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import IconText from './IconText';
import FormattedNumber from './FormattedNumber';
import { pluralizeUnlessSingle } from '../utils';
import { LITERATURE } from '../routes';
import UserAction from './UserAction';
import EventTracker from './EventTracker';

const IncomingLiteratureReferencesLinkAction = ({
  itemCount,
  referenceType,
  linkQuery,
  trackerEventId,
  eventCategory,
}) => (
  <UserAction>
    <EventTracker
      eventCategory={eventCategory}
      eventAction="Literature references search"
      eventId={trackerEventId}
    >
      <Link to={`${LITERATURE}?q=${linkQuery}`}>
        <IconText
          text={
            <>
              <FormattedNumber>{itemCount}</FormattedNumber>{' '}
              {pluralizeUnlessSingle(referenceType, itemCount)}
            </>
          }
          icon={<LoginOutlined />}
        />
      </Link>
    </EventTracker>
  </UserAction>
);

IncomingLiteratureReferencesLinkAction.propTypes = {
  itemCount: PropTypes.number.isRequired,
  referenceType: PropTypes.string.isRequired,
  linkQuery: PropTypes.string.isRequired,
  trackerEventId: PropTypes.string.isRequired,
};

export default IncomingLiteratureReferencesLinkAction;
