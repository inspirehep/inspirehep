import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Modal, Row, Col } from 'antd';

import SecondaryButton from '../../common/components/SecondaryButton';
import DOIList from '../../literature/components/DOIList';
import { filterDoisByMaterial, hasAdditionalDois } from '../utils';

const DOIListShowAll = ({ dois }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const dataDois = filterDoisByMaterial(dois);
  const hasOtherDois = hasAdditionalDois(dois);
  const hasDataDois = dataDois.size > 0;
  const showAllDois = hasOtherDois && hasDataDois;

  const onModalOpen = () => {
    setModalVisible(true);
  };

  const onModalCancel = () => {
    setModalVisible(false);
  };

  if (showAllDois) {
    return (
      <>
        <Row>
          <Col><DOIList dois={dataDois} /></Col>
          <div className="di pl1">
            <SecondaryButton onClick={onModalOpen}>
              Show All({dois.size})
            </SecondaryButton>
          </div>
        </Row>
        <Modal
          title={`${dois.size} DOIs`}
          width="50%"
          open={modalVisible}
          footer={null}
          onCancel={onModalCancel}
        >
          <DOIList dois={dois} showLabel={false} />
        </Modal>
      </>
    );
  }

  if (hasDataDois) {
    return (
      <Row>
        <Col><DOIList dois={dataDois} /></Col>
      </Row>
    )
  }

  return null;
};

DOIListShowAll.propTypes = {
  dois: PropTypes.instanceOf(List),
};

DOIListShowAll.defaultProps = {
  dois: List(),
};

export default DOIListShowAll;
