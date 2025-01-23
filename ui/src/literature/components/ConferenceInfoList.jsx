import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineDataList from '../../common/components/InlineList';
import ConferenceInfo from './ConferenceInfo';

class ConferenceInfoList extends Component {
  render() {
    const { conferenceInfo, wrapperClassName, isProceedings } = this.props;
    return (
      <InlineDataList
        wrapperClassName={wrapperClassName}
        label={isProceedings ? 'Proceedings of' : 'Contribution to'}
        items={conferenceInfo}
        extractKey={(info) => info.get('control_number')}
        renderItem={(info) => <ConferenceInfo conferenceInfo={info} />}
      />
    );
  }
}

ConferenceInfoList.propTypes = {
  conferenceInfo: PropTypes.instanceOf(List),
  wrapperClassName: PropTypes.string,
};

ConferenceInfoList.defaultProps = {
  conferenceInfo: null,
  wrapperClassName: null,
};

export default ConferenceInfoList;
