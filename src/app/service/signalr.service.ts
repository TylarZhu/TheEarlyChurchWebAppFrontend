import { Injectable } from '@angular/core';
import * as singalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

import { IOnlineUsers } from '../interface/IOnlineUser'
import { IMessage } from '../interface/IMessage';
import { HttpsCommService } from './https-comm.service';
import { INextStep } from '../interface/INextStep';
import { IQuestions } from '../interface/IQuestions';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  hubUrl: string;
  connection: singalR.HubConnection;

  // -------------- //
  // Group Entities //
  // -------------- //
  onlineUser: BehaviorSubject<IOnlineUsers[]>;
  messagesToAll: BehaviorSubject<IMessage[]>;
  identitiesExplanation: BehaviorSubject<string[]>;
  groupLeader: BehaviorSubject<IOnlineUsers>;
  maxPlayer: BehaviorSubject<number>;

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
  exileName: BehaviorSubject<string>;
  ROTSName: BehaviorSubject<string>;
  NicodemusName: BehaviorSubject<string>;
  NicodemusMeetingRound: BehaviorSubject<boolean>;
  PriestMeetingRound: BehaviorSubject<boolean>;
  day: BehaviorSubject<number>;
  inDiscusstionUserName: BehaviorSubject<string>;
  question: BehaviorSubject<IQuestions>;
  inAnswerQuestionName: BehaviorSubject<string> = new BehaviorSubject<string>("");


  constructor(private httpService: HttpsCommService) {
    const initUser: IOnlineUsers = {userId: "",
      connectionId: "",
      name: "",
      groupName: "",
      identity: ""};
    const initNextStep: INextStep = {
      nextStepName: "",
      options: []
    };
    const initQuestion: IQuestions = {
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
    this.hubUrl = "https://localhost:7252/PlayerGroupsHub";
    this.connection = new singalR.HubConnectionBuilder().withUrl(this.hubUrl).withAutomaticReconnect().build();
    this.connection.serverTimeoutInMilliseconds = 100000;
    this.onlineUser =  new BehaviorSubject<IOnlineUsers[]>([]);
    this.messagesToAll = new BehaviorSubject<IMessage[]>([]);
    this.groupLeader = new BehaviorSubject<IOnlineUsers>(initUser);
    this.maxPlayer = new BehaviorSubject<number>(0);
    this.identitiesExplanation = new BehaviorSubject<string[]>([]);
    this.finishedViewIdentityOrNot = new BehaviorSubject<boolean>(false);
    this.finishDisscussion = new BehaviorSubject<string>("");
    this.nextStep = new BehaviorSubject<INextStep>(initNextStep);
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
    this.question =  new BehaviorSubject<IQuestions>(initQuestion); 
  }

  public async initConnection(): Promise<void>{
    try {
      await this.connection.start();
      console.log("SignalR Connected.");
      this.setSignalrClientMethods();
    } catch(err) {
      console.log(err);
    }
  }

  public async onDisconnect() {
    this.connection.onclose(async () => {
      await this.initConnection();
    });
  }

  private setSignalrClientMethods(): void{
    this.connection.on('ReceiveMessages', (messages: IMessage[]) => {
      this.messagesToAll.next(messages);
    });

    this.connection.on('CreateNewUserJoinNewGroup', (connectionID: string, groupName: string, name: string, groupMaxPlayers: string) => {
      this.httpService.createNewUserAndGroup(connectionID, groupName, name, groupMaxPlayers);
    });
    this.connection.on('updateOnlineUserList', (onlineUser: IOnlineUsers[]) => {
      this.onlineUser.next(onlineUser);
    });
    this.connection.on('updateGroupLeader', (onlineUser: IOnlineUsers) => {
      this.groupLeader.next(onlineUser);
    });
    this.connection.on("updatePlayersIdentities", (identity: string) => {
      this.identity.next(identity);
      this.GameOn.next(true);
    });
    this.connection.on("IdentitiesExplanation", (identitiesExplanation: string[]) => {
      this.identitiesExplanation.next(identitiesExplanation);
    });
    this.connection.on("getMaxPlayersInGroup", (maxPlayer: number) => {
      this.maxPlayer.next(maxPlayer);
    });
    this.connection.on("finishedViewIdentityAndWaitOnOtherPlayers", (wait: boolean) => {
      this.finishedViewIdentityOrNot.next(wait);
    });
    // state == InDisscussion, Disscussion modal triggered
    // state == Waiting, Microphone icron triggered
    this.connection.on("currentUserInDiscusstion", (state: string, inDiscusstionUserName: string) => {
      this.finishDisscussion.next(state);
      this.inDiscusstionUserName.next(inDiscusstionUserName);
    });
    this.connection.on("nextStep", (nextStep: INextStep) => {
      this.nextStep.next(nextStep);
    });
    this.connection.on("finishVoteWaitForOthersOrVoteResult", (waitState: boolean, result: string) => {
      this.finishVoteWaitForOthers.next(waitState);
      this.voteResult.next(result);
    });

    this.connection.on("PriestROTSNicoMeet", (ROTSName: string, priestName: string, NicodemusName: string) => {
      this.ROTSName.next(ROTSName);
      this.PriestName.next(priestName);
      this.NicodemusName.next(NicodemusName);
    });
    this.connection.on("PriestRound", () => {
      this.PriestMeetingRound.next(true);
      this.PriestRound.next(true);
    });
    this.connection.on("RulerOfTheSynagogueMeeting", () => {
      this.RulerOfTheSynagogue.next(true);
    });
    this.connection.on("NicoMeeting", () => {
      this.NicodemusMeetingRound.next(true);
    });

    this.connection.on("JudasCheckResult", (status: boolean) => {
      this.JudasCheckResult.next(status);
    });
    this.connection.on("updateExiledUsers", (user: IOnlineUsers[]) => {
      this.playerNotInGame.next(user);
    });
    this.connection.on("announceExile", (name: string) => {
      this.exileName.next(name);
    });
    this.connection.on("changeDay", (day: number) => {
      this.day.next(day);
    });
    this.connection.on("getAQuestion", (question: IQuestions) => {
      this.question.next(question);
    });
    this.connection.on("inAnswerQuestionName", (inAnswerQuestionName: string) => {
      this.inAnswerQuestionName.next(inAnswerQuestionName);
    });
  }

  public changePriestRoundStatus(status: boolean): void {
    this.PriestRound.next(status);
  }
}