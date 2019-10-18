import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import { connect } from 'react-redux';

import AggregationFiltersContainer from '../../common/containers/AggregationFiltersContainer';
import PaginationContainer from '../../common/containers/PaginationContainer';
import SortByContainer from '../../common/containers/SortByContainer';
import ResultsContainer from '../../common/containers/ResultsContainer';
import NumberOfResultsContainer from '../../common/containers/NumberOfResultsContainer';
import LoadingOrChildren from '../../common/components/LoadingOrChildren';
import ResponsiveView from '../../common/components/ResponsiveView';
import DrawerHandle from '../../common/components/DrawerHandle';
import LiteratureItem from '../components/LiteratureItem';
import DocumentHead from '../../common/components/DocumentHead';
import CiteAllActionContainer from './CiteAllActionContainer';
import AuthorizedContainer from '../../common/containers/AuthorizedContainer';
import { SUPERUSER } from '../../common/authorization';
import VerticalDivider from '../../common/VerticalDivider';

class SearchPage extends Component {
  static renderLiteratureItem(result, rank) {
    return (
      <LiteratureItem metadata={result.get('metadata')} searchRank={rank} />
    );
  }

  renderAggregations() {
    const { loadingAggregations } = this.props;
    return (
      <LoadingOrChildren loading={loadingAggregations}>
        <AggregationFiltersContainer />
      </LoadingOrChildren>
    );
  }

  render() {
    const { loading } = this.props;
    return (
      <>
        <DocumentHead title="Literature Search" />
        <Row className="mt3" gutter={32} type="flex" justify="start">
          <Col xs={0} lg={8} xl={7} xxl={5}>
            <ResponsiveView min="lg" render={() => this.renderAggregations()} />
          </Col>
          <Col xs={24} lg={16} xl={16} xxl={14}>
            <LoadingOrChildren loading={loading}>
              <Row type="flex" align="middle" justify="end">
                <Col xs={24} lg={12}>
                  <NumberOfResultsContainer />
                  <AuthorizedContainer authorizedRoles={SUPERUSER}>
                    <VerticalDivider />
                    <CiteAllActionContainer />
                  </AuthorizedContainer>
                </Col>
                <Col xs={12} lg={0}>
                  <ResponsiveView
                    max="md"
                    render={() => (
                      <DrawerHandle
                        className="mt2"
                        handleText="Filter"
                        drawerTitle="Filter"
                      >
                        {this.renderAggregations()}
                      </DrawerHandle>
                    )}
                  />
                </Col>
                <Col className="tr" span={12}>
                  <SortByContainer />
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <ResultsContainer
                    renderItem={SearchPage.renderLiteratureItem}
                  />
                  <PaginationContainer />
                </Col>
              </Row>
            </LoadingOrChildren>
          </Col>
        </Row>
      </>
    );
  }
}

SearchPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  loadingAggregations: PropTypes.bool.isRequired,
};

const stateToProps = state => ({
  loading: state.search.get('loading'),
  loadingAggregations: state.search.get('loadingAggregations'),
});

export default connect(stateToProps)(SearchPage);
