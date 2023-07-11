import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { SignalrService } from '../service/signalr.service'

import { Subject, takeUntil } from 'rxjs';
import { BehaviorSubject, tap } from 'rxjs';

@Component({
  selector: 'app-game-history',
  templateUrl: './game-history.component.html',
  styleUrls: ['./game-history.component.css']
})
export class GameHistoryComponent implements OnInit, OnDestroy {
  // histories: Map<string, string[]> = new Map([
  //   ["1", ["hahaha", "gagaga", "hehehe", "gagaga", "hehehe", "gagaga", "hehehe", "gagaga", "hehehe", "gagaga", "hehehe", "gagaga", "hehehe", "gagaga", "hehehe", "gagaga", "hehehe"]],
  //   ["2", ["hahaha", "gagaga", "hehehe", "gagaga", "hehehe"]],
  //   ["3", ["hahaha", "gagaga", "hehehe", "gagaga", "hehehe"]],
  //   ['4', ["hahaha", "gagaga", "hehehe", "gagaga", "hehehe"]],
  //   ['5', ["hahaha", "gagaga", "hehehe", "gagaga", "hehehe"]]
  // ]);

  @Output() cleanUpEvent = new EventEmitter<void>();

  histories: Map<string, string[]> = new Map();

  historiesLength: number[] = [];

  pageSelect: string = "1";

  private unsubscribe$: Subject<void> = new Subject<void>();
  constructor(private signalrService: SignalrService) {
    
  }

  ngOnInit(): void {
    // for(let i = 1; i <= this.histories.size; i ++) {
    //     this.historiesLength.push(i);
    // }
    this.signalrService.history.pipe(tap((history: Record<number, string[]>) => {
      for(let i = 1; i <= Object.keys(history).length; i ++) {
        this.historiesLength.push(i);
      }
    }), takeUntil(this.unsubscribe$)).subscribe((history: Record<number, string[]>) => {
      this.histories = new Map(Object.entries(history));
    }); 
  }

  ngOnDestroy(): void {
    console.log("game history Destroy");
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  callCleanUp(): void {
    this.historiesLength = [];
    this.cleanUpEvent.next();
  }
}
