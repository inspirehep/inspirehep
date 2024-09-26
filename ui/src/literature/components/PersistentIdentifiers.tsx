import React from 'react';
import { List, Map } from 'immutable';

import EventTracker from '../../common/components/EventTracker';
import InlineDataList from '../../common/components/InlineList';
import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';

const renderIdentifier = (identifier: Map<string, string>) => {
  const schema = identifier.get('schema');
  const value = identifier.get('value');
  let eventId = '';
  let linkHref = '';

  switch (schema) {
    case 'HDL':
      eventId = 'HDL link';
      linkHref = `//hdl.handle.net/${value}`;
      break;
    case 'URN':
      eventId = 'URN link';
      linkHref = `https://nbn-resolving.org//${value}`;
      break;
    default:
      break;
  }

  if (schema === 'HDL' || schema === 'URN') {
    return (
      <EventTracker
        eventCategory="Literature detail"
        eventAction="Link"
        eventId={eventId}
      >
        <LinkWithTargetBlank href={linkHref}>{value}</LinkWithTargetBlank>
      </EventTracker>
    );
  }

  return <span>{value}</span>;
};

const PersistentIdentifiers = ({
  identifiers,
}: {
  identifiers: List<string>;
}) => {
  return (
    <InlineDataList
      label="URN/HDL"
      items={identifiers}
      extractKey={(identifier: Map<string, string>) => identifier.get('value')}
      renderItem={renderIdentifier}
    />
  );
};

export default PersistentIdentifiers;
