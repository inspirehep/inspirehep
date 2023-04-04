import React from 'react';
import { List, Map } from 'immutable';

import CollaborationLink from './CollaborationLink';
import InlineDataList, { SEPARATOR_AND } from './InlineList';

function CollaborationList({
  collaborations,
  collaborationsWithSuffix,
}: {
  collaborations: List<any>;
  collaborationsWithSuffix: List<any>;
}) {
  function renderCollaboration(collaboration: Map<string, any>) {
    return <CollaborationLink>{collaboration.get('value')}</CollaborationLink>;
  }

  return (
    <>
      <InlineDataList
        wrapperClassName="di"
        separator={SEPARATOR_AND}
        items={collaborations}
        suffix={
          collaborations.size > 0 && (
            <span>
              {collaborations.size > 1 ? ' Collaborations' : ' Collaboration'}
            </span>
          )
        }
        extractKey={(collaboration: Map<string, any>) =>
          collaboration.get('value')
        }
        renderItem={renderCollaboration}
      />
      {!collaborations.isEmpty() && !collaborationsWithSuffix.isEmpty() && (
        <span> and </span>
      )}
      <InlineDataList
        wrapperClassName="di"
        separator={SEPARATOR_AND}
        items={collaborationsWithSuffix}
        extractKey={(collaboration: Map<string, any>) =>
          collaboration.get('value')
        }
        renderItem={renderCollaboration}
      />
    </>
  );
}

CollaborationList.defaultProps = {
  collaborations: List(),
  collaborationsWithSuffix: List(),
};

export default CollaborationList;
