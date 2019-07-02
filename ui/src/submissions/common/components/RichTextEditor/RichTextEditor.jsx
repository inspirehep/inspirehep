import React, { Component } from 'react';
import QuillEditor from 'react-quill';

import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.scss';

const QUILL_MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

const QUILL_FORMATS = ['bold', 'italic', 'underline', 'list', 'bullet', 'link'];

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
