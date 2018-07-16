import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import CollaborationLink from './CollaborationLink';
import InlineList from '../../common/components/InlineList';

class CollaborationList extends Component {
  constructor(props) {
    super(props);

    this.renderSuffix = this.renderSuffix.bind(this);
  }

  renderSuffix() {
    const { collaborations } = this.props;
    return (
      <span className="pl1 pr1">
        {collaborations.size > 1 ? 'Collaborations' : 'Collaboration'}
      </span>
    );
  }

  render() {
    const { collaborations, wrapperClassName } = this.props;
    return collaborations.isEmpty() ? null : (
      <InlineList
        wrapperClassName={wrapperClassName}
        separateItemsClassName="separate-items-with-and"
        items={collaborations}
        suffix={this.renderSuffix()}
        extractKey={collaboration => collaboration.get('value')}
        renderItem={collaboration => (
          <CollaborationLink>{collaboration.get('value')}</CollaborationLink>
        )}
      />
    );
  }
}

CollaborationList.propTypes = {
  collaborations: PropTypes.instanceOf(List),
  wrapperClassName: PropTypes.string,
};

CollaborationList.defaultProps = {
  collaborations: List(),
  wrapperClassName: null,
};

export default CollaborationList;
