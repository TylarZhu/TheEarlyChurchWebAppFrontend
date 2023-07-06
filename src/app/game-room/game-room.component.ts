import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { HttpsCommService } from '../service/https-comm.service';
import { IOnlineUsers } from '../interface/IOnlineUser';
import { SignalrService } from '../service/signalr.service'
import { IMessage } from '../interface/IMessage';
import { BehaviorSubject, tap } from 'rxjs';
import { INextStep } from '../interface/INextStep';
import { IQuestions } from '../interface/IQuestions';

// import { PlayersListComponent } from '../players-list/players-list.component';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css']
})
export class GameRoomComponent implements OnInit, AfterViewInit  {

  @ViewChild('viewMyIdentity', {read: ElementRef}) identityModal?: ElementRef;

  @ViewChild('waitingForOtherPlayers', {read: ElementRef}) waitingForOtherPlayersModal?: ElementRef;
  @ViewChild('closeWaitingForOtherPlayers', {read: ElementRef}) closeWaitingForOtherPlayers?: ElementRef;

  // @ViewChild('waitingDiscussionModel', {read: ElementRef}) waitingDiscussionModel?: ElementRef;
  // @ViewChild('closeWaitingDiscussionModel', {read: ElementRef}) closeWaitingDiscussionModel?: ElementRef;

  @ViewChild('discussionModel', {read: ElementRef}) discussionModel?: ElementRef;

  @ViewChild('prepareToVoteModel', {read: ElementRef}) prepareToVoteModel?: ElementRef;
  @ViewChild('closePrepareToVoteModel', {read: ElementRef}) closePrepareToVoteModel?: ElementRef;

  @ViewChild('winningModel', {read: ElementRef}) winningModel?: ElementRef;
  @ViewChild('closeWinningModel', {read: ElementRef}) closeWinningModel?: ElementRef;

  @ViewChild('nightWaitingModel', {read: ElementRef}) nightWaitingModel?: ElementRef;
  @ViewChild('closeNightWaitingModel', {read: ElementRef}) closeNightWaitingModel?: ElementRef;

  @ViewChild('AnnounceExileModel', {read: ElementRef}) AnnounceExileModel?: ElementRef;

  @ViewChild('SpiritualFormationQuestion', {read: ElementRef}) SpiritualFormationQuestion?: ElementRef;
  

  onlineUser: IOnlineUsers[];
  messages: IMessage[];
  groupName: string | null;
  name: string | null;
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
  whoWins: string;
  voteResult: string;
  PriestRound: boolean;
  RulerOfTheSynagogue: boolean;
  // inDiscustion: BehaviorSubject<boolean>;
  aboutToExileName: string;
  exileName: string;
  ROTSName: string;
  NicodemusName: string;
  PriestName: string;

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
  // backupClosingButton: BehaviorSubject<boolean>;
  // _backupClosingButton: boolean;
  backupIdentityClosingButton: BehaviorSubject<boolean>;
  _backupIdentityClosingButton: boolean;
  nightWaitModalShowFlag: BehaviorSubject<boolean>;
  _nightWaitModalShowFlag: boolean;

  playerChoice: string = "";
  playerChoiceCorrect: boolean = false;
  playerFinishChoice: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  _playerFinishChoice: boolean = false;

  ACorrect: boolean = false;
  BCorrect: boolean = false;
  CCorrect: boolean = false;
  DCorrect: boolean = false;
  AWrong: boolean = false;
  BWrong: boolean = false;
  CWrong: boolean = false;
  DWrong: boolean = false;


