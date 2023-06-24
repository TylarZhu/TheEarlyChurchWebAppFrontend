import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { HttpsCommService } from '../service/https-comm.service';
import { IOnlineUsers } from '../interface/IOnlineUser';
import { SignalrService } from '../service/signalr.service'
import { IMessage } from '../interface/IMessage';
import { BehaviorSubject, tap } from 'rxjs';
import { INextStep } from '../interface/INextStep';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css']
})
export class GameRoomComponent implements OnInit, AfterViewInit  {

  @ViewChild('viewMyIdentity', {read: ElementRef}) identityModal?: ElementRef;

  @ViewChild('waitingForOtherPlayers', {read: ElementRef}) waitingForOtherPlayersModal?: ElementRef;
  @ViewChild('closeWaitingForOtherPlayers', {read: ElementRef}) closeWaitingForOtherPlayers?: ElementRef;

  @ViewChild('waitingDiscussionModel', {read: ElementRef}) waitingDiscussionModel?: ElementRef;
  @ViewChild('closeWaitingDiscussionModel', {read: ElementRef}) closeWaitingDiscussionModel?: ElementRef;

  @ViewChild('discussionModel', {read: ElementRef}) discussionModel?: ElementRef;

  @ViewChild('prepareToVoteModel', {read: ElementRef}) prepareToVoteModel?: ElementRef;
  @ViewChild('closePrepareToVoteModel', {read: ElementRef}) closePrepareToVoteModel?: ElementRef;

  @ViewChild('winningModel', {read: ElementRef}) winningModel?: ElementRef;
  @ViewChild('closeWinningModel', {read: ElementRef}) closeWinningModel?: ElementRef;

  @ViewChild('nightWaitingModel', {read: ElementRef}) nightWaitingModel?: ElementRef;
  @ViewChild('closeNightWaitingModel', {read: ElementRef}) closeNightWaitingModel?: ElementRef;

