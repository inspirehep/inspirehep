import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Spin, Row, Col } from 'antd';
import { Map } from 'immutable';

import './DetailPage.scss';
import fetchLiterature from '../../../actions/literature';
import Latex from '../../../common/components/Latex';
import AuthorList from '../../components/AuthorList';
import ArxivEprintList from '../../components/ArxivEprintList';
import DOIList from '../../components/DOIList';
import PublicationInfoList from '../../components/PublicationInfoList';
import ReportNumberList from '../../components/ReportNumberList';
import LiteratureKeywordList from '../../components/LiteratureKeywordList';
import CiteModalAction from '../../components/CiteModalAction';
import ExternalSystemIdentifierList from '../../components/ExternalSystemIdentifierList';
import ReferenceList from '../../components/ReferenceList';
import LiteratureDate from '../../components/LiteratureDate';

class DetailPage extends Component {
  static renderLoadingSpin() {
    return <Spin tip="Loading" />;
  }

  componentWillMount() {
    this.props.dispatch(fetchLiterature(this.props.match.params.id));
  }

  render() {
    const { loading } = this.props;
    if (loading) {
      return DetailPage.renderLoadingSpin();
    }

    const { record } = this.props;
    const metadata = record.get('metadata');
    if (!metadata) {
      return null;
    }

    const title = metadata.getIn(['titles', 0, 'title']);
    const authors = metadata.get('authors');
    const date = metadata.get('date');
    const recordId = metadata.get('control_number');
    const publicationInfo = metadata.get('publication_info');
    const eprints = metadata.get('arxiv_eprints');
    const dois = metadata.get('dois');
    const reportNumbers = metadata.get('report_numbers');
    const externalSystemIdentifiers = metadata.get(
      'external_system_identifiers'
    );

    const abstract = metadata.getIn(['abstracts', 0, 'value']);

    const keywords = metadata.get('keywords');

    return (
      <Row className="__DetailPage__" type="flex" justify="center">
        <Col className="content" span={16}>
          <Row>
            <h2>
              <Latex>{title}</Latex>
            </h2>
            <AuthorList recordId={recordId} authors={authors} />
            <LiteratureDate date={date} />
            <div className="vertical-space">
              <PublicationInfoList publicationInfo={publicationInfo} />
              <ArxivEprintList eprints={eprints} />
              <DOIList dois={dois} />
              <ReportNumberList reportNumbers={reportNumbers} />
              <ExternalSystemIdentifierList
                externalSystemIdentifiers={externalSystemIdentifiers}
              />
            </div>
            <div className="vertical-space">
              <CiteModalAction recordId={recordId} />
            </div>
          </Row>
          <Row>
            <Latex>{abstract}</Latex>
          </Row>
          <Row>
            <LiteratureKeywordList keywords={keywords} />
          </Row>
          <Row>
            <ReferenceList />
          </Row>
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

const mapStateToProps = state => ({
  loading: state.literature.get('loading'),
  record: state.literature.get('data'),
});
const dispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, dispatchToProps)(DetailPage);
