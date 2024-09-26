import React, { Component } from 'react';

class EditorToolbar extends Component {
  render() {
    return (
      <>
        <span className="ql-formats">
          <button className="ql-bold" type="button" title="Bold" />
          <button className="ql-italic" type="button" title="Italic" />
        </span>
        <span className="ql-formats">
          <button
            className="ql-list"
            value="ordered"
            type="button"
            title="Numbered List"
          />
          <button
            className="ql-list"
            value="bullet"
            type="button"
            title="Bulleted List"
          />
        </span>
        <span className="ql-formats">
          <button className="ql-link" type="button" title="Link" />
        </span>
        <span className="ql-formats">
          <button
            className="ql-clean"
            type="button"
            title="Clear All Formatting"
          />
        </span>
      </>
    );
  }
}

export default EditorToolbar;
