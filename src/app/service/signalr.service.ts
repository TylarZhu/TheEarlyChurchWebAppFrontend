import { Injectable } from '@angular/core';
import * as singalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

import { IOnlineUsers } from '../interface/IOnlineUser'
import { IMessage } from '../interface/IMessage';
import { HttpsCommService } from './https-comm.service';
import { INextStep } from '../interface/INextStep';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  hubUrl: string;
  connection: singalR.HubConnection;
  onlineUser: BehaviorSubject<IOnlineUsers[]>;
  messagesToAll: BehaviorSubject<IMessage[]>;
  identitiesExplanation: BehaviorSubject<string[]>;
  groupLeader: BehaviorSubject<IOnlineUsers>;
  maxPlayer: BehaviorSubject<number>;
  finishedViewIdentityOrNot: BehaviorSubject<boolean>;
  finishDisscussion: BehaviorSubject<string>;
  nextStep: BehaviorSubject<INextStep>;

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
    this.connection.on("updatePlayersIdentities", (onlineUser: IOnlineUsers[]) => {
      this.onlineUser.next(onlineUser);
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
    this.connection.on("currentUserInDiscusstion", (finishDisscussion: string) => {
      this.finishDisscussion.next(finishDisscussion);
    });
    this.connection.on("nextStep", (nextStep: INextStep) => {
      this.nextStep.next(nextStep);
    });

    // this.connection.on('leaveGroupUserConnectionId', (userId: string) => {
    //   this.httpService.userLeaveTheGame(userId);
    // });
  }
}