import React from 'react';
import PropTypes from 'prop-types';
import { LoginOutlined } from '@ant-design/icons';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';

import IconText from './IconText';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import FormattedNumber from './FormattedNumber.tsx';
import pluralizeUnlessSingle from '../utils';
import { LITERATURE } from '../routes';
import ListItemAction from './ListItemAction';
import EventTracker from './EventTracker';

const IncomingLiteratureReferencesLinkAction = ({
  itemCount,
  referenceType,
  linkQuery,
  trackerEventId
}: any) => {
  const eventTrackerProps = {
    eventId: trackerEventId
  }
  return (
    <ListItemAction>
      <EventTracker {...eventTrackerProps}>
        <Link to={`${LITERATURE}?q=${linkQuery}`}>
          <IconText
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
    </ListItemAction>
  );
};
IncomingLiteratureReferencesLinkAction.propTypes = {
  itemCount: PropTypes.number.isRequired,
  referenceType: PropTypes.string.isRequired,
  linkQuery: PropTypes.string.isRequired,
  trackerEventId: PropTypes.string.isRequired,
};

export default IncomingLiteratureReferencesLinkAction;
