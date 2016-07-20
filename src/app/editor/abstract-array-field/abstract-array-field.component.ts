import { AbstractTrackerComponent } from '../abstract-tracker';

import { EmptyValueService } from '../shared/services';

/**
 * Abstract component to share code of common operations of all array fields
 * 
 * Instance properties declared here only to resolve syntax errors. 
 * Hence they need to be declared in children extending components (with decarators if necessary)
 */
export abstract class AbstractArrayFieldComponent extends AbstractTrackerComponent {

  values: Array<any>;
  schema: Object;
  emptyValueService: EmptyValueService;
  protected _emptyValue: any;

  /**
   * Called when a property of any element of the values is changed
   * Used if values is a object array.
   * 
   * @param {any} event - new value
   * @param {number} index - index of changed element in array
   * @param {key} key - name of the changed property of the element in given index
   * 
   */
  onValueChange(event: any, index: number, key: string) {
    this.values[index][key] = event;
  }

  /**
   * @param {number} index - Index of the element that is moved
   * @param {number} direction - Movement direction. -1 for UP, +1 for DOWN
   */
  moveElement(index: number, direction: number) {
    let newIndex = index + direction;
    let temp = this.values[index];
    this.values[index] = this.values[newIndex];
    this.values[newIndex] = temp;
  }

  addNewElement() {
    this.values.push(this.emptyValue);
  }

  /**
   * Returns copy of empty value generated via schema.
   * At first caches the actual value for later use.
   * After returns a copy of the cache.
   */
  get emptyValue(): any {
    if (!this._emptyValue) {
      this._emptyValue = this.emptyValueService.generateEmptyValue(this.schema['items']);
    }
    // Return a copy if it is an object because objects are passed by reference.
    return (typeof this._emptyValue === 'object') ? 
      Object.assign({}, this._emptyValue) : this._emptyValue;
  }

  /**
   * @param {number} index - Index of the element to be deleted
   */
  deleteElement(index: number) {
    this.values.splice(index, 1);
  }
}
