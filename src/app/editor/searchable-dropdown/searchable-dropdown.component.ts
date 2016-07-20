import { Component, EventEmitter, Input, Output } from '@angular/core';

import { DROPDOWN_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';

import { FilterByPrefixPipe } from '../shared/pipes';

@Component({
  selector: 'searchable-dropdown',
  directives: [DROPDOWN_DIRECTIVES],
  pipes: [FilterByPrefixPipe],
  styles: [
    require('./searchable-dropdown.component.scss')
  ],
  template: require('./searchable-dropdown.component.html')
})
export class SearchableDropdownComponent  {

  @Input() items: Array<string>;
  @Input() value: string;
    prefix: string = '';



  @Output() onSelect: EventEmitter<string> = new EventEmitter<string>();

  onPrefixChange(prefix: string) {
    this.prefix = prefix;
  }

  onToggle(isOpen: boolean) {
    if (!isOpen) {
      this.prefix = '';
    }
  }

  onItemClick(item: string) {
    this.value = item;
    this.onSelect.emit(item);
  }

}