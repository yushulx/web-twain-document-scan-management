import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteScanComponent } from './remote-scan.component';

describe('RemoteScanComponent', () => {
  let component: RemoteScanComponent;
  let fixture: ComponentFixture<RemoteScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemoteScanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
