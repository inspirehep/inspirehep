/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'formik';
import { Button, Icon, Form, Col, Row } from 'antd';

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
              <Form.Item
                wrapperCol={{ span: 24 - labelCol.span }}
                className="items-container"
              >
                {items &&
                  items.length > 0 &&
                  items.map((item, index) => (
                    <Row
                      key={extractKey(item, index)}
                      className="item"
                      data-test-id={`container-${name}.${index}`}
                    >
                      <Col span={22}>{renderItem(`${name}.${index}`)}</Col>
                      {items.length > 1 && (
                        <Col span={1} offset={1}>
                          <Icon
                            type="minus-circle-o"
                            className="remove-button"
                            onClick={() => remove(index)}
                          />
                        </Col>
                      )}
                    </Row>
                  ))}
              </Form.Item>
              <Form.Item
                wrapperCol={{ span: 24 - labelCol.span, push: labelCol.span }}
                className="add-button"
              >
                <Button
                  data-test-id={`${name}-add-item`}
                  type="dashed"
                  onClick={() => push(emptyItem)}
                >
                  <Icon type="plus" /> Add new field
                </Button>
              </Form.Item>
            </Form.Item>
          )}
        />
      </div>
    );
  }
}

ArrayOf.propTypes = {
  label: PropTypes.string,
  labelCol: PropTypes.object,
  extractKey: PropTypes.func,
  renderItem: PropTypes.func.isRequired, // func(itemName)
  emptyItem: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
};

ArrayOf.defaultProps = {
  extractKey: (item, index) => index,
  label: null,
  emptyItem: null,
  labelCol: { span: 5 },
};

export default ArrayOf;
