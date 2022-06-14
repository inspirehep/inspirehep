import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';

class RegionsList extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'regions' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { regions } = this.props;
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    return <InlineList items={regions} />;
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
RegionsList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  regions: PropTypes.instanceOf(List),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
RegionsList.defaultProps = {
  regions: null,
};

export default RegionsList;
