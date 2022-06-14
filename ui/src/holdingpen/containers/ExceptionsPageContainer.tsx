import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import fetchExceptions from '../../actions/exceptions';
import { convertAllImmutablePropsToJS } from '../../common/immutableToJS';
import ExceptionsDashboard from '../components/ExceptionsDashboard';

type ExceptionsPageProps = {
    dispatch: $TSFixMeFunction;
    exceptions: $TSFixMe[];
    loading: boolean;
};

class ExceptionsPage extends Component<ExceptionsPageProps> {

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchExceptions());
  }

  render() {
    const { exceptions, loading } = this.props;
    return <ExceptionsDashboard exceptions={exceptions} loading={loading} />;
  }
}

const mapStateToProps = (state: $TSFixMe) => ({
  exceptions: state.exceptions.get('data'),
  loading: state.exceptions.get('loading')
});
const dispatchToProps = (dispatch: $TSFixMe) => ({
  dispatch
});

export default connect(mapStateToProps, dispatchToProps)(
  convertAllImmutablePropsToJS(ExceptionsPage)
);
