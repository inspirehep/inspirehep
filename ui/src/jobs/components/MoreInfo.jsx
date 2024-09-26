import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import URLList from '../../common/components/URLList';

class MoreInfo extends Component {
  render() {
    const { urls } = this.props;
    return (
      urls && (
        <div>
          <strong>More Information: </strong>
          <URLList urls={urls} wrapperClassName="di" />
        </div>
      )
    );
  }
}

MoreInfo.propTypes = {
  urls: PropTypes.instanceOf(List),
};

MoreInfo.defaultProps = {
  urls: null,
};

export default MoreInfo;
