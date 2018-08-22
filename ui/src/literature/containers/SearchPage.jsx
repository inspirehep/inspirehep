import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import SearchLayout from '../../common/layouts/SearchLayout';

import LiteratureItem from '../components/LiteratureItem';

class SearchPage extends Component {
  render() {
    return (
      <SearchLayout
        loading={this.props.loading}
        renderResultItem={result => (
          <LiteratureItem metadata={result.get('metadata')} />
        )}
      />
    );
  }
}

SearchPage.propTypes = {
  loading: PropTypes.bool.isRequired,
};

const stateToProps = state => ({
  loading: state.search.get('loading'),
});

export default connect(stateToProps)(SearchPage);
