import { List, Map } from 'immutable';
import React from 'react';
import EventTracker from '../../common/components/EventTracker';
import InlineDataList from '../../common/components/InlineList';
import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';

const PersistentIdentifiers = ({
  identifiers,
}: {
  identifiers: List<string>;
}) => {
  const renderIdentifier = (identifier: Map<string, string>) => {
    const schema = identifier.get('schema');
    const value = identifier.get('value');

    if (schema === 'HDL') {
      return (
        <EventTracker
          eventCategory="Literature detail"
          eventAction="Link"
          eventId="HDL link"
        >
          <LinkWithTargetBlank href={`//hdl.handle.net/${value}`}>
            {value}
          </LinkWithTargetBlank>
        </EventTracker>
      );
    } 
    return <span>{value}</span>;
  };

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
