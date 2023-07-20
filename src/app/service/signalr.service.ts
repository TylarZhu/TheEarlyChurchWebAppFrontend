import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as singalR from '@microsoft/signalr';
import { BehaviorSubject, of } from 'rxjs';

import { IOnlineUsers } from '../interface/IOnlineUser'
import { IMessage } from '../interface/IMessage';
import { HttpsCommService } from './https-comm.service';
import { INextStep } from '../interface/INextStep';
import { IQuestions } from '../interface/IQuestions';
// import { GameRoomComponent } from '../game-room/game-room.component';

@Injectable({
  providedIn: 'root'
})
export class SignalrService implements OnInit {
  hubUrl: string;
  hubConnection: singalR.HubConnection;

  // -------------- //
  // Group Entities //
  // -------------- //
  onlineUser: BehaviorSubject<IOnlineUsers[]>;
  messagesToAll: BehaviorSubject<IMessage[]>;
  identitiesExplanation: BehaviorSubject<string[]>;
  openIdentitiesExplanationModal: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  groupLeader: BehaviorSubject<IOnlineUsers>;
  maxPlayer: BehaviorSubject<number>;
  // groupName: string = "";
  // name: string = "";

  // ------------- //
  // Game Entities //
  // ------------- //
  finishedViewIdentityOrNot: BehaviorSubject<boolean>;
  finishDisscussion: BehaviorSubject<string>;
  nextStep: BehaviorSubject<INextStep>;
  playerNotInGame: BehaviorSubject<IOnlineUsers[]>;
  finishVoteWaitForOthers: BehaviorSubject<boolean>;
  voteResult: BehaviorSubject<string>;
  GameOn:  BehaviorSubject<boolean>;
  identity: BehaviorSubject<string>;
  PriestRound: BehaviorSubject<boolean>;
  PriestName: BehaviorSubject<string>;
  RulerOfTheSynagogue: BehaviorSubject<boolean>;
  JudasCheckResult: BehaviorSubject<boolean>;
  JudasCheckResultShow: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  exileName: BehaviorSubject<string>;
  ROTSName: BehaviorSubject<string>;
  NicodemusName: BehaviorSubject<string>;
  NicodemusMeetingRound: BehaviorSubject<boolean>;
  PriestMeetingRound: BehaviorSubject<boolean>;
  day: BehaviorSubject<number>;
  inDiscusstionUserName: BehaviorSubject<string>;
  question: BehaviorSubject<IQuestions>;
  inAnswerQuestionName: BehaviorSubject<string> = new BehaviorSubject<string>("");
  JudasHintRound: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  offLinePlayerName: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  stillInActionPlayers: BehaviorSubject<IOnlineUsers[]> = new BehaviorSubject<IOnlineUsers[]>([]);

  openOrCloseExileResultModal: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  JudasName: BehaviorSubject<string> = new BehaviorSubject<string>("");
  HintName: BehaviorSubject<string> = new BehaviorSubject<string>("");
  ROTSGetInfomation: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  lastExiledPlayerName: BehaviorSubject<string> = new BehaviorSubject<string>("");

  winner: BehaviorSubject<number> = new BehaviorSubject<number>(-1);

  history: BehaviorSubject<Record<string, string[]>> = 
    new BehaviorSubject<Record<string, string[]>>({});

