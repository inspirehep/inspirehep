import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import { Row, Col, Card } from 'antd';

import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import JsonDiff from '../../components/JsonDiff';
import fetchInspect from '../../../actions/inspect';
import { convertAllImmutablePropsToJS } from '../../../common/immutableToJS';

import './InspectPage.scss';

type InspectPageProps = {
    data: {
        root?: {
            [key: string]: $TSFixMe;
        };
        head?: {
            [key: string]: $TSFixMe;
        };
        update?: {
            [key: string]: $TSFixMe;
        };
        merged?: {
            [key: string]: $TSFixMe;
        };
    };
    dispatch: $TSFixMeFunction;
    loading: boolean;
    match: {
        [key: string]: $TSFixMe;
    };
};

class InspectPage extends Component<InspectPageProps> {

  componentDidMount() {
    const { match, dispatch } = this.props;
    const workflowId = match.params.id;
    dispatch(fetchInspect(workflowId));
  }

  render() {
    const { loading, data } = this.props;
    const root = data.root || {};
    const head = data.head || {};
    const update = data.update || {};
    const merged = data.merged || {};

    return (
      <div className="__InspectPage__ w-100">
        <LoadingOrChildren loading={loading}>
          <Row
            align="middle"
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            type="flex"
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
  }
}

const mapStateToProps = (state: $TSFixMe) => ({
  data: state.inspect.get('data'),
  loading: state.inspect.get('loading')
});
const dispatchToProps = (dispatch: $TSFixMe) => ({
  dispatch
});

export default connect(mapStateToProps, dispatchToProps)(
  convertAllImmutablePropsToJS(InspectPage)
);
