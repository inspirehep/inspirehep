import React from 'react';
import { Row, Col, Radio } from 'antd';
import { Map } from 'immutable';

import Author from '../../common/components/Author';
import ResultItem from '../../common/components/ResultItem';
import { castPropToNumber, getRecordIdFromRef } from '../../common/utils';

const AuthorResult = ({
  item,
  page,
}: {
  item: Map<string, string>;
  page: string;
}) => {
  const getAuthorRecordIdFromRef = (item: Map<string, string>): number | undefined => {
    // @ts-ignore
    const recordRef = item.get('record')?.toJS().$ref;
    return recordRef ? castPropToNumber(getRecordIdFromRef(recordRef)) : undefined;
  };
  
  const isRadioButtonDisabled = (item: Map<string, string>): boolean => !getAuthorRecordIdFromRef(item);

  return (
    <Row>
      <Col flex="0 1 1px">
        <Radio
          value={getAuthorRecordIdFromRef(item)}
          disabled={isRadioButtonDisabled(item)}
          data-test-id={`literature-drawer-radio-${getAuthorRecordIdFromRef(item)}`}
        />
      </Col>
      <Col flex="1 1 1px" className="pb2">
        <ResultItem>
          <Author author={item} page={page} />
        </ResultItem>
      </Col>
    </Row>
  );
};

export default AuthorResult;
