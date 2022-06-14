import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { diff, formatters } from 'jsondiffpatch';

import 'jsondiffpatch/dist/formatters-styles/html.css';

class JsonDiff extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'first' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const { first, second } = this.props;
    const delta = diff(first, second);
    return (
      <div
        /* eslint-disable-next-line react/no-danger */
        dangerouslySetInnerHTML={{
          // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Delta | undefined' is not assign... Remove this comment to see the full error message
          __html: formatters.html.format(delta, second),
        }}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
JsonDiff.propTypes = {
  first: PropTypes.objectOf(PropTypes.any).isRequired,
  second: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default JsonDiff;
