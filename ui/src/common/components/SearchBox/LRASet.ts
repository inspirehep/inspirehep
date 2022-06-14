export default class LRASet {
  constructor(values, capacity) {
    this.capacity = capacity;
    this.values = [];
    this.valueToIndex = new Map();

    if (values) {
      values.forEach(this.add.bind(this));
    }
  }

  filter(filterFn) {
    return this.values.filter(filterFn);
  }

  add(value) {
    if (this.valueToIndex.has(value)) {
      this.remove(value);
    } else if (this.values.length >= this.capacity) {
      this.removeFirst();
    }

    this.values.push(value);
    this.valueToIndex.set(value, this.values.length - 1);
  }

  remove(value) {
    const currentIndex = this.valueToIndex.get(value);
    this.values.splice(currentIndex, 1);
    this.valueToIndex.delete(value);
  }

  removeFirst() {
    const removed = this.values.shift();
    this.valueToIndex.delete(removed);
  }

  toJSON() {
    return this.values;
  }
}
