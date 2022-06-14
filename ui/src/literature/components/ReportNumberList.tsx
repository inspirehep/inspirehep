import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';

class ReportNumberList extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'reportNumbers' does not exist on type 'R... Remove this comment to see the full error message
    const { reportNumbers } = this.props;
    return (
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        label="Report number"
        items={reportNumbers}
        extractKey={(reportNumber: any) => reportNumber.get('value')}
        renderItem={(reportNumber: any) => <span>{reportNumber.get('value')}</span>}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ReportNumberList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  reportNumbers: PropTypes.instanceOf(List),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
ReportNumberList.defaultProps = {
  reportNumbers: null,
};

export default ReportNumberList;
