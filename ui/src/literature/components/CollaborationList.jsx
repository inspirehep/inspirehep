import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import CollaborationLink from './CollaborationLink';
import InlineList from '../../common/components/InlineList';

const REGEX_COLLABORATIONS_WITH_SUFFIX = /(group|groups|force|consortium|team)$/i;

class CollaborationList extends Component {
  static collaborationMatchSuffix(item) {
    return item.get('value').match(REGEX_COLLABORATIONS_WITH_SUFFIX);
  }

  render() {
    const { collaborations } = this.props;
    const collaborationsWithSuffix = collaborations.filter(
      CollaborationList.collaborationMatchSuffix
    );
    const collaborationsWithoutSuffix = collaborations.filterNot(
      CollaborationList.collaborationMatchSuffix
    );

    return (
      <Fragment>
        <InlineList
          wrapperClassName="di"
          separateItemsClassName="separate-items-with-and"
          items={collaborationsWithoutSuffix}
          suffix={
            collaborationsWithoutSuffix.size > 0 && (
              <span className="pr1">
                {collaborationsWithoutSuffix.size > 1
                  ? ' Collaborations'
                  : ' Collaboration'}
              </span>
            )
          }
          extractKey={collaboration => collaboration.get('value')}
          renderItem={collaboration => (
            <CollaborationLink>{collaboration.get('value')}</CollaborationLink>
          )}
        />
        <InlineList
          wrapperClassName="di"
          separateItemsClassName="separate-items-with-comma"
          items={collaborationsWithSuffix}
          extractKey={collaboration => collaboration.get('value')}
          renderItem={collaboration => (
            <CollaborationLink>{collaboration.get('value')}</CollaborationLink>
          )}
        />
      </Fragment>
    );
  }
}

CollaborationList.propTypes = {
  collaborations: PropTypes.instanceOf(List),
};

CollaborationList.defaultProps = {
  collaborations: List(),
};

export default CollaborationList;
