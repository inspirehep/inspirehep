import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';

class ReportNumberList extends Component {
  render() {
    const { reportNumbers } = this.props;
    return (
      <InlineList
        label="Report number"
        items={reportNumbers}
        extractKey={reportNumber => reportNumber.get('value')}
        renderItem={reportNumber => (
          <span>{reportNumber.get('value')}</span>
        )}
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