  SpiritualQuestion: IQuestions = {
    Id: "",
    question: {
      Q: "",
      A: "",
      B: "",
      C: "",
      D: "",
      An: "",
      Ex: undefined
    }
  };
  
  
  constructor(private httpService: HttpsCommService, 
    private route: ActivatedRoute,
    private singalrService: SignalrService,
    private router: Router){
      this.onlineUser = [];
      this.groupName = this.route.snapshot.paramMap.get('groupName');
      this.name = this.route.snapshot.paramMap.get('name');
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
      this.whoWins = "";
      this.PriestRound = false;
      this.RulerOfTheSynagogue = false;
      this.voteResult = "";
      this.NicodemusSavingRound = new BehaviorSubject<boolean>(false);
      this._NicodemusSavingRound = false;
      this.aboutToExileName = "";
      this.exileName = "";
      // this.backupClosingButton = new BehaviorSubject<boolean>(false);
      // this._backupClosingButton = false;
      this.JohnFireRound = new BehaviorSubject<boolean>(false);
      this._JohnFireRound = false;
      this.JudasCheckRound = new BehaviorSubject<boolean>(false);
      this._JudasCheckRound = false;
      // this.inDiscustion = new BehaviorSubject<boolean>(false);
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
    this.singalrService.onlineUser.subscribe((onlineUser: IOnlineUsers[]) => {
      this.onlineUser = onlineUser;
    });
    this.singalrService.messagesToAll.subscribe((messages: IMessage[]) => {
      this.messages = messages;
    });
    this.singalrService.groupLeader.subscribe((groupLeader: IOnlineUsers) =>{
      this.groupLeader = groupLeader;
    });
    this.singalrService.identitiesExplanation.pipe(tap(
      _ => {
        if(this.identityModal !== undefined) {
          this.identityModal.nativeElement.click();
        }
      }
    )).subscribe((identitiesExplanation: string[]) => {
      this.abilities = identitiesExplanation
    });
    this.singalrService.nextStep.pipe(tap(
      nextStep => {
        this.prepareNextStep(nextStep);
      }
    )).subscribe((nextStep: INextStep) => {
      this.nextStep = nextStep;
    });

    this.singalrService.maxPlayer.pipe(tap( x => {
        if(x > 0 && x == this.onlineUser.length){
          this.startGameShow = true;
        }
      })).subscribe((maxPlayer: number) => {
        this.MaxPlayer = maxPlayer;
      }
    );

    this.singalrService.finishDisscussion.pipe(tap(
        finishDisscussion => {
          // console.log(finishDisscussion);
          if(finishDisscussion == "InDisscussion"){
            if(this.discussionModel !== undefined) {
              this.discussionModel.nativeElement.click();
            }
            // this.inDiscustion.next(true);
          }
      })).subscribe();

    
    this.singalrService.finishedViewIdentityOrNot.pipe(tap(
      finishedViewIdentityOrNot => {
        if(finishedViewIdentityOrNot)
        {
          if(this.waitingForOtherPlayersModal !== undefined) {
            this.waitingForOtherPlayersModal.nativeElement.click();
          } else {
            console.log("waitingForOtherPlayersModal is null!");
          }
        } else {
          if(this.closeWaitingForOtherPlayers !== undefined) {
            this.closeWaitingForOtherPlayers.nativeElement.click();
          } else {
            console.log("closeWaitingForOtherPlayers is null!");
          }
        }
      })).subscribe();

    this.singalrService.playerNotInGame.subscribe((playerNotInGame: IOnlineUsers[]) => {
      this.playerNotInGame = playerNotInGame;
    });
    this.singalrService.GameOn.subscribe((GameOn: boolean) => {
      this.gameOn = GameOn;
    });
    this.singalrService.identity.subscribe((identity: string) => {
      this.identity = identity;
    });
    this.singalrService.voteResult.subscribe((voteResult: string) => {
      this.voteResult = voteResult;
    });

    // assign priest and ROTS on the first night.
    this.singalrService.PriestRound.pipe(tap(
      // if Priest finish exilting, then send to waiting stat.
      (PriestRound: boolean) => {
        if(!PriestRound) {
          if(this.nightWaitingModel !== undefined) {
            this.nightWaitingModel.nativeElement.click();
          } else {
            console.log("nightWaitingModel is null!");
          }
        }
    })).subscribe((PriestRound: boolean) => {
      this.PriestRound = PriestRound;
    });
    this.singalrService.RulerOfTheSynagogue.subscribe((RulerOfTheSynagogue: boolean) => {
      this.RulerOfTheSynagogue = RulerOfTheSynagogue;
    });

    // this.backupClosingButton.subscribe((backupClosingButton) => {
    //   this._backupClosingButton = backupClosingButton;
    // });
    this.NicodemusSavingRound.subscribe((NicodemusSavingRound) => {
      this._NicodemusSavingRound = NicodemusSavingRound;
    });
    this.JohnFireRound.subscribe((JohnFireRound) => {
      this._JohnFireRound = JohnFireRound;
    });
    this.JudasCheckRound.subscribe((JudasCheckRound) => {
      this._JudasCheckRound = JudasCheckRound;
    });
    this.singalrService.exileName.pipe(tap(_ => {
      if(this.AnnounceExileModel !== undefined) {
        this.AnnounceExileModel.nativeElement.click();
      }
    })).subscribe((exileName: string) => {
      this.exileName = exileName;
    });

    this.backupIdentityClosingButton.subscribe((backupIdentityClosingButton: boolean) => {
      this._backupIdentityClosingButton = backupIdentityClosingButton
    });
    this.nightWaitModalShowFlag.subscribe((nightWaitModalShowFlag: boolean) => {
      this._nightWaitModalShowFlag = nightWaitModalShowFlag;
    });
    this.singalrService.PriestName.subscribe((PriestName: string) => {
      this.PriestName = PriestName;
    });
    this.singalrService.ROTSName.subscribe((ROTSName: string) => {
      this.ROTSName = ROTSName;
    });
    this.singalrService.NicodemusName.subscribe((NicodemusName: string) => {
      this.NicodemusName = NicodemusName;
    });
    this.singalrService.PriestMeetingRound.subscribe((PriestMeetingRound: boolean) => {
      this._PriestMeetingRound = PriestMeetingRound;
    });
    this.singalrService.NicodemusMeetingRound.subscribe((NicodemusMeetingRound: boolean) => {
      this._NicodemusMeetingRound = NicodemusMeetingRound;
    });
    this.singalrService.day.subscribe((day: number) => {
      this.day = day;
    });
    this.singalrService.question.pipe(tap((question: IQuestions) => {
      if(question.Id != "") {
        if(this.SpiritualFormationQuestion !== undefined) {
          this.SpiritualFormationQuestion.nativeElement.click();
        } else {
          console.log("SpiritualFormationQuestion is undefine");
        }
      }
    })).subscribe((question: IQuestions) => {
      this.SpiritualQuestion = question;
    });
    this.playerFinishChoice.subscribe((playerFinishChoice: boolean) => {
      this._playerFinishChoice = playerFinishChoice;
    });
  }

