import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';

class ExternalSystemIdentifierList extends Component {
  render() {
    const { externalSystemIdentifiers } = this.props;
    return (
      <InlineList
        label="View in"
        items={externalSystemIdentifiers}
        extractKey={esid => esid.get('url_link')}
        renderItem={esid => (
          <a href={esid.get('url_link')}>{esid.get('url_name')}</a>
        )}
      />
    );
  }
}

ExternalSystemIdentifierList.propTypes = {
  externalSystemIdentifiers: PropTypes.instanceOf(List),
};

ExternalSystemIdentifierList.defaultProps = {
  externalSystemIdentifiers: null,
};

export default ExternalSystemIdentifierList;
