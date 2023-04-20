import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewIdentityModalComponent } from './view-identity-modal.component';

describe('ViewIdentityModalComponent', () => {
  let component: ViewIdentityModalComponent;
  let fixture: ComponentFixture<ViewIdentityModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewIdentityModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewIdentityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
