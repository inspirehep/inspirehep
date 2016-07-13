import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapToIterable',
  pure:false, // FIX for http://stackoverflow.com/questions/34456430/ngfor-doesnt-update-data-with-pipe-in-angular2
})

export class MapToIterablePipe implements PipeTransform {
  transform(map: {}, args: any[] = null): any {
    if (!map)
      return null;
    return Object.keys(map)
      .map(key => new Pair<string>(key, map[key]));
  }
}

class Pair<T> {
  constructor(public key: string, public value: T) {
    
  }
}


