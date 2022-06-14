import React, { Component } from 'react';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';

type OwnProps = {
    externalSystemIdentifiers?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

type Props = OwnProps & typeof ExternalSystemIdentifierList.defaultProps;

class ExternalSystemIdentifierList extends Component<Props> {

static defaultProps = {
    externalSystemIdentifiers: null,
};

  render() {
    const { externalSystemIdentifiers } = this.props;
    return (
      <InlineList
        label="View in"
        items={externalSystemIdentifiers}
        extractKey={(esid: $TSFixMe) => esid.get('url_link')}
        renderItem={(esid: $TSFixMe) => <a href={esid.get('url_link')}>{esid.get('url_name')}</a>}
      />
    );
  }
}

export default ExternalSystemIdentifierList;
