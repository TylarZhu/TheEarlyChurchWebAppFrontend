import { Component, Input, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpsCommService } from '../service/https-comm.service';

import { IOnlineUsers } from '../interface/IOnlineUser';
import { INextStep } from '../interface/INextStep';
import { SignalrService } from '../service/signalr.service';
import { GameRoomComponent } from '../game-room/game-room.component'

import { BehaviorSubject, tap } from 'rxjs';

@Component({
  selector: 'app-players-list',
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.css']
})
export class PlayersListComponent implements OnInit{

  @Input() childGroupName: string | null;
  @Input() childOnlineUser: IOnlineUsers[];
  @Input() childGroupLeader: IOnlineUsers;
  @Input() childName: string | null;
  @Input() childGameOn: boolean; 
  @Input() voteState: string;

  @ViewChild('waitOthersToVoteModel', {read: ElementRef}) waitOthersToVoteModel?: ElementRef;
  @ViewChild('closeWaitOthersToVoteModel', {read: ElementRef}) closePrepareToVoteModel?: ElementRef;
  
  @ViewChild('JudasCheckingResult', {read: ElementRef}) JudasCheckingResult?: ElementRef;

  userChoosePersonName: string;
  conformToVote: boolean;
  exilePersonName: string;
  exileToVote: boolean;
  isPriest: boolean;
  PriestName: string;
  _JohnFireRound: boolean;
  JohnCannotFireList: string[];
  JudasCheckRound: BehaviorSubject<boolean>;
  _JudasCheckRound: boolean;
  checkResult: boolean;
  JudasHimself: string;
  playerNotInGame: IOnlineUsers[];
  _inDiscustionName: string;
  _inAnswerQuestionName: string = "";
  
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
    this.exilePersonName = "";
    this.exileToVote = false;
    this.isPriest = false;
    this.PriestName = "";
    this._JohnFireRound = false;
    this.JohnCannotFireList = [];
    this.JudasCheckRound = new BehaviorSubject<boolean>(false);
    this._JudasCheckRound = false;
    this.checkResult = false;
    this.JudasHimself = "";
    this._inDiscustionName = "";
  }

  ngOnInit(): void {
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
    this.singalrService.PriestRound.subscribe((PriestRound: boolean) => {
      this.isPriest = PriestRound;
    });
    this.singalrService.PriestName.subscribe((PriestName: string) => {
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
    })).subscribe();
    this.gameRoomComponent.JohnFireRound.subscribe((JohnFireRound) => {
        this._JohnFireRound = JohnFireRound;
      }
    );
    this.singalrService.JudasCheckResult.pipe(tap(_ => {
      if(this.JudasCheckingResult !== undefined) {
        this.JudasCheckingResult.nativeElement.click();
      }
    })).subscribe(
      (JudasCheckResult) => {
        this.checkResult = JudasCheckResult;
      }
    );
    this.JudasCheckRound.subscribe((JudasCheckRound) => {
      this._JudasCheckRound = JudasCheckRound;
    });
    this.singalrService.playerNotInGame.subscribe((playerNotInGame: IOnlineUsers[]) => {
      this.playerNotInGame = playerNotInGame;
    });
    // this.gameRoomComponent.inDiscustion.pipe(tap((inDiscustion: boolean) => {
    //   console.log(inDiscustion);
    // })).subscribe((inDiscustion: boolean) => {
    //   this._inDiscustion = inDiscustion;
    // });
    this.singalrService.inDiscusstionUserName.subscribe((inDiscusstionUserName: string) => {
      this._inDiscustionName = inDiscusstionUserName;
    });
    this.singalrService.inAnswerQuestionName.subscribe((inAnswerQuestionName: string) => {
      this._inAnswerQuestionName = inAnswerQuestionName;
    });
  }

  assignNewGroupLeader(nextLeader: string) {
    this.httpService.assignNextGroupLeader(this.childGroupName!, nextLeader, this.childGroupLeader.name);
  }
  
  NightRoundEnd(): void {
    this.httpService.NightRoundEnd(this.childGroupName!);
  }

  exileHimOrHer(name: string, conformToExile: boolean) {
    this.userChoosePersonName = name;
    if(conformToExile) {
      this.singalrService.changePriestRoundStatus(false);
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
}
