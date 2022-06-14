import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import Latex from '../../common/components/Latex';

class Abstract extends Component {
  renderSource() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'abstract' does not exist on type 'Readon... Remove this comment to see the full error message
    const { abstract } = this.props;
    const source = abstract.get('source');
    return source && <span> ({source})</span>;
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'abstract' does not exist on type 'Readon... Remove this comment to see the full error message
    const { abstract } = this.props;
    return (
      abstract && (
        <div>
          <div>Abstract:{this.renderSource()}</div>
          <Latex>{abstract.get('value')}</Latex>
        </div>
      )
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
Abstract.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  abstract: PropTypes.instanceOf(Map),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
Abstract.defaultProps = {
  abstract: null,
};

export default Abstract;
