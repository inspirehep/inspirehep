import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';

import { fetchCitationSummary } from '../../actions/citations';
import CitationSummaryTable from '../components/CitationSummaryTable';
import LoadingOrChildren from '../components/LoadingOrChildren';
import ErrorAlertOrChildren from '../components/ErrorAlertOrChildren';
import { ErrorPropType } from '../propTypes';

class CitationSummaryTableContainer extends Component {
  componentDidMount() {
    this.fetchCitationSummary();
  }

  componentDidUpdate(prevProps) {
    const prevSearchQuery = prevProps.searchQuery;
    const { searchQuery } = this.props;
    if (searchQuery !== prevSearchQuery) {
      this.fetchCitationSummary();
    }
  }

  fetchCitationSummary() {
    const { searchQuery, dispatch } = this.props;
    dispatch(fetchCitationSummary(searchQuery));
  }

  render() {
    const {
      citationSummary,
      loadingCitationSummary,
      error,
      searchQuery,
    } = this.props;
    return (
      <LoadingOrChildren loading={loadingCitationSummary}>
        <ErrorAlertOrChildren error={error}>
          {citationSummary && (
            <CitationSummaryTable
              citationSummary={citationSummary}
              searchQuery={searchQuery}
            />
          )}
        </ErrorAlertOrChildren>
      </LoadingOrChildren>
    );
  }
}

CitationSummaryTableContainer.propTypes = {
  loadingCitationSummary: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  searchQuery: PropTypes.instanceOf(Map).isRequired,
  error: ErrorPropType, // eslint-disable-line react/require-default-props
  citationSummary: PropTypes.instanceOf(Map), // eslint-disable-line react/require-default-props
};

const stateToProps = state => ({
  loadingCitationSummary: state.citations.get('loadingCitationSummary'),
  citationSummary: state.citations.get('citationSummary'),
  error: state.citations.get('errorCitationSummary'),
});

const dispatchToProps = dispatch => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(
  CitationSummaryTableContainer
);
