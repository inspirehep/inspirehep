import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import SearchLayout from '../../common/layouts/SearchLayout';

import LiteratureItem from '../components/LiteratureItem';
import search from '../../actions/search';

class SearchPage extends Component {
  componentWillMount() {
    this.props.dispatch(search());
  }

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
  dispatch: PropTypes.func.isRequired,
};

const stateToProps = state => ({
  loading: state.search.get('loading'),
});
const dispatchToProps = dispatch => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(SearchPage);
