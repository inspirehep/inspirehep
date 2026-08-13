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
  const getAuthorRecordIdFromRef = (): number | undefined => {
    // @ts-ignore
    const recordRef = item.get('record')?.toJS().$ref;
    return recordRef
      ? castPropToNumber(getRecordIdFromRef(recordRef))
      : undefined;
  };

  const isRadioButtonDisabled = (): boolean => !getAuthorRecordIdFromRef();

  return (
    <Row className="pb2">
      <Col flex="0 1 1px" className="flex items-center pr2">
        <Radio
          value={getAuthorRecordIdFromRef()}
          disabled={isRadioButtonDisabled()}
          data-test-id={`literature-drawer-radio-${getAuthorRecordIdFromRef()}`}
          data-testid={`literature-drawer-radio-${getAuthorRecordIdFromRef()}`}
        />
      </Col>
      <Col flex="1 1 1px">
        <ResultItem>
          <Author author={item} page={page} />
        </ResultItem>
      </Col>
    </Row>
  );
};

export default AuthorResult;
