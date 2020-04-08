import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Row, Col } from 'antd';

import withRouteActionsDispatcher from '../../common/withRouteActionsDispatcher';
import fetchInstitution from '../../actions/institutions';
import WebsitesAction from '../../common/components/WebsitesAction';
import ContentBox from '../../common/components/ContentBox';
import DocumentHead from '../../common/components/DocumentHead';
import InstitutionHierarchyList from '../components/InstitutionHierarchyList';
import InstitutionPapers from './InstitutionPapers';
import { newSearch } from '../../actions/search';
import { INSTITUTION_PAPERS_NS } from '../../reducers/search';
import RequireOneOf from '../../common/components/RequireOneOf';
import GridLink from '../components/GridLink';
import RorLink from '../components/RorLink';
import InstitutionsNameVariantsList from '../components/InstitutionNameVariantsList';
import InstitutionPeople from '../components/InstitutionPeople';
import RelatedRecordsList from '../components/RelatedRecordsList';
import { getInstitutionMetaDescription } from '../utils';
import InstitutionsHistoricalDataList from '../components/InstitutionsHistoricalDataList';
import PublicNotesList from '../../common/components/PublicNotesList';
import InstitutionAddressList from '../components/InstitutionAddressList';

function DetailPage({ record }) {
  const metadata = record.get('metadata');
  const urls = metadata.get('urls');
  const controlNumber = metadata.get('control_number');
  const legacyIcn = metadata.get('legacy_ICN');
  const addresses = metadata.get('addresses');
  const hierarchies = metadata.get('institution_hierarchy');
  const grid = metadata.get('grid');
  const ror = metadata.get('ror');
  const nameVariants = metadata.get('name_variants');
  const parentInstitutions = metadata.get('parent_institutions');
  const successorInstitutitons = metadata.get('successor_institutions');
  const predecessorInstitutions = metadata.get('predecessor_institutions');
  const subsidiaryInstitutions = metadata.get('subsidiary_institutions');
  const historicalData = metadata.get('historical_data');
  const publicNotes = metadata.get('public_notes');
  const metaDescription = useMemo(
    () => getInstitutionMetaDescription(metadata),
    [metadata]
  );
  return (
    <>
      <DocumentHead title={legacyIcn} description={metaDescription} />
      <Row justify="center">
        <Col className="mv3" xs={24} md={22} lg={21} xxl={18}>
          <ContentBox
            className="sm-pb3"
            leftActions={<>{urls && <WebsitesAction websites={urls} />}</>}
          >
            <Row>
              <Col>
                <h2>{legacyIcn}</h2>
              </Col>
            </Row>
            <Row>
              <Col>
                <InstitutionHierarchyList hierarchies={hierarchies} />
              </Col>
            </Row>
            <Row>
              <Col>
                <InstitutionAddressList addresses={addresses} />
              </Col>
            </Row>
            <RequireOneOf
              dependencies={[
                grid,
                ror,
                nameVariants,
                parentInstitutions,
                successorInstitutitons,
                predecessorInstitutions,
                publicNotes,
                historicalData,
              ]}
            >
              <Row className="mt3">
                <Col>
                  {grid && (
                    <Row>
                      <GridLink grid={grid} />
                    </Row>
                  )}
                  {ror && (
                    <Row>
                      <RorLink ror={ror} />
                    </Row>
                  )}
                  <InstitutionsNameVariantsList nameVariants={nameVariants} />
                  <InstitutionsHistoricalDataList
                    historicalData={historicalData}
                  />
                  <PublicNotesList publicNotes={publicNotes} />
                  <RelatedRecordsList
                    relatedRecords={parentInstitutions}
                    relationType="Parent"
                  />
                  <RelatedRecordsList
                    relatedRecords={subsidiaryInstitutions}
                    relationType="Subsidiary"
                  />
                  <RelatedRecordsList
                    relatedRecords={successorInstitutitons}
                    relationType="Successor"
                  />
                  <RelatedRecordsList
                    relatedRecords={predecessorInstitutions}
                    relationType="Predecessor"
                  />
                </Col>
              </Row>
            </RequireOneOf>
            <Row className="mt3">
              <Col>
                <InstitutionPeople recordId={controlNumber} />
              </Col>
            </Row>
          </ContentBox>
        </Col>
      </Row>
      <Row justify="center">
        <Col xs={24} md={22} lg={21} xxl={18}>
          <ContentBox>
            <InstitutionPapers recordId={controlNumber} />
          </ContentBox>
        </Col>
      </Row>
    </>
  );
}

DetailPage.propTypes = {
  record: PropTypes.instanceOf(Map).isRequired,
};

const mapStateToProps = state => ({
  record: state.institutions.get('data'),
});
const DetailPageContainer = connect(mapStateToProps)(DetailPage);

export default withRouteActionsDispatcher(DetailPageContainer, {
  routeParamSelector: ({ id }) => id,
  routeActions: id => [fetchInstitution(id), newSearch(INSTITUTION_PAPERS_NS)],
  loadingStateSelector: state =>
    !state.institutions.hasIn(['data', 'metadata']),
});
