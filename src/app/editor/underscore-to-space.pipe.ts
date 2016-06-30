import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'underscoreToSpace',
  pure: false,
})
export class UnderscoreToSpacePipe implements PipeTransform {
  transform(text: string): string {
    return text.replace(/\_/g, ' ');
  }
}