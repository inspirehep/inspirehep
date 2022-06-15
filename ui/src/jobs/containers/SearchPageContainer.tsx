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
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import DrawerHandle from '../../common/components/DrawerHandle.tsx';
import JobItem from '../components/JobItem';
import SubscribeJobsModalButton from '../components/SubscribeJobsModalButton';
import DocumentHead from '../../common/components/DocumentHead';
import { JOBS_NS } from '../../search/constants';

const META_DESCRIPTION =
  'Jobs in High-Energy Physics. A listing of academic and research jobs of interest to the community in high energy physics, nuclear physics, accelerator physics and astrophysics.';
const TITLE = 'Jobs Search';

class SearchPage extends Component {
  static renderJobResultItem(result: any) {
    return (
      <JobItem
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        metadata={result.get('metadata')}
        created={result.get('created')}
      />
    );
  }

  static renderSubscribeJobsModalButton() {
    return <SubscribeJobsModalButton />;
  }

  constructor(props: any) {
    super(props);
    this.renderAggregationsDrawer = this.renderAggregationsDrawer.bind(this);
    this.renderAggregations = this.renderAggregations.bind(this);
  }

  renderAggregations() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'loadingAggregations' does not exist on t... Remove this comment to see the full error message
    const { loadingAggregations } = this.props;
    return (
      <div className="mt3">
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <LoadingOrChildren loading={loadingAggregations}>
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          <Row type="flex" justify="space-between">
            <Col className="f5">Select Job Filters:</Col>
            <Col>{SearchPage.renderSubscribeJobsModalButton()}</Col>
          </Row>
          <AggregationFiltersContainer
            inline
            displayWhenNoResults
            namespace={JOBS_NS}
          />
        </LoadingOrChildren>
      </div>
    );
  }

  renderAggregationsDrawer() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'loadingAggregations' does not exist on t... Remove this comment to see the full error message
    const { loadingAggregations } = this.props;
    return (
      <DrawerHandle className="mt2" handleText="Filter" drawerTitle="Filter">
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <LoadingOrChildren loading={loadingAggregations}>
          <AggregationFiltersContainer
            inline
            displayWhenNoResults
            namespace={JOBS_NS}
          />
        </LoadingOrChildren>
      </DrawerHandle>
    );
  }

  // TODO: investigate if it is better to use `Context` to pass namespace rather than props
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'loading' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { loading } = this.props;
    return (
      <>
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <DocumentHead title={TITLE} description={META_DESCRIPTION} />
        <div>
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          <Row className="bg-white mb3" type="flex" justify="center">
            <Col xs={0} lg={16} xl={16} xxl={14}>
              <ResponsiveView min="lg" render={this.renderAggregations} />
            </Col>
          </Row>
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          <Row type="flex" justify="center">
            <Col xs={24} lg={16} xl={16} xxl={14}>
              // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
              <LoadingOrChildren loading={loading}>
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                <Row type="flex" align="middle" justify="end">
                  <Col xs={12} lg={12}>
                    <NumberOfResultsContainer namespace={JOBS_NS} />
                  </Col>
                  <Col className="tr" xs={12} lg={0}>
                    <ResponsiveView
                      max="md"
                      render={SearchPage.renderSubscribeJobsModalButton}
                    />
                  </Col>
                  <Col xs={12} lg={0}>
                    <ResponsiveView
                      max="md"
                      render={this.renderAggregationsDrawer}
                    />
                  </Col>
                  <Col className="tr" span={12}>
                    <SortByContainer namespace={JOBS_NS} />
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <ResultsContainer
                      namespace={JOBS_NS}
                      renderItem={SearchPage.renderJobResultItem}
                    />
                    <PaginationContainer namespace={JOBS_NS} />
                  </Col>
                </Row>
              </LoadingOrChildren>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
SearchPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  loadingAggregations: PropTypes.bool.isRequired,
};

const stateToProps = (state: any) => ({
  loading: state.search.getIn(['namespaces', JOBS_NS, 'loading']),

  loadingAggregations: state.search.getIn([
    'namespaces',
    JOBS_NS,
    'loadingAggregations',
  ])
});

export default connect(stateToProps)(SearchPage);
