import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Map } from 'immutable';
import { Row, Col } from 'antd';

import ResultItem from '../../common/components/ResultItem';
import IncomingLiteratureReferencesLinkAction from '../../common/components/IncomingLiteratureReferencesLinkAction';
import { INSTITUTIONS } from '../../common/routes';
import ListItemAction from '../../common/components/ListItemAction';
import InstitutionHierarchyList from './InstitutionHierarchyList';
import InstitutionAddressList from './InstitutionAddressList';
import EditRecordAction from '../../common/components/EditRecordAction.tsx';
import AuthorizedContainer from '../../common/containers/AuthorizedContainer';
import { SUPERUSER_OR_CATALOGER } from '../../common/authorization';
import { INSTITUTIONS_PID_TYPE } from '../../common/constants';
import { getPapersQueryString } from '../utils';
import UrlsAction from '../../literature/components/UrlsAction';

function InstitutionItem({ metadata }) {
  const legacyIcn = metadata.get('legacy_ICN');
  const recordId = metadata.get('control_number');
  const addresses = metadata.get('addresses');
  const urls = metadata.get('urls');
  const hierarchies = metadata.get('institution_hierarchy');
  const papersCount = metadata.get('number_of_papers', 0);

  return (
    <ResultItem
      leftActions={
        <>
          {urls && <UrlsAction urls={urls} />}
          <AuthorizedContainer authorizedRoles={SUPERUSER_OR_CATALOGER}>
            <EditRecordAction
              pidType={INSTITUTIONS_PID_TYPE}
              pidValue={recordId}
            />
          </AuthorizedContainer>
        </>
      }
      rightActions={
        <ListItemAction>
          <IncomingLiteratureReferencesLinkAction
            itemCount={papersCount}
            referenceType="paper"
            linkQuery={getPapersQueryString(recordId)}
            trackerEventId="Institutions:PaperLink"
          />
        </ListItemAction>
      }
    >
      <Row>
        <Col>
          <Link
            className="result-item-title"
            to={`${INSTITUTIONS}/${recordId}`}
          >
            {legacyIcn}
          </Link>
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
    </ResultItem>
  );
}

InstitutionItem.propTypes = {
  metadata: PropTypes.instanceOf(Map).isRequired,
};

export default InstitutionItem;
