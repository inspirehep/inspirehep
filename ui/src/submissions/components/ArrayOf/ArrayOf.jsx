/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'formik';
import { Button, Icon, Form } from 'antd';

import './ArrayOf.scss';

class ArrayOf extends Component {
  constructor(props) {
    super(props);
    this.onItemRemoveClick = this.onItemRemoveClick.bind(this);
  }

  onItemRemoveClick(value) {
    const { form, name } = this.props;
    form.setFieldValue(name, value);
  }

  render() {
    const {
      name,
      extractKey,
      label,
      labelCol,
      emptyItem,
      values,
      renderItem,
    } = this.props;
    const items = values[name];
    return (
      <div className="__ArrayOf__">
        <FieldArray
          name={name}
          render={({ push, remove }) => (
            <Form.Item label={label} labelCol={labelCol}>
              {items &&
                items.length > 0 &&
                items.map((item, index) => (
                  <div key={extractKey(item, index)}>
                    {renderItem(`${name}.${index}`)}
                    <Icon
                      type="minus-circle-o"
                      className="remove-button"
                      onClick={() => remove(index)}
                    />
                  </div>
                ))}
              <Button type="dashed" onClick={() => push(emptyItem)}>
                <Icon type="plus" /> Add new field
              </Button>
            </Form.Item>
          )}
        />
      </div>
    );
  }
}

ArrayOf.propTypes = {
  label: PropTypes.string,
  labelCol: PropTypes.objectOf(PropTypes.any),
  extractKey: PropTypes.func,
  renderItem: PropTypes.func.isRequired, // func(itemName)
  emptyItem: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
    .isRequired,
};

ArrayOf.defaultProps = {
  extractKey: (item, index) => index,
  label: null,
  labelCol: { span: 5 },
};

export default ArrayOf;
