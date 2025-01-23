import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineDataList from '../../common/components/InlineList';

class ReportNumberList extends Component {
  render() {
    const { reportNumbers } = this.props;
    return (
      <InlineDataList
        label="Report number"
        items={reportNumbers}
        extractKey={(reportNumber) => reportNumber.get('value')}
        renderItem={(reportNumber) => <span>{reportNumber.get('value')}</span>}
      />
    );
  }
}

ReportNumberList.propTypes = {
  reportNumbers: PropTypes.instanceOf(List),
};

ReportNumberList.defaultProps = {
  reportNumbers: null,
};

export default ReportNumberList;
