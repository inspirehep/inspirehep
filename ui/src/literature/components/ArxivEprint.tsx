import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import ArxivEprintLink from './ArxivEprintLink';

class ArxivEprint extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'eprint' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { eprint } = this.props;
    return (
      <span>
        <ArxivEprintLink>{eprint.get('value')}</ArxivEprintLink>
        {eprint.has('categories') && (
          <span> [{eprint.getIn(['categories', 0])}]</span>
        )}
      </span>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ArxivEprint.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  eprint: PropTypes.instanceOf(Map).isRequired,
};

export default ArxivEprint;
