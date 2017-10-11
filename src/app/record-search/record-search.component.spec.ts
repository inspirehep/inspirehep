import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordSearchComponent } from './record-search.component';

describe('RecordSearchComponent', () => {
  let component: RecordSearchComponent;
  let fixture: ComponentFixture<RecordSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
