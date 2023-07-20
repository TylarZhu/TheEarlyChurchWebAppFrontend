import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { BehaviorSubject, tap } from 'rxjs';

import { HttpsCommService } from '../service/https-comm.service';
import { IOnlineUsers } from '../interface/IOnlineUser';
import { SignalrService } from '../service/signalr.service';
import { IMessage } from '../interface/IMessage';
import { INextStep } from '../interface/INextStep';
import { IQuestions } from '../interface/IQuestions';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css']
})
export class GameRoomComponent implements OnInit, OnDestroy, AfterViewInit  {

  @ViewChild('viewMyIdentity', {read: ElementRef}) identityModal?: ElementRef;

  @ViewChild('waitingForOtherPlayers', {read: ElementRef}) waitingForOtherPlayersModal?: ElementRef;
  @ViewChild('closeWaitingForOtherPlayers', {read: ElementRef}) closeWaitingForOtherPlayers?: ElementRef;

  @ViewChild('discussionModel', {read: ElementRef}) discussionModel?: ElementRef;

  @ViewChild('prepareToVoteModel', {read: ElementRef}) prepareToVoteModel?: ElementRef;
  @ViewChild('closePrepareToVoteModel', {read: ElementRef}) closePrepareToVoteModel?: ElementRef;

  @ViewChild('winningModel', {read: ElementRef}) winningModel?: ElementRef;

  @ViewChild('nightWaitingModel', {read: ElementRef}) nightWaitingModel?: ElementRef;
  // @ViewChild('closeNightWaitingModel', {read: ElementRef}) closeNightWaitingModel?: ElementRef;

  @ViewChild('AnnounceExileModel', {read: ElementRef}) AnnounceExileModel?: ElementRef;

  @ViewChild('SpiritualFormationQuestion', {read: ElementRef}) SpiritualFormationQuestion?: ElementRef;

  @ViewChild('gameHistory', {read: ElementRef}) gameHistory?: ElementRef;

  @ViewChild('waitingForOtherPlayersToViewExileResult', {read: ElementRef}) waitingForOtherPlayersToViewExileResultModal?: ElementRef;
  @ViewChild('closewaitingForOtherPlayersToViewExileResult', {read: ElementRef}) closewaitingForOtherPlayersToViewExileResultModal?: ElementRef;

  @ViewChild('closeBackToMenuModel', {read: ElementRef}) closeBackToMenuModel?: ElementRef;
  @ViewChild('closeInfoModel', {read: ElementRef}) closeInfoModel?: ElementRef;

  onlineUser: IOnlineUsers[];
  messages: IMessage[];
  groupName: BehaviorSubject<string> = new BehaviorSubject<string>("");
  _groupName: string = "";
  name: BehaviorSubject<string> = new BehaviorSubject<string>("");
  _name: string = "";

  groupLeader: IOnlineUsers;
  gameOn: boolean;
  MaxPlayer: number;
  identity: string;
  startGameShow: boolean;
  abilities: string[];
  day: number;
  nextStep: INextStep;
  discussionTopic: string;
  playerNotInGame: IOnlineUsers[];
  voteResult: string;
  PriestRound: boolean;
  RulerOfTheSynagogue: boolean;
  // inDiscustion: BehaviorSubject<boolean>;
  aboutToExileName: string;
  exileName: string;
  ROTSName: string;
  NicodemusName: string;
  PriestName: string;
  hideShowButtonForDisscussion: string = "";
  stillInActionPlayers: IOnlineUsers[] = [];

  // Special gamer property
  NicodemusSavingRound: BehaviorSubject<boolean>;
  _NicodemusSavingRound: boolean;
  
  _NicodemusMeetingRound: boolean;

  JohnFireRound: BehaviorSubject<boolean>;
  _JohnFireRound: boolean;

  JudasCheckRound: BehaviorSubject<boolean>;
  _JudasCheckRound: boolean;
  
  _PriestMeetingRound: boolean;

