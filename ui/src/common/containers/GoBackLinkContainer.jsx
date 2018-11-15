import React, { Component } from 'react';
import { connect } from 'react-redux';
import { goBack } from 'react-router-redux';
import PropTypes from 'prop-types';

class GoBackLink extends Component {
  render() {
    const { children, onClick } = this.props;
    return (
      /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */
      <a onClick={onClick}>{children}</a>
    );
  }
}

GoBackLink.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.string,
};

GoBackLink.defaultProps = {
  children: 'go back',
};

export const dispatchToProps = dispatch => ({
  onClick() {
    dispatch(goBack());
  },
});

export default connect(null, dispatchToProps)(GoBackLink);
