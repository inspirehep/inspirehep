import { Injectable } from '@angular/core';

@Injectable()
export class AppService {
  constructor() {

  }

  logStuff(stuff: string) {
    console.log(stuff);
  }
}