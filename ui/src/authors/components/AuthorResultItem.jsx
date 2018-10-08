import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import ResultItem from '../../common/components/ResultItem';

class AuthorResultItem extends Component {
  render() {
    const { metadata } = this.props;
    return (
      <ResultItem>Result Item for {metadata.get('control_number')}</ResultItem>
    );
  }
}

AuthorResultItem.propTypes = {
  metadata: PropTypes.instanceOf(Map).isRequired,
};

export default AuthorResultItem;
