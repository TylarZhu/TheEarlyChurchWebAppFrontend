import { Component, Input, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { HttpsCommService } from '../service/https-comm.service';

import { IOnlineUsers } from '../interface/IOnlineUser';
import { INextStep } from '../interface/INextStep';
import { SignalrService } from '../service/signalr.service';
import { GameRoomComponent } from '../game-room/game-room.component'

import { BehaviorSubject, tap, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-players-list',
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.css']
})
export class PlayersListComponent implements OnInit, OnDestroy{

  @Input() childGroupName: string | null;
  @Input() childOnlineUser: IOnlineUsers[];
  @Input() childGroupLeader: IOnlineUsers;
  @Input() childName: string | null;
  @Input() childGameOn: boolean; 
  @Input() voteState: string;
  @Input() gameFinished: Subject<boolean> = new Subject();

  @ViewChild('waitOthersToVoteModel', {read: ElementRef}) waitOthersToVoteModel?: ElementRef;
  @ViewChild('closeWaitOthersToVoteModel', {read: ElementRef}) closePrepareToVoteModel?: ElementRef;
  
  // @ViewChild('JudasCheckingResult', {read: ElementRef}) JudasCheckingResult?: ElementRef;

  userChoosePersonName: string;
  conformToVote: boolean;
  isPriest: boolean;
  PriestName: string;
  _JohnFireRound: boolean;
  JohnCannotFireList: string[];
  JudasCheckRound: BehaviorSubject<boolean>;
  _JudasCheckRound: boolean;
  // checkResult: boolean;
  JudasHimself: string;
  playerNotInGame: IOnlineUsers[];
  _inDiscustionName: string;
  _inAnswerQuestionName: string = "";
  _JudasHintRound: boolean = false;
  JudasName: string = "";
  hintName: string = "";
  offLinePlayerName: string[] = [];

  private unsubscribe$: Subject<void> = new Subject<void>();
  
  constructor(private httpService: HttpsCommService,
      private singalrService: SignalrService,
      private gameRoomComponent: GameRoomComponent)
  {
    this.childGroupName = "";
    this.childOnlineUser = [];
    this.childGroupLeader = null!;
    this.childName = "";
    this.childGameOn = false;
    this.voteState = "";
    this.userChoosePersonName = "";
    this.conformToVote = false;
    this.playerNotInGame = [];
    this.isPriest = false;
    this.PriestName = "";
    this._JohnFireRound = false;
    this.JohnCannotFireList = [];
    this.JudasCheckRound = new BehaviorSubject<boolean>(false);
    this._JudasCheckRound = false;
    // this.checkResult = false;
    this.JudasHimself = "";
    this._inDiscustionName = "";
  }

