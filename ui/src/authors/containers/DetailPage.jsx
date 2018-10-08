import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col } from 'antd';
import { Map } from 'immutable';

import ContentBox from '../../common/components/ContentBox';

class DetailPage extends Component {
  componentDidMount() {
    this.dispatchFetchAuthor();
  }

  componentDidUpdate(prevProps) {
    const prevRecordId = prevProps.match.params.id;
    const recordId = this.props.match.params.id;
    if (recordId !== prevRecordId) {
      this.dispatchFetchAuthor();
      window.scrollTo(0, 0);
    }
  }

  dispatchFetchAuthor() {
    const recordId = this.props.match.params.id;
    // this.props.dispatch(fetchAuthor(recordId));
  }

  render() {
    const { record, loading } = this.props;

    const metadata = record.get('metadata');
    if (!metadata) {
      return null;
    }

    return (
      <Row type="flex" justify="center">
        <Col className="mt3 mb3" span={14}>
          <ContentBox loading={loading}>
            <h2>Author Name</h2>
          </ContentBox>
        </Col>
      </Row>
    );
  }
}

DetailPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.objectOf(PropTypes.any).isRequired,
  record: PropTypes.instanceOf(Map).isRequired,
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({});
const dispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, dispatchToProps)(DetailPage);
