import React, { Component } from 'react';
import { diff, formatters } from 'jsondiffpatch';

import 'jsondiffpatch/dist/formatters-styles/html.css';

type Props = {
    first: {
        [key: string]: $TSFixMe;
    };
    second: {
        [key: string]: $TSFixMe;
    };
};

class JsonDiff extends Component<Props> {

  render() {
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

export default JsonDiff;
