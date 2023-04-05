import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateARoomComponent } from './create-a-room.component';

describe('CreateARoomComponent', () => {
  let component: CreateARoomComponent;
  let fixture: ComponentFixture<CreateARoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateARoomComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateARoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
