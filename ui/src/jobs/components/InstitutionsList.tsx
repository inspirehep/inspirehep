import React, { Component } from 'react';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';

type OwnProps = {
    institutions?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

type Props = OwnProps & typeof InstitutionsList.defaultProps;

class InstitutionsList extends Component<Props> {

static defaultProps = {
    institutions: null,
};

  static renderInstitution(institution: $TSFixMe) {
    return institution.get('value');
  }

  render() {
    const { institutions } = this.props;
    return (
      <InlineList
        items={institutions}
        renderItem={InstitutionsList.renderInstitution}
      />
    );
  }
}

export default InstitutionsList;
