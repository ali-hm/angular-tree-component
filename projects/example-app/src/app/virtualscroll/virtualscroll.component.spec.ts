import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VirtualscrollComponent } from './virtualscroll.component';

describe('VirtualscrollComponent', () => {
  let component: VirtualscrollComponent;
  let fixture: ComponentFixture<VirtualscrollComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [VirtualscrollComponent],
      teardown: { destroyAfterEach: false }
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualscrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
