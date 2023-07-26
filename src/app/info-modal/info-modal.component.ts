import { Component, OnInit, Input, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subject, takeUntil, tap } from 'rxjs';

import { INextStep } from '../interface/INextStep';
import { SignalrService } from '../service/signalr.service';
import { GameRoomComponent } from '../game-room/game-room.component';

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.css']
})
export class InfoModalComponent implements OnInit, OnDestroy {
  nightRoundFinish: boolean = false;
  identity: string = "";
  abilities: string[] = [];
  gameOn: boolean = false;

  isCollapsed: boolean = true;
  private readonly unsubscribe$: Subject<void> = new Subject<void>();

  @ViewChild('closeInfoModel', {read: ElementRef}) closeInfoModel?: ElementRef;
  constructor(private singalrService: SignalrService, private gameRoomComponent: GameRoomComponent){

  }
  ngOnInit(): void {
    this.singalrService.GameOn.pipe(takeUntil(this.unsubscribe$)).subscribe((GameOn: boolean) => {
      this.gameOn = GameOn;
    });

    this.singalrService.identity.pipe(takeUntil(this.unsubscribe$)).subscribe((identity: string) => {
      this.identity = identity;
    });
    this.singalrService.identitiesExplanation.pipe(takeUntil(this.unsubscribe$)).subscribe((identitiesExplanation: string[]) => {
      this.abilities = identitiesExplanation
    });
    this.gameRoomComponent.nightRoundFinish.pipe(takeUntil(this.unsubscribe$)).subscribe((nightRoundFinish: boolean) => {
      this.nightRoundFinish = nightRoundFinish;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    console.log("Info modal destory");
  }

  public close(): void {
    if(this.closeInfoModel !== undefined) {
      this.closeInfoModel.nativeElement.click();
    }
  }
}
