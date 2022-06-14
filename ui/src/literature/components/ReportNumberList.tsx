import React, { Component } from 'react';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';

type OwnProps = {
    reportNumbers?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

type Props = OwnProps & typeof ReportNumberList.defaultProps;

class ReportNumberList extends Component<Props> {

static defaultProps = {
    reportNumbers: null,
};

  render() {
    const { reportNumbers } = this.props;
    return (
      <InlineList
        label="Report number"
        items={reportNumbers}
        extractKey={(reportNumber: $TSFixMe) => reportNumber.get('value')}
        renderItem={(reportNumber: $TSFixMe) => <span>{reportNumber.get('value')}</span>}
      />
    );
  }
}

export default ReportNumberList;
