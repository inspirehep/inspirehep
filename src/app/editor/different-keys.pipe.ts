import { Pipe, PipeTransform } from '@angular/core';
/**
 * It returns array of keys which aren't present in given object (args[0])
 */
@Pipe({
  name: 'differentKeys',
  pure: false, // FIX for http://stackoverflow.com/questions/34456430/ngfor-doesnt-update-data-with-pipe-in-angular2
})
export class DifferentKeysPipe implements PipeTransform {
  transform(object: Object, other: Object): Array<string> {
    return Object.keys(object)
      .filter(prop => !other.hasOwnProperty(prop));
  }
}