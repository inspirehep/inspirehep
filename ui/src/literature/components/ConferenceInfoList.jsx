import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';

class ConferenceInfoList extends Component {
  static getConferenceTitle(info) {
    return info.getIn(['titles', 0, 'title']);
  }

  render() {
    const { conferenceInfo } = this.props;
    return (
      <InlineList
        label="Contribution to"
        items={conferenceInfo}
        extractKey={ConferenceInfoList.getConferenceTitle}
        renderItem={ConferenceInfoList.getConferenceTitle}
      />
    );
  }
}

ConferenceInfoList.propTypes = {
  conferenceInfo: PropTypes.instanceOf(List),
};

ConferenceInfoList.defaultProps = {
  conferenceInfo: null,
};

export default ConferenceInfoList;
