import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameMessageHistoryComponent } from './game-message-history.component';

describe('GameMessageHistoryComponent', () => {
  let component: GameMessageHistoryComponent;
  let fixture: ComponentFixture<GameMessageHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameMessageHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameMessageHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
