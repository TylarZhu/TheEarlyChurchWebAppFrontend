import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinARoomComponent } from './join-a-room.component';

describe('JoinARoomComponent', () => {
  let component: JoinARoomComponent;
  let fixture: ComponentFixture<JoinARoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JoinARoomComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinARoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
