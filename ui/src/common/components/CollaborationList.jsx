import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import CollaborationLink from './CollaborationLink';
import InlineList from '../../common/components/InlineList';

class CollaborationList extends Component {
  static renderCollaboration(collaboration) {
    return <CollaborationLink>{collaboration.get('value')}</CollaborationLink>;
  }

  render() {
    const { collaborations, collaborationsWithSuffix } = this.props;

    return (
      <Fragment>
        <InlineList
          wrapperClassName="di"
          separateItemsClassName="separate-items-with-and"
          items={collaborations}
          suffix={
            collaborations.size > 0 && (
              <span>
                {collaborations.size > 1 ? ' Collaborations' : ' Collaboration'}
              </span>
            )
          }
          extractKey={collaboration => collaboration.get('value')}
          renderItem={CollaborationList.renderCollaboration}
        />
        {!collaborations.isEmpty() &&
          !collaborationsWithSuffix.isEmpty() && <span> and </span>}
        <InlineList
          wrapperClassName="di"
          separateItemsClassName="separate-items-with-and"
          items={collaborationsWithSuffix}
          extractKey={collaboration => collaboration.get('value')}
          renderItem={CollaborationList.renderCollaboration}
        />
      </Fragment>
    );
  }
}

CollaborationList.propTypes = {
  collaborations: PropTypes.instanceOf(List),
  collaborationsWithSuffix: PropTypes.instanceOf(List),
};

CollaborationList.defaultProps = {
  collaborations: List(),
  collaborationsWithSuffix: List(),
};

export default CollaborationList;
