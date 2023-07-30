import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { BehaviorSubject, tap } from 'rxjs';

import { SignalrService } from '../service/signalr.service';

@Component({
  selector: 'app-game-message-history',
  templateUrl: './game-message-history.component.html',
  styleUrls: ['./game-message-history.component.css']
})
export class GameMessageHistoryComponent implements OnInit, OnDestroy {
  GameMessageHistory: Map<string, string[]> = new Map();

  @ViewChild('closeGameMessageHistory', {read: ElementRef}) closeGameMessageHistory?: ElementRef;

  private readonly unsubscribe$: Subject<void> = new Subject<void>();
  constructor(private singalrService: SignalrService) {

  }

  ngOnInit(): void {
    this.singalrService.GameMessageHistory.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (GameMessageHistory: Record<number, string[]>) => {
        this.GameMessageHistory = new Map(Object.entries(GameMessageHistory));
      }
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    console.log("Game message history destory");
  }

  close(): void {
    if(this.closeGameMessageHistory !== undefined) {
      this.closeGameMessageHistory.nativeElement.click();
    }
  }
}
