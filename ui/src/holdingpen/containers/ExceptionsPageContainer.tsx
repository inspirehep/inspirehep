import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import fetchExceptions from '../../actions/exceptions';
import { convertAllImmutablePropsToJS } from '../../common/immutableToJS';
import ExceptionsDashboard from '../components/ExceptionsDashboard';

class ExceptionsPage extends Component {
  componentDidMount() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'dispatch' does not exist on type 'Readon... Remove this comment to see the full error message
    const { dispatch } = this.props;
    dispatch(fetchExceptions());
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'exceptions' does not exist on type 'Read... Remove this comment to see the full error message
    const { exceptions, loading } = this.props;
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ exceptions: any; loading: any; }' is not a... Remove this comment to see the full error message
    return <ExceptionsDashboard exceptions={exceptions} loading={loading} />;
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ExceptionsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  exceptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = (state: any) => ({
  exceptions: state.exceptions.get('data'),
  loading: state.exceptions.get('loading')
});
const dispatchToProps = (dispatch: any) => ({
  dispatch
});

export default connect(mapStateToProps, dispatchToProps)(
  convertAllImmutablePropsToJS(ExceptionsPage)
);
