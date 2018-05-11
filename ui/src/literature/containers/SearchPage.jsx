import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import SearchLayout from '../../common/SearchLayout';

import ResultItem from '../../common/components/ResultItem';
import search from '../../actions/search';

class SearchPage extends Component {
  componentWillMount() {
    this.props.dispatch(search());
  }

  render() {
    return (
      <SearchLayout
        renderResultItem={result => (
          <ResultItem
            title={result.getIn(['metadata', 'titles', 0, 'title'])}
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
