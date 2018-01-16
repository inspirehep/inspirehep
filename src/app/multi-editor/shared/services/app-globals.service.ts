import { Injectable } from '@angular/core';

@Injectable()
export class AppGlobalsService {
  readonly conditionMatchTypes = [
    'is equal to',
    'contains',
    'does not exist',
    'matches regular expression'
  ];

  readonly actionMatchTypes = [
    'is equal to',
    'contains',
    'matches regular expression'
  ];
}
