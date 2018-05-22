import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';
import PublicationInfo from './PublicationInfo';

class PublicationInfoList extends Component {
  render() {
    const { publicationInfo } = this.props;
    return (
      <InlineList
        label="Published in"
        items={publicationInfo}
        renderItem={info => <PublicationInfo info={info} />}
      />
    );
  }
}

PublicationInfoList.propTypes = {
  publicationInfo: PropTypes.instanceOf(List),
};

PublicationInfoList.defaultProps = {
  publicationInfo: null,
};

export default PublicationInfoList;
