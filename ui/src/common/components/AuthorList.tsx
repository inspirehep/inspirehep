import React, { useState } from 'react';
import { List, Map } from 'immutable';
import { Modal } from 'antd';

import InlineDataList from './InlineList';
import Author from './Author';
import SecondaryButton from './SecondaryButton';
import { getAuthorName } from '../utils';

function AuthorList(props: any) {
  const { authors, limit, enableShowAll, total, wrapperClassName, page } = props;
  const [modalVisible, setModalVisible] = useState(false);

  const onModalOpen = () => {
    setModalVisible(true);
  };

  const onModalCancel = () => {
    setModalVisible(false);
  };

  const renderShowAllOrEtAl = () => {
    if (enableShowAll) {
      return (
        <div className="di pl1">
          <SecondaryButton onClick={onModalOpen}>
            Show All({authors.size})
          </SecondaryButton>
        </div>
      );
    }
    return <span> et al.</span>;
  };

  const renderAuthorList = (authorsToDisplay: List<any>, displayShowAll = true) => (
    <InlineDataList
      wrapperClassName={wrapperClassName}
      items={authorsToDisplay}
      suffix={
        authors.size > limit && displayShowAll ? renderShowAllOrEtAl() : null
      }
      extractKey={getAuthorName}
      renderItem={(author: Map<string, string>) => <Author author={author} page={page} />}
    />
  );

  const showTotal = total === -1 ? authors.size : total;

  return (
    <>
      {renderAuthorList(authors.take(limit))}
      <Modal
        title={`${showTotal} authors`}
        width="50%"
        open={modalVisible}
        footer={null}
        onCancel={onModalCancel}
      >
        {renderAuthorList(authors, false)}
      </Modal>
    </>
  );
}

AuthorList.defaultProps = {
  authors: List(),
  limit: 5,
  enableShowAll: false,
  total: -1,
  wrapperClassName: null,
  page: ''
};

export default AuthorList;
