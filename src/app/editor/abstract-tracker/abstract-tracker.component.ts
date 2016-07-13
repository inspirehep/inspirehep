export abstract class AbstractTrackerComponent {
  
  /**
   * Used for track changes in model
   * that is used to generate elements via *ngFor
   * RELATED ISSUE: https://github.com/angular/angular/issues/4402
   * TODO: Create a base component class that implements track by for all
   */
  trackByFunction(index: number, obj: any): any {
    return index;
  }
}