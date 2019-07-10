import React, { Component } from 'react';
import QuillEditor from 'react-quill';

import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.scss';
import EditorToolbar from './EditorToolbar';

const QUILL_MODULES = {
  toolbar: '#toolbar',
};

const QUILL_FORMATS = ['bold', 'italic', 'list', 'bullet', 'link'];

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

RichTextEditor.propTypes = QuillEditor.propTypes;

export default RichTextEditor;
