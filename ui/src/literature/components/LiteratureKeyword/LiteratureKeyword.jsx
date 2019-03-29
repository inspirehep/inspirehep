import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import UnclickableTag from '../../../common/components/UnclickableTag';

import './LiteratureKeyword.scss';

class LiteratureKeyword extends Component {
  render() {
    const { keyword } = this.props;
    const keywordValue = keyword.get('value');

    return (
      <UnclickableTag className="__LiteratureKeyword__" color="blue">
        {keywordValue}
      </UnclickableTag>
    );
  }
}

LiteratureKeyword.propTypes = {
  keyword: PropTypes.instanceOf(Map).isRequired,
};

export default LiteratureKeyword;
