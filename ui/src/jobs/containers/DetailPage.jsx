import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Alert } from 'antd';
import { Map } from 'immutable';
import fetchJob from '../../actions/jobs';
import ContentBox from '../../common/components/ContentBox';
import Description from '../components/Description';
import DateFromNow from '../components/DateFromNow';
import ArxivCategoryList from '../../common/components/ArxivCategoryList';
import ExperimentList from '../../common/components/ExperimentList';
import RegionsList from '../components/RegionsList';
import InstitutionsList from '../components/InstitutionsList';
import RanksList from '../components/RanksList';
import InlineUL from '../../common/components/InlineList/InlineUL';
import DeadlineDate from '../components/DeadlineDate';

class DetailPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchJob(this.recordId));
  }

  componentDidUpdate(prevProps) {
    const { dispatch } = this.props;
    const prevRecordId = prevProps.match.params.id;
    if (this.recordId !== prevRecordId) {
      dispatch(fetchJob(this.recordId));
    }
  }

  get recordId() {
    const { match } = this.props;
    return match.params.id;
  }

  render() {
    const { record, loading } = this.props;
    const metadata = record.get('metadata');
    if (!metadata) {
      return null;
    }
    const created = record.get('created');
    const updated = record.get('updated');
    const position = metadata.get('position');
    const institutions = metadata.get('institutions');
    const regions = metadata.get('regions');
    const arxivCategories = metadata.get('arxiv_categories');
    const ranks = metadata.get('ranks');
    const experiments = metadata.get('accelerator_experiments');
    const deadlineDate = metadata.get('deadline_date');
    const description = metadata.get('description');
    const status = metadata.get('status');
    return (
      <>
        <Row type="flex" justify="center">
          <Col className="mv3" xs={24} md={21} lg={19} xl={18}>
            <ContentBox
              loading={loading}
              rightActions={
                <Fragment>
                  <div className="pr2">
                    Created <DateFromNow date={created} />, updated{' '}
                    <DateFromNow date={updated} />
                  </div>
                </Fragment>
              }
            >
              {status === 'closed' && (
                <Alert
                  type="error"
                  message={<span>This job is closed!</span>}
                  showIcon={false}
                />
              )}
              <h2 className="mt3 b">{position}</h2>
              <div className="mt1">
                <InlineUL separateItemsClassName="separate-items-with-middledot">
                  <InstitutionsList institutions={institutions} />
                  <RegionsList regions={regions} />
                </InlineUL>
              </div>
              <div className="mt2">
                <ArxivCategoryList
                  arxivCategories={arxivCategories}
                  wrapperClassName="di"
                />
                <InlineUL
                  separateItemsClassName="separate-items-with-middledot"
                  wrapperClassName="di"
                >
                  <RanksList ranks={ranks} />
                  <ExperimentList experiments={experiments} />
                </InlineUL>
              </div>
              <div className="mt2 b">
                <DeadlineDate deadlineDate={deadlineDate} />
              </div>
              <Row>
                <div className="mt3">
                  <Description description={description} />
                </div>
              </Row>
            </ContentBox>
          </Col>
        </Row>
      </>
    );
  }
}

DetailPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.objectOf(PropTypes.any).isRequired,
  record: PropTypes.instanceOf(Map).isRequired,
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  loading: state.jobs.get('loading'),
  record: state.jobs.get('data'),
});
const dispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, dispatchToProps)(DetailPage);
