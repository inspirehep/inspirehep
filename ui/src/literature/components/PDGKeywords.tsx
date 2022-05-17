import React, { useState } from 'react';
import { Modal, List } from 'antd';

import SecondaryButton from '../../common/components/SecondaryButton';
// @ts-ignore
import ExternalLink from '../../common/components/ExternalLink';

interface IKeyword {
  get: (arg: string) => string;
  size: number;
  valueSeq: () => {get: (arg: number) => IKeyword}
}

export const PDGKeywords = ({ keywords }: { keywords: IKeyword }) => {
  const [modalVisibility, setModalVisibility] = useState<boolean>(false);

  const toggleModal = () => setModalVisibility(!modalVisibility);

  const renderShowAll = () => (
    <div className="di pl2">
      <SecondaryButton onClick={toggleModal}>
        Show All({keywords.size})
      </SecondaryButton>
    </div>
  );

  const renderKeyword = (keyword: IKeyword) => {
    const keywordValue = keyword && keyword.get('value');
    const keywordDescription = keyword && keyword.get('description');
    
    return (
      <ExternalLink href={`https://pdglive.lbl.gov/view/${keywordValue}`}>
        {keywordDescription}
      </ExternalLink>
    );
  };

  return (
    <div>
      PDG:{' '}
      <>
        {renderKeyword(keywords.valueSeq().get(0))}
        {keywords.size > 1 && renderShowAll()}
        <Modal
          title="PDG keywords"
          width="50%"
          visible={modalVisibility}
          footer={null}
          onCancel={toggleModal}
          bodyStyle={{padding: '12px 24px 24px 24px'}}
        >
          <List
            // @ts-ignore
            dataSource={keywords}
            size="small"
            pagination={{
              pageSize: 10,
              size: "small",
              hideOnSinglePage: true,
            }}
            renderItem={(keyword: IKeyword) => <List.Item>{renderKeyword(keyword)}</List.Item>}
          />
        </Modal>
      </>
    </div>
  );
};
