import React, { Component } from 'react';
import { List } from 'immutable';

import InlineList from './InlineList';
import PublicationInfo from './PublicationInfo';

type OwnProps = {
    publicationInfo?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    labeled?: boolean;
};

type Props = OwnProps & typeof PublicationInfoList.defaultProps;

class PublicationInfoList extends Component<Props> {

static defaultProps = {
    publicationInfo: null,
    labeled: true,
};

  render() {
    const { publicationInfo, labeled } = this.props;
    const label = labeled ? 'Published in' : null;
    return (
      <InlineList
        label={label}
        items={publicationInfo}
        extractKey={(info: $TSFixMe) => info.get('journal_title') || info.get('pubinfo_freetext')
        }
        renderItem={(info: $TSFixMe) => <PublicationInfo info={info} />}
      />
    );
  }
}

export default PublicationInfoList;
