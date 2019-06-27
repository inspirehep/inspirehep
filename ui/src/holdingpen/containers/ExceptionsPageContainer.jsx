import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import fetchExceptions from '../../actions/exceptions';
import { convertAllImmutablePropsToJS } from '../../common/immutableToJS';
import ExceptionsDashboard from '../components/ExceptionsDashboard';

class ExceptionsPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchExceptions());
  }

  render() {
    const { exceptions, loading } = this.props;
    return <ExceptionsDashboard exceptions={exceptions} loading={loading} />;
  }
}

ExceptionsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  exceptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  exceptions: state.exceptions.get('data'),
  loading: state.exceptions.get('loading'),
});
const dispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, dispatchToProps)(
  convertAllImmutablePropsToJS(ExceptionsPage)
);