  ngOnInit(): void {
    this.gameFinished.subscribe(
      v => {
        this.reset();
    });
    this.singalrService.finishVoteWaitForOthers.pipe(tap(
      finishVoteWaitForOthers => {
        if(finishVoteWaitForOthers) {
          if(this.waitOthersToVoteModel !== undefined) {
            this.waitOthersToVoteModel.nativeElement.click();
          } else {
            console.log("waitOthersToVoteModel is null!");
          }
        } else {
          if(this.closePrepareToVoteModel !== undefined) {
            this.closePrepareToVoteModel.nativeElement.click();
          } else {
            console.log("closePrepareToVoteModel is null!");
          }
        }
      })).subscribe();
    this.singalrService.PriestRound.pipe(takeUntil(this.unsubscribe$)).subscribe((PriestRound: boolean) => {
      this.isPriest = PriestRound;
    });
    this.singalrService.PriestName.pipe(takeUntil(this.unsubscribe$)).subscribe((PriestName: string) => {
      this.PriestName = PriestName;
    });
    this.singalrService.nextStep.pipe(tap((nextStep: INextStep) => {
      console.log("PlayerList: " + nextStep.nextStepName);
      if(nextStep.nextStepName == "JohnFireRound") {
        this.JohnCannotFireList = nextStep.options!;
      } else if(nextStep.nextStepName == "JudasCheckRound") {
        this.JudasCheckRound.next(true);
        this.JudasHimself = nextStep.options![0];
      }
    }), takeUntil(this.unsubscribe$)).subscribe();
    this.gameRoomComponent.JohnFireRound.pipe(takeUntil(this.unsubscribe$)).subscribe((JohnFireRound) => {
        this._JohnFireRound = JohnFireRound;
      }
    );
    this.JudasCheckRound.pipe(takeUntil(this.unsubscribe$)).subscribe((JudasCheckRound) => {
      this._JudasCheckRound = JudasCheckRound;
    });
    this.singalrService.playerNotInGame.pipe(takeUntil(this.unsubscribe$)).subscribe((playerNotInGame: IOnlineUsers[]) => {
      this.playerNotInGame = playerNotInGame;
    });
    this.singalrService.inDiscusstionUserName.pipe(takeUntil(this.unsubscribe$)).subscribe((inDiscusstionUserName: string) => {
      this._inDiscustionName = inDiscusstionUserName;
    });
    this.singalrService.inAnswerQuestionName.pipe(takeUntil(this.unsubscribe$)).subscribe((inAnswerQuestionName: string) => {
      this._inAnswerQuestionName = inAnswerQuestionName;
    });
    this.singalrService.JudasHintRound.pipe(takeUntil(this.unsubscribe$)).subscribe((JudasHintRound: boolean) => {
      this._JudasHintRound = JudasHintRound;
    });
    this.singalrService.JudasName.pipe(takeUntil(this.unsubscribe$)).subscribe((JudasName: string) => {
      this.JudasName = JudasName;
    });
    this.singalrService.HintName.pipe(takeUntil(this.unsubscribe$)).subscribe((HintName: string) => {
      this.hintName = HintName;
    });
    this.singalrService.offLinePlayerName.pipe(takeUntil(this.unsubscribe$)).subscribe((offLinePlayerName: string[]) => {
      this.offLinePlayerName = offLinePlayerName;
    });
  } 

  assignNewGroupLeader(nextLeader: string) {
    this.httpService.assignNextGroupLeader(this.childGroupName!, nextLeader, this.childGroupLeader.name);
  }

  exileHimOrHer(name: string, conformToExile: boolean) {
    this.userChoosePersonName = name;
    if(conformToExile) {
      this.singalrService.changePriestRoundStatus(false);
      this.singalrService.HintName.next("");
      this.httpService.aboutToExileHimOrHer(this.childGroupName!, name);
    }
  }

  checkIfCurrentPlayerIsInGameOrNot(currentName: string): boolean{
    var flag = true;
    this.playerNotInGame.forEach(player => {
      if(player.name == currentName) {
        flag = false;
      }
    });
    return flag;
  }

  fireHimOrHer(name: string, conformTofire: boolean) {
    this.userChoosePersonName = name;
    if(conformTofire) {
      this.gameRoomComponent.JohnFireRound.next(false);
      this.httpService.FireHimOrHer(this.childGroupName!, name);
    }
  }

  checkHimOrHer(name: string, conformTofire: boolean) {
    this.userChoosePersonName = name;
    if(conformTofire) {
      this.JudasCheckRound.next(false);
      this.singalrService.ROTSGetInfomation.next(false);
      this.httpService.JudasCheckRound(this.childGroupName!, name);
    }
  }

  voteHimOrHer(name: string, conformToVote: boolean){
    this.userChoosePersonName = name;
    if(conformToVote) {
      this.httpService.voteHimOrHer(this.childGroupName!, name, this.childName!);
      this.conformToVote = false;
    }
  }

  HintHimOrHer(name: string) {
    this.singalrService.JudasHintRound.next(false);
    this.httpService.JudasMeetWithPriest(this.childGroupName!, name);
  }

  ngOnDestroy(): void {
    console.log("player list Destroy!");
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  reset(): void {
    console.log("player list reset!");
    this.JudasHimself = "";
    this.JohnCannotFireList = [];
    this.userChoosePersonName = "";
    this.JudasCheckRound.next(false);
  }
}
