import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';

import fetchCitations from '../../actions/citations';
import ListWithPagination from '../components/ListWithPagination';
import ContentBox from '../components/ContentBox';
import CitationItem from '../components/CitationItem';

export const PAGE_SIZE = 25;

class CitationList extends Component {
  static renderCitationItem(citation) {
    return (
      <CitationItem key={citation.get('control_number')} citation={citation} />
    );
  }

  constructor(props) {
    super(props);

    this.onPageChange = this.onPageChange.bind(this);
  }

  componentDidMount() {
    const { pidType, recordId, dispatch } = this.props;
    dispatch(
      fetchCitations(pidType, recordId, { page: 1, pageSize: PAGE_SIZE })
    );
  }

  onPageChange(page) {
    const { pidType, recordId, dispatch } = this.props;
    dispatch(fetchCitations(pidType, recordId, { page, pageSize: PAGE_SIZE }));
  }

  render() {
    const { loading, total, citations } = this.props;
    return (
      <ContentBox title={`Citations (${total})`} loading={loading}>
        {total > 0 && (
          <ListWithPagination
            renderItem={CitationList.renderCitationItem}
            pageItems={citations}
            onPageChange={this.onPageChange}
            total={total}
            loading={loading}
            pageSize={PAGE_SIZE}
          />
        )}
      </ContentBox>
    );
  }
}

CitationList.propTypes = {
  total: PropTypes.number.isRequired,
  citations: PropTypes.instanceOf(List).isRequired,
  loading: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  pidType: PropTypes.string.isRequired,
  recordId: PropTypes.number.isRequired,
};

const stateToProps = state => ({
  loading: state.citations.get('loading'),
  citations: state.citations.get('data'),
  total: state.citations.get('total'),
});

const dispatchToProps = dispatch => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(CitationList);