  ngAfterViewInit(): void {
  }

  prepareNextStep(nextStep: INextStep): void{
    if(nextStep.nextStepName == "discussing")
    {
      this.backupIdentityClosingButton.next(true);
      if(nextStep.options == undefined)
      {
        this.discussionTopic = "Freely Disscuss";
      } else {
        this.discussionTopic = nextStep.options![0];
      }
    } else if(nextStep.nextStepName == "vote") {
      this.backupIdentityClosingButton.next(false);
      if(this.prepareToVoteModel !== undefined) {
        this.prepareToVoteModel.nativeElement.click();
      } else {
        console.log("prepareToVoteModel is null");
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
      // this.backupClosingButton.next(false);
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
      this.nightWaitModalShowFlag.next(false);
      if(this.closeNightWaitingModel !== undefined) {
        this.closeNightWaitingModel.nativeElement.click();
      } else {
        console.log("nightWaitingModel is null!");
      }
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
    this.httpService.NicodemusAction(this.groupName!, action);
  }

  DoNotFire()
  {
    this.JohnFireRound.next(false);
    this.httpService.FireHimOrHer(this.groupName!, "NULL");
  }

  BeginToCheck() {
    this.JudasCheckRound.next(false);
  }

  finishedToViewTheExileResult() {
    this.httpService.finishedToViewTheExileResult(this.groupName!);
  }

  async gameStart(): Promise<void> {
    let half = this.onlineUser.length / 2;
    this.httpService.CreateAGame(this.groupName!, half);
  }

  finishedDiscussion() {
    // this.inDiscustion.next(false);
    this.httpService.whoIsDiscussing(this.groupName!);
  }

  findViewIdentityReadyToPlay(): void {
    this.httpService.IdentityViewingState(this.groupName!, this.name!);
  }

  async userLeavesGroup(){
    await this.singalrService.connection.invoke("leaveGroup", this.groupName);
    this.httpService.userLeaveTheGame(this.groupName!, this.name!, this.gameOn);
    this.router.navigate(['/']);
  }
  conformAnswer() {
    this.playerFinishChoice.next(true);
    if(this.playerChoice == this.SpiritualQuestion.question.An) {
      this.playerChoiceCorrect = true;
      switch(this.playerChoice) {
        case 'A':
          this.ACorrect = true;
          break;
        case 'B':
          this.BCorrect = true;
          break;
        case 'C':
          this.CCorrect = true;
          break;
        case 'D':
          this.DCorrect = true;
          break;
      }
    } else {
      this.playerChoiceCorrect = false;
      switch(this.SpiritualQuestion.question.An) {
        case 'A':
          this.ACorrect = true;
          break;
        case 'B':
          this.BCorrect = true;
          break;
        case 'C':
          this.CCorrect = true;
          break;
        case 'D':
          this.DCorrect = true;
          break;
      }
      switch(this.playerChoice) {
        case 'A':
          this.AWrong = true;
          break;
        case 'B':
          this.BWrong = true;
          break;
        case 'C':
          this.CWrong = true;
          break;
        case 'D':
          this.DWrong = true;
          break;
      }
    }
  }

  increaseWeightOrNot() {
    this.ACorrect = false;
    this.BCorrect = false;
    this.CCorrect = false;
    this.DCorrect = false;
    this.AWrong = false;
    this.BWrong = false;
    this.CWrong = false;
    this.DWrong = false;
    this.playerFinishChoice.next(false);
    const initQuesiont = {
      Id: "",
      question: {
        Q: "",
        A: "",
        B: "",
        C: "",
        D: "",
        An: "",
        Ex: undefined
      }
    }
    this.singalrService.question.next(initQuesiont);
    this.httpService.spiritualQuestionAnsweredCorrectOrNot(this.groupName!, this.name!, this.playerChoiceCorrect);
  }
}
