import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavePreviewModalComponent } from './save-preview-modal.component';

describe('SavePreviewModalComponent', () => {
  let component: SavePreviewModalComponent;
  let fixture: ComponentFixture<SavePreviewModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavePreviewModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavePreviewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
