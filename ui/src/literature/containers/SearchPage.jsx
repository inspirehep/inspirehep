import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col } from 'antd';

import AggregationFiltersContainer from '../../common/containers/AggregationFiltersContainer';
import PaginationContainer from '../../common/containers/PaginationContainer';
import SortByContainer from '../../common/containers/SortByContainer';
import ResultsContainer from '../../common/containers/ResultsContainer';
import ResultItem from '../../common/components/ResultItem';
import search from '../../actions/search';

class SearchPage extends Component {
  componentWillMount() {
    this.props.dispatch(search());
  }

  render() {
    return (
      <div>
        <Row>
          <Col span={6}>
            <AggregationFiltersContainer />
          </Col>
          <Col span={18}>
            <Row>
              <Col span={12}>
                <PaginationContainer />
              </Col>
              <Col span={12}>
                <SortByContainer />
              </Col>
            </Row>
            <Row>
              <ResultsContainer
                renderItem={result => (
                  <ResultItem
                    title={result.getIn(['metadata', 'titles', 0, 'title'])}
                  />
                )}
              />
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}

SearchPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const dispatchToProps = dispatch => ({ dispatch });

export default connect(null, dispatchToProps)(SearchPage);
