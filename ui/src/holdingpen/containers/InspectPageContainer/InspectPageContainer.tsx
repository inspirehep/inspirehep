import React, { useEffect } from 'react';
import { RootStateOrAny, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Row, Col, Card } from 'antd';

import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import JsonDiff from '../../components/JsonDiff';
import fetchInspect from '../../../actions/inspect';
import { convertAllImmutablePropsToJS } from '../../../common/immutableToJS';

import './InspectPageContainer.less';

interface InspectPageContainerProps {
  data: {
    root: Record<string, any>;
    head: Record<string, any>;
    update: Record<string, any>;
    merged: Record<string, any>;
  };
  dispatch: (fn: Function) => void;
  loading: boolean;
  match: Record<string, any>;
}

const InspectPageContainer: React.FC<InspectPageContainerProps> = ({
  loading,
  data,
  match,
  dispatch,
}) => {
  useEffect(() => {
    const workflowId = match.params.id;
    dispatch(fetchInspect(workflowId));
  }, []);

  const root = data.root || {};
  const head = data.head || {};
  const update = data.update || {};
  const merged = data.merged || {};

  return (
    <div
      className="__InspectPage__ w-100"
      data-testid="holdingpen-inspect-page"
    >
      <LoadingOrChildren loading={loading}>
        <Row
          align="middle"
          justify="space-around"
          gutter={16}
          className="w-100 mt3"
        >
          <Col span={8}>
            <Card title="Head on root">
              <JsonDiff first={root} second={head} />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Update on root">
              <JsonDiff first={root} second={update} />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Merged on head">
              <JsonDiff first={head} second={merged} />
            </Card>
          </Col>
        </Row>
      </LoadingOrChildren>
    </div>
  );
};

const mapStateToProps = (state: RootStateOrAny) => ({
  data: state.inspect.get('data'),
  loading: state.inspect.get('loading'),
});

const dispatchToProps = (dispatch: Dispatch) => ({ dispatch });

export default connect(
  mapStateToProps,
  dispatchToProps
)(convertAllImmutablePropsToJS(InspectPageContainer));
