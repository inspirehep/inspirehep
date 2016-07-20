import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByPrefix',
  pure: false, // FIX for http://stackoverflow.com/questions/34456430/ngfor-doesnt-update-data-with-pipe-in-angular2
})

export class FilterByPrefixPipe implements PipeTransform {
  transform(array: Array<string>, prefix: string): Array<string> {
    return array.filter(value => value.startsWith(prefix));
  }
}



