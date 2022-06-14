import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import { Map } from 'immutable';
import { Row, Col } from 'antd';

import ResultItem from '../../common/components/ResultItem';
import IncomingLiteratureReferencesLinkAction from '../../common/components/IncomingLiteratureReferencesLinkAction';
import { INSTITUTIONS } from '../../common/routes';
import ListItemAction from '../../common/components/ListItemAction';
import InstitutionHierarchyList from './InstitutionHierarchyList';
import InstitutionAddressList from './InstitutionAddressList';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import EditRecordAction from '../../common/components/EditRecordAction.tsx';
import AuthorizedContainer from '../../common/containers/AuthorizedContainer';
import { SUPERUSER_OR_CATALOGER } from '../../common/authorization';
import { INSTITUTIONS_PID_TYPE } from '../../common/constants';
import { getPapersQueryString } from '../utils';
import UrlsAction from '../../literature/components/UrlsAction';

type Props = {
    metadata: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

function InstitutionItem({ metadata }: Props) {
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

export default InstitutionItem;
