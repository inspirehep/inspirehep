import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';

import fetchCitations from '../../actions/citations';
import ListWithPagination from '../components/ListWithPagination';
import ContentBox from '../components/ContentBox';
import CitationItem from '../components/CitationItem';
import { ErrorPropType } from '../propTypes';
import ErrorAlertOrChildren from '../components/ErrorAlertOrChildren';

export const PAGE_SIZE = 25;

class CitationListContainer extends Component {
  static renderCitationItem(citation) {
    return (
      <CitationItem key={citation.get('control_number')} citation={citation} />
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      page: 1,
    };
    this.onPageChange = this.onPageChange.bind(this);
  }

  componentDidMount() {
    this.fetchCitationsForPage(1);
  }

  componentDidUpdate(prevProps) {
    const prevRecordId = prevProps.recordId;
    const { recordId } = this.props;
    if (recordId !== prevRecordId) {
      const page = 1;
      this.setState({ page }); // eslint-disable-line react/no-did-update-set-state
      this.fetchCitationsForPage(page);
    }
  }

  onPageChange(page) {
    this.setState({ page });
    this.fetchCitationsForPage(page);
  }

  fetchCitationsForPage(page) {
    const { pidType, recordId, dispatch } = this.props;
    dispatch(fetchCitations(pidType, recordId, { page, pageSize: PAGE_SIZE }));
  }

  renderList() {
    const { total, citations } = this.props;
    const { page } = this.state;
    return (
      total > 0 && (
        <ListWithPagination
          renderItem={CitationListContainer.renderCitationItem}
          pageItems={citations}
          onPageChange={this.onPageChange}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
        />
      )
    );
  }

  render() {
    const { loading, error } = this.props;
    return (
      <ContentBox loading={loading}>
        <ErrorAlertOrChildren error={error}>
          {this.renderList()}
        </ErrorAlertOrChildren>
      </ContentBox>
    );
  }
}

CitationListContainer.propTypes = {
  total: PropTypes.number.isRequired,
  citations: PropTypes.instanceOf(List).isRequired,
  error: ErrorPropType, // eslint-disable-line react/require-default-props
  loading: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  pidType: PropTypes.string.isRequired,
  recordId: PropTypes.number.isRequired,
};

const stateToProps = state => ({
  loading: state.citations.get('loading'),
  citations: state.citations.get('data'),
  total: state.citations.get('total'),
  error: state.citations.get('error'),
});

const dispatchToProps = dispatch => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(CitationListContainer);