  // DOM Property
  backupIdentityClosingButton: BehaviorSubject<boolean>;
  _backupIdentityClosingButton: boolean;
  nightWaitModalShowFlag: BehaviorSubject<boolean>;
  _nightWaitModalShowFlag: boolean;

  // playerChoice: string = "";
  // playerChoiceCorrect: boolean = false;
  // playerFinishChoice: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // _playerFinishChoice: boolean = false;

  JudasCheckResult: boolean = false;
  JudasCheckResultShow: boolean = false;

  // ACorrect: boolean = false;
  // BCorrect: boolean = false;
  // CCorrect: boolean = false;
  // DCorrect: boolean = false;
  // AWrong: boolean = false;
  // BWrong: boolean = false;
  // CWrong: boolean = false;
  // DWrong: boolean = false;


  // SpiritualQuestion: IQuestions = {
  //   Id: "",
  //   question: {
  //     Q: "",
  //     A: "",
  //     B: "",
  //     C: "",
  //     D: "",
  //     An: "",
  //     Ex: undefined
  //   }
  // };
  
  _JudasHintRound: boolean = false;
  JudasName: string = "";
  hintName: string = "";
  _ROTSGetInfomation:boolean = false;
  lastExiledPlayerName: string = "";
  winner: number = -1;
  nightRoundFinish: boolean = false;
  
  

  private readonly unsubscribe$: Subject<void> = new Subject<void>();
  gameFinished: Subject<boolean> = new Subject();
  
  constructor(private httpService: HttpsCommService, 
    private route: ActivatedRoute,
    private singalrService: SignalrService,
    private router: Router){
      let groupNameTemp = this.route.snapshot.paramMap.get('groupName');
      if(groupNameTemp !== null) {
        this.groupName.next(groupNameTemp);
      }

      let nameTemp = this.route.snapshot.paramMap.get('name');
      if(nameTemp !== null) {
        this.name.next(nameTemp);
      }

      this.onlineUser = [];
      // this.groupName = this.route.snapshot.paramMap.get('groupName');
      // this.name = this.route.snapshot.paramMap.get('name');
      this.MaxPlayer = 0;
      this.messages = [];
      this.groupLeader = null!;
      this.gameOn = false;
      this.identity = "";
      this.startGameShow = false;
      this.abilities = [];
      this.day = 1;
      this.nextStep = null!;
      this.discussionTopic = "";
      this.playerNotInGame = [];
      this.PriestRound = false;
      this.RulerOfTheSynagogue = false;
      this.voteResult = "";
      this.NicodemusSavingRound = new BehaviorSubject<boolean>(false);
      this._NicodemusSavingRound = false;
      this.aboutToExileName = "";
      this.exileName = "";
      this.JohnFireRound = new BehaviorSubject<boolean>(false);
      this._JohnFireRound = false;
      this.JudasCheckRound = new BehaviorSubject<boolean>(false);
      this._JudasCheckRound = false;
      this.backupIdentityClosingButton = new BehaviorSubject<boolean>(false);
      this._backupIdentityClosingButton = false;
      this.nightWaitModalShowFlag = new BehaviorSubject<boolean>(false);
      this._nightWaitModalShowFlag = false;
      this.ROTSName = "";
      this.NicodemusName = "";
      this.PriestName = "";
      this._NicodemusMeetingRound = false;
      this._PriestMeetingRound = false;
  }

