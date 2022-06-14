import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import ArxivEprint from './ArxivEprint';
import InlineList from '../../common/components/InlineList';

class ArxivEprintList extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'eprints' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { eprints } = this.props;
    return (
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        label="e-Print"
        items={eprints}
        extractKey={(eprint: any) => eprint.get('value')}
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        renderItem={(eprint: any) => <ArxivEprint eprint={eprint} />}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ArxivEprintList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  eprints: PropTypes.instanceOf(List),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
ArxivEprintList.defaultProps = {
  eprints: null,
};

export default ArxivEprintList;
