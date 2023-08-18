import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { BehaviorSubject, tap } from 'rxjs';
import { CountdownComponent, CountdownConfig, CountdownEvent } from "ngx-countdown";

import { HttpsCommService } from '../service/https-comm.service';
import { IOnlineUsers } from '../interface/IOnlineUser';
import { SignalrService } from '../service/signalr.service';
import { IMessage } from '../interface/IMessage';
import { INextStep } from '../interface/INextStep';
import { IQuestions } from '../interface/IQuestions';
import { InfoModalComponent } from '../info-modal/info-modal.component';
import { GameMessageHistoryComponent } from '../game-message-history/game-message-history.component';
import { ViewIdentityModalComponent } from '../view-identity-modal/view-identity-modal.component';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css']
})
export class GameRoomComponent implements OnInit, OnDestroy, AfterViewInit  {

  @ViewChild('viewMyIdentity', {read: ElementRef}) identityModal?: ElementRef;
  @ViewChild('viewIdentityModalApp') viewIdentityModalApp?: ViewIdentityModalComponent;

  @ViewChild('waitingForOtherPlayers', {read: ElementRef}) waitingForOtherPlayersModal?: ElementRef;
  @ViewChild('closeWaitingForOtherPlayers', {read: ElementRef}) closeWaitingForOtherPlayers?: ElementRef;

  @ViewChild('discussionModel', {read: ElementRef}) discussionModel?: ElementRef;

  @ViewChild('prepareToVoteModel', {read: ElementRef}) prepareToVoteModel?: ElementRef;
  @ViewChild('closePrepareToVoteModel', {read: ElementRef}) closePrepareToVoteModel?: ElementRef;

  @ViewChild('winningModel', {read: ElementRef}) winningModel?: ElementRef;

  @ViewChild('nightWaitingModel', {read: ElementRef}) nightWaitingModel?: ElementRef;

  @ViewChild('AnnounceExileModel', {read: ElementRef}) AnnounceExileModel?: ElementRef;

  @ViewChild('SpiritualFormationQuestion', {read: ElementRef}) SpiritualFormationQuestion?: ElementRef;

  @ViewChild('gameHistory', {read: ElementRef}) gameHistory?: ElementRef;

  @ViewChild('waitingForOtherPlayersToViewExileResult', {read: ElementRef}) waitingForOtherPlayersToViewExileResultModal?: ElementRef;
  @ViewChild('closewaitingForOtherPlayersToViewExileResult', {read: ElementRef}) closewaitingForOtherPlayersToViewExileResultModal?: ElementRef;

  @ViewChild('closeBackToMenuModel', {read: ElementRef}) closeBackToMenuModel?: ElementRef;
  @ViewChild('infoModal') infoModal?: InfoModalComponent;

  @ViewChild('GameMessageHistoryComponent') closeGameMessageHistory?: GameMessageHistoryComponent;

  @ViewChild('voteCd', { static: false }) private voteCd?: CountdownComponent;

  @ViewChild('AnnounceExileModelCd', {static: false}) private AnnounceExileModelCd?: CountdownComponent;
  @ViewChild('closeAnnounceExileModel', {read: ElementRef}) closeAnnounceExileModel?: ElementRef;

  onlineUser: IOnlineUsers[];
  messages: IMessage[];
  groupName: BehaviorSubject<string> = new BehaviorSubject<string>("");
  _groupName: string = "";
  name: BehaviorSubject<string> = new BehaviorSubject<string>("");
  _name: string = "";

  groupLeader: IOnlineUsers;
  gameOn: boolean;
  MaxPlayer: number;
  startGameShow: boolean;
  day: number;
  nextStep: INextStep;
  discussionTopic: string;
  playerNotInGame: IOnlineUsers[];
  exileName: string;
  hideShowButtonForDisscussion: string = "";
  stillInActionPlayers: IOnlineUsers[] = [];
  _nightWaitModalShowFlag: boolean = false;

  winner: number = -1;
  nightRoundFinish: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  _nightRoundFinish: boolean = false;
  JohnFireRound:  BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  waitingProgessPercentage: number = 0.0;
  isCollapsed: boolean = true;
  
  startReconnection: boolean = false;

