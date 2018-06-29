import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import CollaborationLink from './CollaborationLink';
import InlineList from '../../common/components/InlineList';

class CollaborationList extends Component {
  render() {
    const { collaborations, wrapperClassName } = this.props;
    return (
      <InlineList
        wrapperClassName={wrapperClassName}
        items={collaborations}
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
  collaborations: null,
  wrapperClassName: null,
};

export default CollaborationList;
