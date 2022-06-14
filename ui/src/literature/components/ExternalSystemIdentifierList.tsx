import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';

class ExternalSystemIdentifierList extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'externalSystemIdentifiers' does not exis... Remove this comment to see the full error message
    const { externalSystemIdentifiers } = this.props;
    return (
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        label="View in"
        items={externalSystemIdentifiers}
        extractKey={(esid: any) => esid.get('url_link')}
        renderItem={(esid: any) => <a href={esid.get('url_link')}>{esid.get('url_name')}</a>}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ExternalSystemIdentifierList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  externalSystemIdentifiers: PropTypes.instanceOf(List),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
ExternalSystemIdentifierList.defaultProps = {
  externalSystemIdentifiers: null,
};

export default ExternalSystemIdentifierList;
