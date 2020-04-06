import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Map } from 'immutable';
import { Row, Col } from 'antd';
import { LoginOutlined } from '@ant-design/icons';

import ResultItem from '../../common/components/ResultItem';
import { INSTITUTIONS, LITERATURE } from '../../common/routes';
import AddressList from '../../common/components/AddressList';
import WebsitesAction from '../../common/components/WebsitesAction';
import { getPapersQueryString } from '../utils';
import IconText from '../../common/components/IconText';
import ListItemAction from '../../common/components/ListItemAction';
import InstitutionHierarchyList from './InstitutionHierarchyList';
import pluralizeUnlessSingle from '../../common/utils';

function InstitutionItem({ metadata }) {
  const legacyIcn = metadata.get('legacy_ICN');
  const recordId = metadata.get('control_number');
  const addresses = metadata.get('addresses');
  const urls = metadata.get('urls');
  const hierarchies = metadata.get('institution_hierarchy');
  const papersCount = metadata.get('number_of_papers', 0);

  return (
    <ResultItem
      leftActions={urls && <WebsitesAction websites={urls} />}
      rightActions={
        <ListItemAction>
          <Link to={`${LITERATURE}?q=${getPapersQueryString(recordId)}`}>
            <IconText
              text={`${papersCount} ${pluralizeUnlessSingle(
                'paper',
                papersCount
              )}`}
              icon={<LoginOutlined />}
            />
          </Link>
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
          <AddressList addresses={addresses} />
        </Col>
      </Row>
    </ResultItem>
  );
}

InstitutionItem.propTypes = {
  metadata: PropTypes.instanceOf(Map).isRequired,
};

export default InstitutionItem;
