import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import ListWithPagination from './ListWithPagination';
import ContentBox from './ContentBox';
import CitationItem from './CitationItem';
import { ErrorPropType } from '../propTypes';
import ErrorAlertOrChildren from './ErrorAlertOrChildren';

export const PAGE_SIZE = 25;

class CitationList extends Component {
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
    this.onPageDisplay(1);
  }

  onPageChange(page) {
    this.setState({ page });
    this.onPageDisplay(page);
  }

  onPageDisplay(page) {
    const { onPageDisplay } = this.props;
    onPageDisplay({ pageSize: PAGE_SIZE, page });
  }

  renderList() {
    const { total, citations } = this.props;
    const { page } = this.state;
    return (
      total > 0 && (
        <ListWithPagination
          renderItem={CitationList.renderCitationItem}
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

CitationList.propTypes = {
  total: PropTypes.number.isRequired,
  citations: PropTypes.instanceOf(List).isRequired,
  error: ErrorPropType, // eslint-disable-line react/require-default-props
  loading: PropTypes.bool.isRequired,
  onPageDisplay: PropTypes.func.isRequired,
};

export default CitationList;
