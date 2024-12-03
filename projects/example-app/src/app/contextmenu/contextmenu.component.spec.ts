import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContextmenuComponent } from './contextmenu.component';

describe('ContextmenuComponent', () => {
  let component: ContextmenuComponent;
  let fixture: ComponentFixture<ContextmenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContextmenuComponent],
      teardown: { destroyAfterEach: false }
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