  config: CountdownConfig = {
    leftTime: 60,
    format: 'm:ss',
    demand: true
  };

  private readonly unsubscribe$: Subject<void> = new Subject<void>();
  
  constructor(
    private httpService: HttpsCommService, 
    private route: ActivatedRoute,
    private singalrService: SignalrService,
    private router: Router)
  {
    let groupNameTemp = this.route.snapshot.paramMap.get('groupName');
    if(groupNameTemp !== null) {
      this.groupName.next(groupNameTemp);
    }

    let nameTemp = this.route.snapshot.paramMap.get('name');
    if(nameTemp !== null) {
      this.name.next(nameTemp);
    }

    this.onlineUser = [];
    this.MaxPlayer = 0;
    this.messages = [];
    this.groupLeader = null!;
    this.gameOn = false;
    this.startGameShow = false;
    this.day = 1;
    this.nextStep = null!;
    this.discussionTopic = "";
    this.playerNotInGame = [];
    this.exileName = "";
  }

  ngOnInit(): void {
    this.groupName.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (groupName: string) => {
        this._groupName = groupName;
    });
    this.name.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (name: string) => {
        this._name = name;
    });
    this.singalrService.onlineUser.pipe(tap((onlineUser: IOnlineUsers[]) => {
      if(this.MaxPlayer > 0 && this.MaxPlayer == onlineUser.length){
        this.startGameShow = true;
      } else {
        this.startGameShow = false;
      }
    }), takeUntil(this.unsubscribe$)).subscribe((onlineUser: IOnlineUsers[]) => {
      this.onlineUser = onlineUser;
    });
    this.singalrService.messagesToAll.pipe(takeUntil(this.unsubscribe$)).subscribe((messages: IMessage[]) => {
      this.messages = messages;
    });
    this.singalrService.groupLeader.pipe(takeUntil(this.unsubscribe$)).subscribe((groupLeader: IOnlineUsers) =>{
      this.groupLeader = groupLeader;
    });
    this.singalrService.nextStep.pipe(tap(
      nextStep => {
        this.prepareNextStep(nextStep);
      }
    ), takeUntil(this.unsubscribe$)).subscribe((nextStep: INextStep) => {
      this.nextStep = nextStep;
    });

    this.singalrService.maxPlayer.pipe(takeUntil(this.unsubscribe$)).subscribe((maxPlayer: number) => {
        this.MaxPlayer = maxPlayer;
      }
    );

    this.singalrService.finishDisscussion.pipe(tap(
        (finishDisscussion: string) => {
          if(finishDisscussion == "InDisscussion"){
            this.closeBackToMenuModalAndInfoModal();
            if(this.discussionModel !== undefined) {
              this.discussionModel.nativeElement.click();
            }
          }
      }), takeUntil(this.unsubscribe$)).subscribe(
        (finishDisscussion: string) => {
          this.hideShowButtonForDisscussion = finishDisscussion;
      });

    
    this.singalrService.finishedViewIdentityOrNot.pipe(tap(
      (finishedViewIdentityOrNot: boolean) => {
        if(finishedViewIdentityOrNot) {
          if(this.waitingForOtherPlayersModal !== undefined) {
            this.waitingForOtherPlayersModal.nativeElement.click();
          }
        } else {
          if(this.closeWaitingForOtherPlayers !== undefined) {
            this.closeWaitingForOtherPlayers.nativeElement.click();
          }
        }
      }), takeUntil(this.unsubscribe$)).subscribe();

    this.singalrService.playerNotInGame.pipe(takeUntil(this.unsubscribe$)).subscribe((playerNotInGame: IOnlineUsers[]) => {
      this.playerNotInGame = playerNotInGame;
    });
    this.singalrService.GameOn.pipe(tap((GameOn: boolean) => {
      if(GameOn) {
        // need to close other modal before open another modal!
        this.closeBackToMenuModalAndInfoModal();
        
    }}), takeUntil(this.unsubscribe$)).subscribe((GameOn: boolean) => {
      this.gameOn = GameOn;
    });
    this.singalrService.openIdentitiesExplanationModal.pipe(tap((openIdentitiesExplanationModal: boolean) => {
      if(openIdentitiesExplanationModal) {
        if(this.identityModal !== undefined) 
          this.identityModal.nativeElement.click();
          if(this.viewIdentityModalApp !== undefined) {
            this.viewIdentityModalApp.startCd();
          } else {
            console.log("viewIdentityModalApp is undefined!");
          }
        }
      }
    ), takeUntil(this.unsubscribe$)).subscribe();

    // assign priest and ROTS on the first night.
    this.singalrService.PriestRound.pipe(tap(
      // if Priest finish exilting, then send to waiting stat.
      (PriestRound: boolean) => {
        if(!PriestRound) {
          if(this.nightWaitingModel !== undefined) {
            this.nightWaitingModel.nativeElement.click();
          }
        }
    }), takeUntil(this.unsubscribe$)).subscribe();

    this.singalrService.exileName.pipe(takeUntil(this.unsubscribe$)).subscribe((exileName: string) => {
      this.exileName = exileName;
    });

    this.singalrService.day.pipe(takeUntil(this.unsubscribe$)).subscribe((day: number) => {
      this.day = day;
    });
    this.singalrService.question.pipe(tap((question: IQuestions) => {
      if(question.Id != "") {
        this.closeBackToMenuModalAndInfoModal();
        if(this.SpiritualFormationQuestion !== undefined) {
          this.SpiritualFormationQuestion.nativeElement.click();
        }
      }
    }), takeUntil(this.unsubscribe$)).subscribe();
    this.singalrService.winner.pipe(tap((winner: number) => {
      if(winner != -1) {
        this.closeBackToMenuModalAndInfoModal();
        if(this.winningModel !== undefined) {
          this.winningModel.nativeElement.click();
        }
      }
    }), takeUntil(this.unsubscribe$)).subscribe((winner: number) =>{
      this.winner = winner;
    });
    this.singalrService.openOrCloseExileResultModal.pipe(tap((openOrCloseExileResultModal: boolean) => {
      if(openOrCloseExileResultModal) {
        if(this.waitingForOtherPlayersToViewExileResultModal !== undefined){
          this.waitingForOtherPlayersToViewExileResultModal.nativeElement.click();
        }
      } else {
        if(this.closewaitingForOtherPlayersToViewExileResultModal !== undefined){
          this.closewaitingForOtherPlayersToViewExileResultModal.nativeElement.click();
        }
      }
    }), takeUntil(this.unsubscribe$)).subscribe();
    this.singalrService.stillInActionPlayers.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (stillInActionPlayers: IOnlineUsers[]) => {
        this.stillInActionPlayers = stillInActionPlayers;
      }
    );
    this.nightRoundFinish.pipe(takeUntil(this.unsubscribe$)).subscribe((nightRoundFinish: boolean) => {
      this._nightRoundFinish = nightRoundFinish;
    });
    this.singalrService.waitingProgessPercentage.pipe(takeUntil(this.unsubscribe$)).subscribe((waitingProgessPercentage: number) => {
      this.waitingProgessPercentage = waitingProgessPercentage;
    });

    // when user disconnect and try to reconnect to the server.
    this.singalrService.startReconnection.pipe(takeUntil(this.unsubscribe$)).subscribe((startReconnection: boolean) => {
      this.startReconnection = startReconnection;
    });
  }

  async ngAfterViewInit() {
    await this.singalrService.hubConnection.invoke("reconnectionToGame", this._groupName, this._name);
  }

  

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    console.log("Game room destory");
  }

  prepareNextStep(nextStep: INextStep): void{
    if(nextStep.nextStepName == "discussing")
    {
      if(nextStep.options == undefined)
      {
        this.discussionTopic = "Freely Disscuss";
      } else {
        this.discussionTopic = nextStep.options![0];
      }
    } else if(nextStep.nextStepName == "vote") {
      this.closeBackToMenuModalAndInfoModal();
      if(this.prepareToVoteModel !== undefined) {
        this.prepareToVoteModel.nativeElement.click();
      }
      setTimeout(() => {
        if(this.closePrepareToVoteModel !== undefined) {
          this.closePrepareToVoteModel.nativeElement.click();
        } else {
          console.log("closePrepareToVoteModel is null!");
        }
        if(this.voteCd !== undefined) {
          this.voteCd.begin();
        }
      }, 3000);
    } else if(nextStep.nextStepName == "SetUserToNightWaiting") {
      this._nightWaitModalShowFlag = true;
      this.closeBackToMenuModalAndInfoModal();
      if(this.nightWaitingModel !== undefined) {
        this.nightWaitingModel.nativeElement.click();
      } else {
        console.log("nightWaitingModel is null!");
      }
    } else if(nextStep.nextStepName == "quitNightWaiting") {
      this.nightRoundFinish.next(true);
    }
  }
  
  // return true, if player is still in game. Otherwise not.
  checkIfCurrentPlayerIsInGameOrNot(currentName: string): boolean{
    var flag = true;
    this.playerNotInGame.forEach(player => {
      if(player.name == currentName) {
        flag = false;
      }
    });
    return flag;
  }

  async gameStart(): Promise<void> {
    let half = this.onlineUser.length / 2;
    this.httpService.CreateAGame(this._groupName);
  }

  finishedDiscussion() {
    this.hideShowButtonForDisscussion = "";
    this.singalrService.hubConnection.invoke("whoIsDiscussing", this._groupName);
    // this.httpService.whoIsDiscussing(this._groupName);
  }

  voteCountdownEvent(e: CountdownEvent): void {
    if(e.action === 'done') {
      if(this.voteCd !== undefined) {
        this.voteCd.restart();
      }
      this.closeBackToMenuModalAndInfoModal();
      this.singalrService.hubConnection.invoke("voteHimOrHer", this._groupName!, this._name, this._name);
    }
  }

  voteStopCountdown(): void {
    console.log("voteStopCountdown called");
    if(this.voteCd !== undefined) {
      this.voteCd.restart();
    }
  }

  async userLeavesGroup(){
    await this.singalrService.hubConnection.invoke("leaveGroup", this._groupName, this._name);
    // this.httpService.userLeaveTheGame(this._groupName, this._name, false);
    this.router.navigate(['/']);
  }

  goToGameHistoryModal(): void{
    if(this.gameHistory !== undefined) {
      this.gameHistory.nativeElement.click();
    } else {
      console.log("gameHistory modal is undefined!");
    }
  }

  openAnnounceExileModel(): void {
    this.nightRoundFinish.next(false);
    if(this.AnnounceExileModel !== undefined) {
      this.AnnounceExileModel.nativeElement.click();
      if(this.AnnounceExileModelCd !== undefined) {
        this.AnnounceExileModelCd.begin();
      }
    }
  }

  AnnounceExileModelCdEvent(e: CountdownEvent): void {
    if(e.action === 'done') {
      if(this.AnnounceExileModelCd !== undefined) {
        this.AnnounceExileModelCd.restart();
      }
      if(this.closeAnnounceExileModel !== undefined) {
        this.closeAnnounceExileModel.nativeElement.click();
      }
      if(this.checkIfCurrentPlayerIsInGameOrNot(this._name)) {
        this.finishedToViewTheExileResult();
      } else {
        this.SetNightWaitModalShowFlagToFalse();
      }
    }
  }

  finishedToViewTheExileResult() {
    if(this.AnnounceExileModelCd !== undefined) {
      this.AnnounceExileModelCd.restart();
    }
    this._nightWaitModalShowFlag = false;
    this.singalrService.hubConnection.invoke("finishedToViewTheExileResult", this._groupName, this._name);
    // this.httpService.finishedToViewTheExileResult(this._groupName, this._name);
  }

  SetNightWaitModalShowFlagToFalse(): void {
    if(this.AnnounceExileModelCd !== undefined) {
      this.AnnounceExileModelCd.restart();
    }
    this._nightWaitModalShowFlag = false;
  }

  closeBackToMenuModalAndInfoModal(): void{
    if(this.closeBackToMenuModel !== undefined) {
      this.closeBackToMenuModel.nativeElement.click();
    }
    if(this.infoModal !== undefined) {
      this.infoModal.close();
    }
    if(this.closeGameMessageHistory !== undefined) {
      this.closeGameMessageHistory.close();
    }
  }

  cleanUp() {
    console.log("Game Romm reset!");
    this.singalrService.reset();
    // this.gameFinished.next(true);
    this._nightWaitModalShowFlag = false;
    this.discussionTopic = "";
    this.nightRoundFinish.next(false);
  }
}