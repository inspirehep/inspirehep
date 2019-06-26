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
    const { ...autoCompleteProps } = this.props;
    const dataTestType = autoCompleteProps['data-test-type'];
    const dataTestId = autoCompleteProps['data-test-id'];
    return (
      <div data-test-type={dataTestType} data-test-id={dataTestId}>
        <QuillEditor
          className="ant-input __RichTextEditor__"
          theme="snow"
          modules={QUILL_MODULES}
          formats={QUILL_FORMATS}
          {...this.props}
        />
      </div>
    );
  }
}

RichTextEditor.propTypes = QuillEditor.propTypes;

export default RichTextEditor;
