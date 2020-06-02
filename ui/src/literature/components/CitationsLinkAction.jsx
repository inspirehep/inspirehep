import React from 'react';
import PropTypes from 'prop-types';
import { LoginOutlined } from '@ant-design/icons';

import { Link } from 'react-router-dom';
import { LITERATURE } from '../../common/routes';
import ListItemAction from '../../common/components/ListItemAction';
import EventTracker from '../../common/components/EventTracker';
import FormattedNumber from '../../common/components/FormattedNumber';
import IconText from '../../common/components/IconText';
import pluralizeUnlessSingle from '../../common/utils';

function CitationsLinkAction({ recordId, citationCount, trackerEventId }) {
  return (
    <ListItemAction>
      <EventTracker eventId={trackerEventId}>
        <Link to={`${LITERATURE}?q=refersto:recid:${recordId}`}>
          <IconText
            text={
              <>
                <FormattedNumber>{citationCount}</FormattedNumber>{' '}
                {pluralizeUnlessSingle('citation', citationCount)}
              </>
            }
            icon={<LoginOutlined />}
          />
        </Link>
      </EventTracker>
    </ListItemAction>
  );
}

CitationsLinkAction.propTypes = {
  recordId: PropTypes.number.isRequired,
  citationCount: PropTypes.number.isRequired,
  trackerEventId: PropTypes.string.isRequired,
};

export default CitationsLinkAction;
