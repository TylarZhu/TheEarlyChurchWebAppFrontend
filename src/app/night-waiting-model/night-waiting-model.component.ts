import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { BehaviorSubject, tap } from 'rxjs';
import { CountdownComponent, CountdownConfig, CountdownEvent } from "ngx-countdown";

import { INextStep } from '../interface/INextStep';
import { SignalrService } from '../service/signalr.service';
import { HttpsCommService } from '../service/https-comm.service';
import { GameRoomComponent } from '../game-room/game-room.component';

@Component({
  selector: 'app-night-waiting-model',
  templateUrl: './night-waiting-model.component.html',
  styleUrls: ['./night-waiting-model.component.css']
})
export class NightWaitingModelComponent implements OnInit, OnDestroy {
  @Input() _groupName: string = "";

  @Output() openAnnounceExileModelEvent = new EventEmitter<boolean>(false);

  // @ViewChild('PriestRoundCd', {static: false}) PriestRoundCd?: CountdownComponent;

  voteResult: string = "";
  day: number = 1;

  _PriestMeetingRound: boolean = false;
  PriestRound: boolean = false;
  RulerOfTheSynagogue: boolean = false;
  _ROTSGetInfomation: boolean = false;
  lastExiledPlayerName: string = "";
  _NicodemusMeetingRound: boolean = false;
  NicodemusSavingRound: boolean = false;
  _JudasHintRound: boolean = false;
  JudasCheckRound: boolean = false;
  _JohnFireRound: boolean = false;
  JudasCheckResultShow: boolean = false;
  JudasCheckResult: boolean = false;
  nightRoundFinish: boolean = false;

  ROTSName: string = "";
  NicodemusName: string = "";
  JudasName: string = "";
  PriestName: string = "";

  hintName: string = "";
  aboutToExileName: string = "";

  // config: CountdownConfig = {
  //   leftTime: 60,
  //   format: 'm:ss',
  //   demand: true
  // };

  private readonly unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private singalrService: SignalrService, 
    // private httpService: HttpsCommService, 
    private gameRoomComponent: GameRoomComponent){

  }

  ngOnInit(): void {
    this.singalrService.voteResult.pipe(takeUntil(this.unsubscribe$)).subscribe((voteResult: string) => {
      this.voteResult = voteResult;
    });
    this.singalrService.day.pipe(takeUntil(this.unsubscribe$)).subscribe((day: number) => {
      this.day = day;
    });
    this.singalrService.PriestMeetingRound.pipe(takeUntil(this.unsubscribe$)).subscribe((PriestMeetingRound: boolean) => {
      this._PriestMeetingRound = PriestMeetingRound;
    });
    this.singalrService.ROTSName.pipe(takeUntil(this.unsubscribe$)).subscribe((ROTSName: string) => {
      this.ROTSName = ROTSName;
    });
    this.singalrService.NicodemusName.pipe(takeUntil(this.unsubscribe$)).subscribe((NicodemusName: string) => {
      this.NicodemusName = NicodemusName;
    });
    this.singalrService.HintName.pipe(takeUntil(this.unsubscribe$)).subscribe((HintName: string) => {
      this.hintName = HintName;
    });
    this.singalrService.JudasName.pipe(takeUntil(this.unsubscribe$)).subscribe((JudasName: string) => {
      this.JudasName = JudasName;
    });
    this.singalrService.PriestName.pipe(takeUntil(this.unsubscribe$)).subscribe((PriestName: string) => {
      this.PriestName = PriestName;
    });

    this.singalrService.PriestRound.pipe(takeUntil(this.unsubscribe$)).subscribe((PriestRound: boolean) => {
      this.PriestRound = PriestRound;
    });
    this.singalrService.RulerOfTheSynagogue.pipe(takeUntil(this.unsubscribe$)).subscribe((RulerOfTheSynagogue: boolean) => {
      this.RulerOfTheSynagogue = RulerOfTheSynagogue;
    });
    this.singalrService.ROTSGetInfomation.pipe(takeUntil(this.unsubscribe$)).subscribe((ROTSGetInfomation: boolean) => {
      this._ROTSGetInfomation = ROTSGetInfomation;
    });
    this.singalrService.lastExiledPlayerName.pipe(takeUntil(this.unsubscribe$)).subscribe((lastExiledPlayerName: string) => {
      this.lastExiledPlayerName = lastExiledPlayerName;
    });
    this.singalrService.NicodemusMeetingRound.pipe(takeUntil(this.unsubscribe$)).subscribe((NicodemusMeetingRound: boolean) => {
      this._NicodemusMeetingRound = NicodemusMeetingRound;
    });
    this.singalrService.JudasHintRound.pipe(takeUntil(this.unsubscribe$)).subscribe((JudasHintRound: boolean) => {
      this._JudasHintRound = JudasHintRound;
    });
    this.singalrService.JudasCheckResultShow.pipe(takeUntil(this.unsubscribe$)).subscribe((JudasCheckResultShow: boolean) => {
        this.JudasCheckResultShow = JudasCheckResultShow;
    });
    this.singalrService.JudasCheckResult.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (JudasCheckResult) => {
        this.JudasCheckResult = JudasCheckResult;
      }
    );
    this.gameRoomComponent.JohnFireRound.pipe(takeUntil(this.unsubscribe$)).subscribe((JohnFireRound: boolean) => {
      this._JohnFireRound = JohnFireRound;
    });

    this.singalrService.GameOn.pipe(tap((GameOn: boolean) => {
      if(!GameOn) {
        this.cleanUp();
      }
    }), takeUntil(this.unsubscribe$)).subscribe();
    this.singalrService.nextStep.pipe(tap(
      (nextStep: INextStep) => {
        if(nextStep.nextStepName == "NicodemusSavingRound") {
          this.aboutToExileName = nextStep.options![0];
          this.NicodemusSavingRound = true; 
        } else if(nextStep.nextStepName == "JudasCheckRound") {
          this.JudasCheckRound = true;
        } else if(nextStep.nextStepName == "quitNightWaiting") {
          this.nightRoundFinish = true;
        }
      }
    ), takeUntil(this.unsubscribe$)).subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    console.log("nightWaitingModel destory");
  }

  PriestRoundCdEvent(e: CountdownEvent): void {
    if(e.action === 'done') {
      // if(this.PriestRoundCd !== undefined) {
      //   this.PriestRoundCd.restart();
      // }
      this.singalrService.hubConnection.invoke("PriestRound", this._groupName, true);
    }
  } 

  NicodemusAction(action: boolean): void {
    this.NicodemusSavingRound = false;
    this.singalrService.hubConnection.invoke("NicodemusAction", this._groupName, action);
    // this.httpService.NicodemusAction(this._groupName, action);
  }
  DoNotFire(): void {
    this.gameRoomComponent.JohnFireRound.next(false);
    this.singalrService.hubConnection.invoke("JohnFireRoundBegin", this._groupName, "NULL", true)
    // this.httpService.FireHimOrHer(this._groupName, "NULL");
  }
  NightRoundEnd(): void {
    this.JudasCheckRound = false;
    this.singalrService.JudasCheckResultShow.next(false);
    this.singalrService.hubConnection.invoke("NightRoundEnd", this._groupName);
    // this.httpService.NightRoundEnd(this._groupName);
  }
  goToAnnounceExileModel(): void {
    this.nightRoundFinish = false;
    this.openAnnounceExileModelEvent.next(true);
  }

  cleanUp(): void {
    this.nightRoundFinish = false;
    console.log("nightWaitingModel reset.");
    this.aboutToExileName = "";
  }
}
