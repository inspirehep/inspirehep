import React, { Component } from 'react';
import PropTypes from 'prop-types';
import QuillEditor, { Quill } from 'react-quill-new';

import 'react-quill-new/dist/quill.snow.css';
import './RichTextEditor.less';
import EditorToolbar from './EditorToolbar';

// change default text default (`P`)
const Block = Quill.import('blots/block');
Block.tagName = 'DIV';
Quill.register(Block, true);

const QUILL_MODULES = {
  toolbar: '#toolbar',
};

const QUILL_FORMATS = ['bold', 'italic', 'list', 'link'];

class RichTextEditor extends Component {
  render() {
    const {
      'data-test-type': dataTestType,
      'data-test-id': dataTestId,
      ...quillProps
    } = this.props;
    return (
      <div
        className="__RichTextEditor__ ant-input"
        data-test-type={dataTestType}
        data-test-id={dataTestId}
      >
        <div id="toolbar">
          <EditorToolbar />
        </div>
        <QuillEditor
          theme="snow"
          modules={QUILL_MODULES}
          formats={QUILL_FORMATS}
          {...quillProps}
        />
      </div>
    );
  }
}

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  readOnly: PropTypes.bool,
  'data-test-type': PropTypes.string,
  'data-test-id': PropTypes.string,
};

export default RichTextEditor;
