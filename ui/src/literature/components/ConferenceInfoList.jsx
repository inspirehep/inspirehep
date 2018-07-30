import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';

class ConferenceInfoList extends Component {
  static extractControlNumber(info) {
    return info.get('control_number');
  }

  static renderConferenceLink(info) {
    const title = info.getIn(['titles', 0, 'title']);
    const controlNumber = ConferenceInfoList.extractControlNumber(info);
    const conferenceLink = `http://inspirehep.net/record/${controlNumber}`;
    return (
      <a target="_blank" href={conferenceLink}>
        {title}
      </a>
    );
  }

  render() {
    const { conferenceInfo } = this.props;
    return (
      <InlineList
        label="Contribution to"
        items={conferenceInfo}
        extractKey={ConferenceInfoList.extractControlNumber}
        renderItem={ConferenceInfoList.renderConferenceLink}
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
