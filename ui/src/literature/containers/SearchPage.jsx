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
        renderResultItem={result => (
          <LiteratureItem
            metadata={result.get('metadata')}
            display={result.get('display')}
          />
        )}
      />
    );
  }
}

SearchPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const dispatchToProps = dispatch => ({ dispatch });

export default connect(null, dispatchToProps)(SearchPage);
