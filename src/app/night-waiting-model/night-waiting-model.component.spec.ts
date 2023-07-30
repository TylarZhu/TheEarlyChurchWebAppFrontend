import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NightWaitingModelComponent } from './night-waiting-model.component';

describe('NightWaitingModelComponent', () => {
  let component: NightWaitingModelComponent;
  let fixture: ComponentFixture<NightWaitingModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NightWaitingModelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NightWaitingModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
