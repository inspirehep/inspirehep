import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';

class InstitutionsList extends Component {
  static renderInstitution(institution) {
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

InstitutionsList.propTypes = {
  institutions: PropTypes.instanceOf(List),
};

InstitutionsList.defaultProps = {
  institutions: null,
};

export default InstitutionsList;
