import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { diff, formatters } from 'jsondiffpatch';

import 'jsondiffpatch/dist/formatters-styles/html.css';

class JsonDiff extends Component {
  render() {
    const { first, second } = this.props;
    const delta = diff(first, second);
    return (
      <div
        /* eslint-disable-next-line react/no-danger */
        dangerouslySetInnerHTML={{
          __html: formatters.html.format(delta, second),
        }}
      />
    );
  }
}

JsonDiff.propTypes = {
  first: PropTypes.objectOf(PropTypes.any).isRequired,
  second: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default JsonDiff;