  @ViewChild('AnnounceExileModel', {read: ElementRef}) AnnounceExileModel?: ElementRef;

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
  daylightOrNight: string;
  nextStep: INextStep;
  discussionTopic: string;
  playerInGame: string[];
  whoWins: string;
  voteResult: string;
  PriestRound: boolean;
  RulerOfTheSynagogue: boolean;
  NicodemusSavingRound: BehaviorSubject<boolean>;
  _NicodemusSavingRound: boolean;
  aboutToExileName: string;
  exileName: string;
  backupClosingButton: BehaviorSubject<boolean>;
  _backupClosingButton: boolean;
  JohnFireRound: BehaviorSubject<boolean>;
  _JohnFireRound: boolean;
  JudasCheckRound: BehaviorSubject<boolean>;
  _JudasCheckRound: boolean;

  
  
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
      this.daylightOrNight = "Daylight";
      this.nextStep = null!;
      this.discussionTopic = "";
      this.playerInGame = [];
      this.whoWins = "";
      this.PriestRound = false;
      this.RulerOfTheSynagogue = false;
      this.voteResult = "";
      this.NicodemusSavingRound = new BehaviorSubject<boolean>(false);
      this._NicodemusSavingRound = false;
      this.aboutToExileName = "";
      this.exileName = "";
      this.backupClosingButton = new BehaviorSubject<boolean>(false);
      this._backupClosingButton = false;
      this.JohnFireRound = new BehaviorSubject<boolean>(false);
      this._JohnFireRound = false;
      this.JudasCheckRound = new BehaviorSubject<boolean>(false);
      this._JudasCheckRound = false;
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
        if(this.identityModal != null) {
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
          if(!this.playerInGame.includes(this.name!)) {
            if(finishDisscussion == "InDisscussion"){
              if (this.closeWaitingDiscussionModel != null && this.discussionModel != null) {
                this.backupClosingButton.next(true);
                this.closeWaitingDiscussionModel.nativeElement.click();
                this.discussionModel.nativeElement.click();
              } else {
                console.log("closeWaitingDiscussionModel or discussionModel is null!");
              }
            } else if(finishDisscussion == "FinishDisscussionWaitOthers") {
              if(this.waitingDiscussionModel != null) {
                this.backupClosingButton.next(false);
                this.waitingDiscussionModel.nativeElement.click();
              } else {
                console.log("waitingDiscussionModel is null!");
              }
            } else {
              if(this.closeWaitingDiscussionModel != null) {
                console.log("Closing!");
                this.backupClosingButton.next(true);
                this.closeWaitingDiscussionModel.nativeElement.click();
                
              } else {
                console.log("closeWaitingDiscussionModel is null!");
              }
            }
          }
      })).subscribe();

    
    this.singalrService.finishedViewIdentityOrNot.pipe(tap(
      finishedViewIdentityOrNot => {
        if(finishedViewIdentityOrNot)
        {
          if(this.waitingForOtherPlayersModal != null) {
            this.waitingForOtherPlayersModal.nativeElement.click();
          } else {
            console.log("waitingForOtherPlayersModal is null!");
          }
        } else {
          if(this.closeWaitingForOtherPlayers != null) {
            this.closeWaitingForOtherPlayers.nativeElement.click();
          } else {
            console.log("closeWaitingForOtherPlayers is null!");
          }
        }
      })).subscribe();

    this.singalrService.playerInGame.subscribe((playerInGame: string[]) => {
      this.playerInGame = playerInGame;
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
      // if Priest finish exilting, 
      (PriestRound: boolean) => {
        if(!PriestRound) {
          if(this.nightWaitingModel != null) {
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

    this.backupClosingButton.subscribe((backupClosingButton) => {
      this._backupClosingButton = backupClosingButton;
    });
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
      if(this.AnnounceExileModel != null) {
        this.AnnounceExileModel.nativeElement.click();
      }
    })).subscribe((exileName: string) => {
      this.exileName = exileName;
    });
  }

  ngAfterViewInit(): void {
  }

  prepareNextStep(nextStep: INextStep): void{
    console.log(nextStep.nextStepName);
    if(nextStep.nextStepName == "discussing")
    {
      if(nextStep.options == undefined)
      {
        this.discussionTopic = "Freely Disscuss";
      } else {
        this.discussionTopic = nextStep.options![0];
      }
    } else if(nextStep.nextStepName == "vote") {
      if(this.prepareToVoteModel != null) {
        this.prepareToVoteModel.nativeElement.click();
      } else {
        console.log("prepareToVoteModel is null");
      }
      setTimeout(() => {
        if(this.closePrepareToVoteModel != null) {
          this.closePrepareToVoteModel.nativeElement.click();
        } else {
          console.log("closePrepareToVoteModel is null!");
        }
      }, 3000);
    } else if(nextStep.nextStepName == "SetUserToNightWaiting") {
        this.backupClosingButton.next(false);
        if(this.nightWaitingModel != null) {
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
      if(this.closeNightWaitingModel != null) {
        this.closeNightWaitingModel.nativeElement.click();
      } else {
        console.log("nightWaitingModel is null!");
      }
    }
  }
  
  NicodemusAction(action: boolean) 
  {
    this.NicodemusSavingRound.next(false);
    this.httpService.NicodemusAction(this.groupName!, action);
  }

  BeginToFire(choice: boolean)
  {
    if(!choice) {
      this.httpService.FireHimOrHer(this.groupName!, "");
    }
    this.JohnFireRound.next(false);
  }

  BeginToCheck()
  {
    this.JudasCheckRound.next(false);
  }

  async gameStart(): Promise<void> {
    let half = this.onlineUser.length / 2;
    this.httpService.CreateAGame(this.groupName!, half);
  }

  finishedDiscussion() {
    this.httpService.whoIsDiscussing(this.groupName!, this.name!);
  }

  findViewIdentityReadyToPlay(): void {
    this.httpService.IdentityViewingState(this.groupName!, this.name!);
  }

  async userLeavesGroup(){
    await this.singalrService.connection.invoke("leaveGroup", this.groupName);
    this.httpService.userLeaveTheGame(this.groupName!, this.name!, this.gameOn);
    this.router.navigate(['/']);
  }
}