  ngOnInit(): void {
    // this.singalrService.hubConnection.invoke("onConntionAndCreateGroup",this.form.value)
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
    this.singalrService.identitiesExplanation.pipe(takeUntil(this.unsubscribe$))
    .subscribe((identitiesExplanation: string[]) => {
      this.abilities = identitiesExplanation
    });
    this.singalrService.openIdentitiesExplanationModal.pipe(tap((openIdentitiesExplanationModal: boolean) => {
      if(this.gameOn && openIdentitiesExplanationModal) {
        // need to close other modal before open another modal!
        this.closeBackToMenuModalAndInfoModal();
        if(this.identityModal !== undefined) 
          this.identityModal.nativeElement.click();
      }
    }), takeUntil(this.unsubscribe$)).subscribe();
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
      finishedViewIdentityOrNot => {
        if(finishedViewIdentityOrNot)
        {
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
    this.singalrService.GameOn.pipe(takeUntil(this.unsubscribe$)).subscribe((GameOn: boolean) => {
      this.gameOn = GameOn;
    });
    this.singalrService.identity.pipe(takeUntil(this.unsubscribe$)).subscribe((identity: string) => {
      this.identity = identity;
    });
    this.singalrService.voteResult.pipe(takeUntil(this.unsubscribe$)).subscribe((voteResult: string) => {
      this.voteResult = voteResult;
    });

    // assign priest and ROTS on the first night.
    this.singalrService.PriestRound.pipe(tap(
      // if Priest finish exilting, then send to waiting stat.
      (PriestRound: boolean) => {
        if(!PriestRound) {
          if(this.nightWaitingModel !== undefined) {
            this.nightWaitingModel.nativeElement.click();
          }
        }
    }), takeUntil(this.unsubscribe$)).subscribe((PriestRound: boolean) => {
      this.PriestRound = PriestRound;
    });
    this.singalrService.RulerOfTheSynagogue.pipe(takeUntil(this.unsubscribe$)).subscribe((RulerOfTheSynagogue: boolean) => {
      this.RulerOfTheSynagogue = RulerOfTheSynagogue;
    });

    // this.backupClosingButton.subscribe((backupClosingButton) => {
    //   this._backupClosingButton = backupClosingButton;
    // });
    this.NicodemusSavingRound.pipe(takeUntil(this.unsubscribe$)).subscribe((NicodemusSavingRound) => {
      this._NicodemusSavingRound = NicodemusSavingRound;
    });
    this.JohnFireRound.pipe(takeUntil(this.unsubscribe$)).subscribe((JohnFireRound) => {
      this._JohnFireRound = JohnFireRound;
    });
    this.JudasCheckRound.pipe(takeUntil(this.unsubscribe$)).subscribe((JudasCheckRound) => {
      this._JudasCheckRound = JudasCheckRound;
    });
    this.singalrService.exileName.pipe(takeUntil(this.unsubscribe$)).subscribe((exileName: string) => {
      this.exileName = exileName;
    });

    this.backupIdentityClosingButton. pipe(takeUntil(this.unsubscribe$)).subscribe((backupIdentityClosingButton: boolean) => {
      this._backupIdentityClosingButton = backupIdentityClosingButton
    });
    this.nightWaitModalShowFlag.pipe(takeUntil(this.unsubscribe$)).subscribe((nightWaitModalShowFlag: boolean) => {
      this._nightWaitModalShowFlag = nightWaitModalShowFlag;
    });
    this.singalrService.PriestName.pipe(takeUntil(this.unsubscribe$)).subscribe((PriestName: string) => {
      this.PriestName = PriestName;
    });
    this.singalrService.ROTSName.pipe(takeUntil(this.unsubscribe$)).subscribe((ROTSName: string) => {
      this.ROTSName = ROTSName;
    });
    this.singalrService.NicodemusName.pipe(takeUntil(this.unsubscribe$)).subscribe((NicodemusName: string) => {
      this.NicodemusName = NicodemusName;
    });
    this.singalrService.PriestMeetingRound.pipe(takeUntil(this.unsubscribe$)).subscribe((PriestMeetingRound: boolean) => {
      this._PriestMeetingRound = PriestMeetingRound;
    });
    this.singalrService.NicodemusMeetingRound.pipe(takeUntil(this.unsubscribe$)).subscribe((NicodemusMeetingRound: boolean) => {
      this._NicodemusMeetingRound = NicodemusMeetingRound;
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
    }), takeUntil(this.unsubscribe$)).subscribe(
    //   (question: IQuestions) => {
    //   this.SpiritualQuestion = question;
    // }
    );
    // this.playerFinishChoice.pipe(takeUntil(this.unsubscribe$)).subscribe((playerFinishChoice: boolean) => {
    //   this._playerFinishChoice = playerFinishChoice;
    // });
    this.singalrService.JudasHintRound.pipe(takeUntil(this.unsubscribe$)).subscribe((JudasHintRound: boolean) => {
      this._JudasHintRound = JudasHintRound;
    });
    this.singalrService.JudasName.pipe(takeUntil(this.unsubscribe$)).subscribe((JudasName: string) => {
      this.JudasName = JudasName;
    });
    this.singalrService.HintName.pipe(takeUntil(this.unsubscribe$)).subscribe((HintName: string) => {
      this.hintName = HintName;
    });
    this.singalrService.ROTSGetInfomation.pipe(takeUntil(this.unsubscribe$))
    .subscribe((ROTSGetInfomation: boolean) => {
      this._ROTSGetInfomation = ROTSGetInfomation;
    });
    this.singalrService.lastExiledPlayerName.pipe(takeUntil(this.unsubscribe$))
    .subscribe((lastExiledPlayerName: string) => {
      this.lastExiledPlayerName = lastExiledPlayerName;
    });
    this.singalrService.winner.pipe(takeUntil(this.unsubscribe$))
    .pipe(tap((winner: number) => {
      if(winner != -1) {
        if(this.winningModel !== undefined) {
          this.winningModel.nativeElement.click();
        }
      }
    })).subscribe((winner: number) =>{
      this.winner = winner;
    });
    this.singalrService.JudasCheckResult.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (JudasCheckResult) => {
        this.JudasCheckResult = JudasCheckResult;
      }
    );
    this.singalrService.JudasCheckResultShow.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (JudasCheckResultShow: boolean) => {
        this.JudasCheckResultShow = JudasCheckResultShow;
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
      this.backupIdentityClosingButton.next(false);
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
      }, 3000);
    } else if(nextStep.nextStepName == "SetUserToNightWaiting") {
      this.nightWaitModalShowFlag.next(true);
      this.closeBackToMenuModalAndInfoModal();
      if(this.nightWaitingModel !== undefined) {
        this.nightWaitingModel.nativeElement.click();
      } else {
        console.log("nightWaitingModel is null!");
      }
    } else if(nextStep.nextStepName == "NicodemusSavingRound") {
      this.aboutToExileName = nextStep.options![0];
      this.NicodemusSavingRound.next(true); 
    } else if(nextStep.nextStepName == "JohnFireRound") {
      this.JohnFireRound.next(true);
    } else if(nextStep.nextStepName == "JudasCheckRound") {
      this.JudasCheckRound.next(true);
    } else if(nextStep.nextStepName == "quitNightWaiting") {
      this.nightRoundFinish = true;
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

  NicodemusAction(action: boolean) 
  {
    this.NicodemusSavingRound.next(false);
    this.httpService.NicodemusAction(this._groupName, action);
  }

  DoNotFire()
  {
    this.JohnFireRound.next(false);
    this.httpService.FireHimOrHer(this._groupName, "NULL");
  }

  // BeginToCheck() {
  //   this.JudasCheckRound.next(false);
  // }

  finishedToViewTheExileResult() {
    this.nightRoundFinish = false;
    this.nightWaitModalShowFlag.next(false);
    this.httpService.finishedToViewTheExileResult(this._groupName, this._name);
  }

  async gameStart(): Promise<void> {
    let half = this.onlineUser.length / 2;
    this.httpService.CreateAGame(this._groupName);
  }

  finishedDiscussion() {
    // this.inDiscustion.next(false);
    this.hideShowButtonForDisscussion = "";
    this.httpService.whoIsDiscussing(this._groupName);
  }

  findViewIdentityReadyToPlay(): void {
    this.httpService.IdentityViewingState(this._groupName, this._name);
  }

  async userLeavesGroup(){
    await this.singalrService.hubConnection.invoke("leaveGroup", this._groupName, this._name);
    // this.httpService.userLeaveTheGame(this._groupName, this._name, false);
    this.router.navigate(['/']);
  }
  // conformAnswer() {
  //   this.playerFinishChoice.next(true);
  //   if(this.playerChoice == this.SpiritualQuestion.question.An) {
  //     this.playerChoiceCorrect = true;
  //     switch(this.playerChoice) {
  //       case 'A':
  //         this.ACorrect = true;
  //         break;
  //       case 'B':
  //         this.BCorrect = true;
  //         break;
  //       case 'C':
  //         this.CCorrect = true;
  //         break;
  //       case 'D':
  //         this.DCorrect = true;
  //         break;
  //     }
  //   } else {
  //     this.playerChoiceCorrect = false;
  //     switch(this.SpiritualQuestion.question.An) {
  //       case 'A':
  //         this.ACorrect = true;
  //         break;
  //       case 'B':
  //         this.BCorrect = true;
  //         break;
  //       case 'C':
  //         this.CCorrect = true;
  //         break;
  //       case 'D':
  //         this.DCorrect = true;
  //         break;
  //     }
  //     switch(this.playerChoice) {
  //       case 'A':
  //         this.AWrong = true;
  //         break;
  //       case 'B':
  //         this.BWrong = true;
  //         break;
  //       case 'C':
  //         this.CWrong = true;
  //         break;
  //       case 'D':
  //         this.DWrong = true;
  //         break;
  //     }
  //   }
  // }

  // increaseWeightOrNot() {
  //   this.ACorrect = false;
  //   this.BCorrect = false;
  //   this.CCorrect = false;
  //   this.DCorrect = false;
  //   this.AWrong = false;
  //   this.BWrong = false;
  //   this.CWrong = false;
  //   this.DWrong = false;
  //   this.playerFinishChoice.next(false);
  //   const initQuesiont = {
  //     Id: "",
  //     question: {
  //       Q: "",
  //       A: "",
  //       B: "",
  //       C: "",
  //       D: "",
  //       An: "",
  //       Ex: undefined
  //     }
  //   }
  //   this.singalrService.question.next(initQuesiont);
  //   this.httpService.spiritualQuestionAnsweredCorrectOrNot(this._groupName, this._name!, this.playerChoiceCorrect);
  //   this.playerChoice = "";
  //   this.playerChoiceCorrect = false;
  // }

  goToGameHistoryModal(): void{
    if(this.gameHistory !== undefined) {
      this.gameHistory.nativeElement.click();
    } else {
      console.log("gameHistory modal is undefined!");
    }
  }

  goToAnnounceExileModel(): void {
    // this.nightRoundFinish = false;
    if(this.AnnounceExileModel !== undefined) {
      this.AnnounceExileModel.nativeElement.click();
    }
  }

  NightRoundEnd(): void {
    this.JudasCheckRound.next(false);
    this.singalrService.JudasCheckResultShow.next(false);
    this.httpService.NightRoundEnd(this._groupName);
  }

  closeBackToMenuModalAndInfoModal(): void{
    if(this.closeBackToMenuModel !== undefined) {
      this.closeBackToMenuModel.nativeElement.click();
    }
    if(this.closeInfoModel !== undefined) {
      this.closeInfoModel.nativeElement.click();
    }
  }

  SetNightWaitModalShowFlagToFalse(): void {
    this.nightWaitModalShowFlag.next(false);
    this.nightRoundFinish = false;
  }

  cleanUp() {
    console.log("Game Romm reset!");
    this.singalrService.reset();
    this.gameFinished.next(true);
    this.nightWaitModalShowFlag.next(false);
    
    this.backupIdentityClosingButton.next(false);
    this.discussionTopic = "";
    this.aboutToExileName = "";
    this.nightRoundFinish = false;
  }
}