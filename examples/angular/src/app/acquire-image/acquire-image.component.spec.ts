import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcquireImageComponent } from './acquire-image.component';

describe('AcquireImageComponent', () => {
  let component: AcquireImageComponent;
  let fixture: ComponentFixture<AcquireImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcquireImageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcquireImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
