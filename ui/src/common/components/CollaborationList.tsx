import React, { Component, Fragment } from 'react';
import { List } from 'immutable';

import CollaborationLink from './CollaborationLink';
import InlineList, { SEPARATOR_AND } from './InlineList';

type OwnProps = {
    collaborations?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    collaborationsWithSuffix?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

type Props = OwnProps & typeof CollaborationList.defaultProps;

class CollaborationList extends Component<Props> {

static defaultProps = {
    collaborations: List(),
    collaborationsWithSuffix: List(),
};

  static renderCollaboration(collaboration: $TSFixMe) {
    return <CollaborationLink>{collaboration.get('value')}</CollaborationLink>;
  }

  render() {
    const { collaborations, collaborationsWithSuffix } = this.props;

    return (
      <Fragment>
        <InlineList
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
          extractKey={(collaboration: $TSFixMe) => collaboration.get('value')}
          renderItem={CollaborationList.renderCollaboration}
        />
        {!collaborations.isEmpty() &&
          !collaborationsWithSuffix.isEmpty() && <span> and </span>}
        <InlineList
          wrapperClassName="di"
          separator={SEPARATOR_AND}
          items={collaborationsWithSuffix}
          extractKey={(collaboration: $TSFixMe) => collaboration.get('value')}
          renderItem={CollaborationList.renderCollaboration}
        />
      </Fragment>
    );
  }
}

export default CollaborationList;