  initNextStep: INextStep = {
    nextStepName: "",
    options: []
  };
  initUser: IOnlineUsers = {
    userId: "",
    connectionId: "",
    name: "",
    groupName: "",
    identity: ""
  };
  initQuestion: IQuestions = {
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

  constructor(private httpService: HttpsCommService, private router: Router) {
    this.hubUrl = "https://localhost:7252/PlayerGroupsHub";
    // this.hubUrl = "https://theearlychurchgame.azurewebsites.net/PlayerGroupsHub";
    this.hubConnection = new singalR.HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect()
      .build();
    this.hubConnection.serverTimeoutInMilliseconds = 100000;
    this.onlineUser =  new BehaviorSubject<IOnlineUsers[]>([]);
    this.messagesToAll = new BehaviorSubject<IMessage[]>([]);
    this.groupLeader = new BehaviorSubject<IOnlineUsers>(this.initUser);
    this.maxPlayer = new BehaviorSubject<number>(0);


    this.identitiesExplanation = new BehaviorSubject<string[]>([]);
    this.finishedViewIdentityOrNot = new BehaviorSubject<boolean>(false);
    this.finishDisscussion = new BehaviorSubject<string>("");
    this.nextStep = new BehaviorSubject<INextStep>(this.initNextStep);
    this.playerNotInGame = new BehaviorSubject<IOnlineUsers[]>([]);
    this.finishVoteWaitForOthers = new BehaviorSubject<boolean>(false);
    this.voteResult = new BehaviorSubject<string>("");
    this.GameOn = new BehaviorSubject<boolean>(false);
    this.identity = new BehaviorSubject<string>("");
    this.PriestRound = new BehaviorSubject<boolean>(false);
    this.RulerOfTheSynagogue = new BehaviorSubject<boolean>(false);
    this.PriestName = new BehaviorSubject<string>("");
    this.JudasCheckResult = new BehaviorSubject<boolean>(false);
    this.exileName = new BehaviorSubject<string>("");
    this.ROTSName = new BehaviorSubject<string>("");
    this.NicodemusName = new BehaviorSubject<string>("");
    this.NicodemusMeetingRound = new BehaviorSubject<boolean>(false);
    this.PriestMeetingRound = new BehaviorSubject<boolean>(false);
    this.day = new BehaviorSubject<number>(1);
    this.inDiscusstionUserName = new BehaviorSubject<string>("");
    this.question =  new BehaviorSubject<IQuestions>(this.initQuestion); 
  }

  ngOnInit(): void {
    this.onDisconnect();
  }

  public async initConnection(): Promise<void>{
    try {
      await this.hubConnection.start();
      console.log("SignalR Connected.");
      this.setSignalrClientMethods();

      this.hubConnection.onclose(err => {
        console.log("connection closed! Error: " + err);
        // this.httpService.userLeaveTheGameByConnectionId(this.hubConnection.connectionId);
        setTimeout(async (_: any) => await this.initConnection(), 3000);
      });
    } catch(err) {
      console.log("SignalR err: " + err);
    }
  }

  public async onDisconnect() {
    this.hubConnection.onclose(async () => {
      console.log("connection closed!");
      // this.httpService.userLeaveTheGameByConnectionId(this.hubConnection.connectionId);
      setTimeout(async (_: any) => await this.initConnection(), 3000);
    });
  }

  private setSignalrClientMethods(): void{
    this.hubConnection.on('ReceiveMessages', (messages: IMessage[]) => {
      this.messagesToAll.next(messages);
    });

    this.hubConnection.on('CreateNewUserJoinNewGroup', (connectionID: string, groupName: string, name: string, groupMaxPlayers: string) => {
      this.httpService.createNewUserAndGroup(connectionID, groupName, name, groupMaxPlayers);
    });
    this.hubConnection.on('updateUserList', (onlineUser: IOnlineUsers[]) => {
      this.onlineUser.next(onlineUser);
    });
    this.hubConnection.on('updateGroupLeader', (onlineUser: IOnlineUsers) => {
      this.groupLeader.next(onlineUser);
    });
    this.hubConnection.on("updatePlayersIdentities", (identity: string) => {
      this.identity.next(identity);
      this.GameOn.next(true);
    });
    this.hubConnection.on("IdentitiesExplanation", (identitiesExplanation: string[], openIdentitiesExplanationModal: boolean) => {
      this.identitiesExplanation.next(identitiesExplanation);
      this.openIdentitiesExplanationModal.next(openIdentitiesExplanationModal);
    });
    this.hubConnection.on("getMaxPlayersInGroup", (maxPlayer: number) => {
      this.maxPlayer.next(maxPlayer);
    });
    this.hubConnection.on("finishedViewIdentityAndWaitOnOtherPlayers", (wait: boolean) => {
      this.finishedViewIdentityOrNot.next(wait);
    });
    // state == InDisscussion, Disscussion modal triggered
    // state == Waiting, Microphone icron triggered
    this.hubConnection.on("currentUserInDiscusstion", (state: string, inDiscusstionUserName: string) => {
      this.finishDisscussion.next(state);
      this.inDiscusstionUserName.next(inDiscusstionUserName);
    });
    this.hubConnection.on("nextStep", (nextStep: INextStep) => {
      this.nextStep.next(nextStep);
    });
    this.hubConnection.on("finishVoteWaitForOthersOrVoteResult", (waitState: boolean, result: string) => {
      this.finishVoteWaitForOthers.next(waitState);
      this.voteResult.next(result);
    });

    this.hubConnection.on("PriestROTSNicoMeet", (ROTSName: string, priestName: string, NicodemusName: string) => {
      this.ROTSName.next(ROTSName);
      this.PriestName.next(priestName);
      this.NicodemusName.next(NicodemusName);
    });
    this.hubConnection.on("PriestRound", () => {
      this.PriestMeetingRound.next(true);
      this.PriestRound.next(true);
    });
    this.hubConnection.on("RulerOfTheSynagogueMeeting", () => {
      this.RulerOfTheSynagogue.next(true);
    });
    this.hubConnection.on("NicoMeeting", () => {
      this.NicodemusMeetingRound.next(true);
    });

    this.hubConnection.on("JudasCheckResult", (status: boolean) => {
      this.JudasCheckResultShow.next(true);
      this.JudasCheckResult.next(status);
    });
    this.hubConnection.on("updateExiledUsers", (user: IOnlineUsers[]) => {
      this.playerNotInGame.next(user);
    });
    this.hubConnection.on("announceExile", (name: string) => {
      this.exileName.next(name);
    });
    this.hubConnection.on("changeDay", (day: number) => {
      this.day.next(day);
    });
    this.hubConnection.on("getAQuestion", (question: IQuestions) => {
      this.question.next(question);
    });
    this.hubConnection.on("inAnswerQuestionName", (inAnswerQuestionName: string) => {
      this.inAnswerQuestionName.next(inAnswerQuestionName);
    });
    this.hubConnection.on("JudasGivePriestHint", (priestName: string) => {
      this.JudasHintRound.next(true);
      this.PriestName.next(priestName);
    });
    this.hubConnection.on("PriestReceiveHint", (JudasName: string, HintName: string) => {
      this.JudasName.next(JudasName);
      this.HintName.next(HintName);
    });
    this.hubConnection.on("announceLastExiledPlayerInfo", (status: boolean, name: string) => {
      this.ROTSGetInfomation.next(status);
      this.lastExiledPlayerName.next(name);
    });
    this.hubConnection.on("announceWinner", (winner: number) => {
      this.winner.next(winner);
      this.GameOn.next(false);
    });
    this.hubConnection.on("announceGameHistory", (history: Record<string, string[]>) => {
      this.history.next(history);
    });
    this.hubConnection.on("stillWaitingFor", (stillInActionPlayers: IOnlineUsers[]) => {
      this.stillInActionPlayers.next(stillInActionPlayers);
    });
    this.hubConnection.on("openOrCloseExileResultModal", (status: boolean) => {
      this.openOrCloseExileResultModal.next(status);
    });

    // user refresh Page or close tab
    this.hubConnection.on("announceOffLinePlayer", (offLinePlayerName: string[]) => {
      this.offLinePlayerName.next(offLinePlayerName);
    });
    this.hubConnection.on("IdentityViewingStateFinish", (groupName: string, name: string) => {
      this.httpService.IdentityViewingState(groupName, name);
    });
    this.hubConnection.on("DiscussingStateFinish", (groupName: string) => {
      this.httpService.whoIsDiscussing(groupName);
    });
    this.hubConnection.on("VoteStateFinish", (groupName: string, name: string) => {
      this.httpService.voteHimOrHer(groupName, name, name);
    });
    this.hubConnection.on("PriestRoundStateFinish", (groupName: string) => {
      this.httpService.PriestRoundStateFinish(groupName);
    });
    this.hubConnection.on("JudasMeetWithPriestStateFinish", (groupName: string) => {
      this.httpService.JudasMeetWithPriest(groupName, "NULL");
    });
    this.hubConnection.on("NicodemusSavingRoundBeginStateFinish", (groupName: string) => {
      this.httpService.NicodemusAction(groupName, false);
    });
    this.hubConnection.on("JohnFireRoundBeginStateFinish", (groupName: string) => {
      this.httpService.FireHimOrHer(groupName, "NULL");
    });
    this.hubConnection.on("JudasCheckRoundStateFinish", (groupName: string) => {
      this.httpService.JudasCheckRound(groupName, "NULL");
    });
    this.hubConnection.on("finishedToViewTheExileResultStateFinish", (groupName: string, name: string) => {
      this.httpService.finishedToViewTheExileResult(groupName, name);
    });
    this.hubConnection.on("spiritualQuestionAnsweredCorrectOrNotStateFinish", 
    (groupName: string, leaveUserName: string) => {
      this.httpService.spiritualQuestionAnsweredCorrectOrNot(groupName, leaveUserName, false);
    });
    this.hubConnection.on("repostOnlineUser", (newConnectionId: string, groupName: string, name: string, maxPlayer: string) => {
      this.httpService.createNewUserAndGroup(newConnectionId, groupName, name, maxPlayer);
    });
    this.hubConnection.on("redirectToHomePage", () => { 
      this.router.navigate(['/']);
    });
  }

  public changePriestRoundStatus(status: boolean): void {
    this.PriestRound.next(status);
  }

  public reset(): void {
    console.log("BehaviorSubject reset!")
    this.finishedViewIdentityOrNot.next(false);
    this.finishDisscussion.next("");
    this.nextStep.next(this.initNextStep);
    this.playerNotInGame.next([]);
    this.finishVoteWaitForOthers.next(false);
    this.voteResult.next("");
    this.GameOn.next(false);
    this.identity.next("");
    this.PriestName.next("");
    this.RulerOfTheSynagogue.next(false);
    this.exileName.next("");
    this.ROTSName.next("");
    this.NicodemusName.next("");
    this.NicodemusMeetingRound.next(false);
    this.PriestMeetingRound.next(false);
    this.day.next(1);
    this.inDiscusstionUserName.next("");
    this.question.next(this.initQuestion);
    this.inAnswerQuestionName.next("");
    this.JudasName.next("");
    this.ROTSGetInfomation.next(false);
    this.lastExiledPlayerName.next("");
    this.winner.next(-1);
    this.history.next({});
    this.JudasHintRound.next(false);
    this.HintName.next("");
    this.JudasCheckResultShow.next(false);
    this.offLinePlayerName.next([]);
    this.stillInActionPlayers.next([]);
    this.identitiesExplanation.next([]);
    this.openOrCloseExileResultModal.next(false);
    this.openIdentitiesExplanationModal.next(true);
  }
}