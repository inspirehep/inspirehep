import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import { connect } from 'react-redux';

import AuthorResultItem from '../components/AuthorResultItem';
import PaginationContainer from '../../common/containers/PaginationContainer';
import ResultsContainer from '../../common/containers/ResultsContainer';
import NumberOfResultsContainer from '../../common/containers/NumberOfResultsContainer';
import LoadingOrChildren from '../../common/components/LoadingOrChildren';

class SearchPage extends Component {
  static renderAuthorItem(result) {
    return <AuthorResultItem metadata={result.get('metadata')} />;
  }

  render() {
    const { loading } = this.props;
    return (
      <Row className="mt3" gutter={32} type="flex" justify="center">
        <Col xs={24} lg={16} xl={16} xxl={14}>
          <LoadingOrChildren loading={loading}>
            <Row type="flex">
              <Col>
                <NumberOfResultsContainer />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <ResultsContainer renderItem={SearchPage.renderAuthorItem} />
                <PaginationContainer />
              </Col>
            </Row>
          </LoadingOrChildren>
        </Col>
      </Row>
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
