import React, { Component } from 'react';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';
import ConferenceInfo from './ConferenceInfo';

type OwnProps = {
    conferenceInfo?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    wrapperClassName?: string;
};

type Props = OwnProps & typeof ConferenceInfoList.defaultProps;

class ConferenceInfoList extends Component<Props> {

static defaultProps = {
    conferenceInfo: null,
    wrapperClassName: null,
};

  render() {
    const { conferenceInfo, wrapperClassName } = this.props;
    return (
      <InlineList
        wrapperClassName={wrapperClassName}
        label="Contribution to"
        items={conferenceInfo}
        extractKey={(info: $TSFixMe) => info.get('control_number')}
        renderItem={(info: $TSFixMe) => <ConferenceInfo conferenceInfo={info} />}
      />
    );
  }
}

export default ConferenceInfoList;
