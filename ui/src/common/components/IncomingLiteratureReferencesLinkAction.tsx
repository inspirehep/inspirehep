import React from 'react';
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

type Props = {
    itemCount: number;
    referenceType: string;
    linkQuery: string;
    trackerEventId: string;
};

const IncomingLiteratureReferencesLinkAction = ({ itemCount, referenceType, linkQuery, trackerEventId, }: Props) => (
  <ListItemAction>
    {/* @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message */}
    <EventTracker eventId={trackerEventId}>
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
  </ListItemAction>
);

export default IncomingLiteratureReferencesLinkAction;
