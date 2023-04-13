import { Injectable } from '@angular/core';
import * as singalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

import { IOnlineUsers } from '../interface/IOnlineUser'
import { IMessage } from '../interface/IMessage';
import { HttpsCommService } from './https-comm.service';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  hubUrl: string;
  connection: singalR.HubConnection;
  onlineUser: BehaviorSubject<IOnlineUsers[]>
  messagesToAll: BehaviorSubject<IMessage[]>
  groupLeader: BehaviorSubject<IOnlineUsers>

  constructor(private httpService: HttpsCommService) {
    const initUser: IOnlineUsers = {userId: "",
      connectionId: "",
      name: "",
      groupName: ""};
    this.hubUrl = "https://localhost:7252/PlayerGroupsHub";
    this.connection = new singalR.HubConnectionBuilder().withUrl(this.hubUrl).withAutomaticReconnect().build();
    this.onlineUser =  new BehaviorSubject<IOnlineUsers[]>([]);
    this.messagesToAll = new BehaviorSubject<IMessage[]>([]);
    this.groupLeader = new BehaviorSubject<IOnlineUsers>(initUser);
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
      // this.httpService.userLeaveTheGame(groupname);
      await this.initConnection();
    });
  }

  private setSignalrClientMethods(): void{
    this.connection.on('ReceiveMessages', (messages: IMessage[]) => {
      console.log(messages);
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

    

    // this.connection.on('leaveGroupUserConnectionId', (userId: string) => {
    //   this.httpService.userLeaveTheGame(userId);
    // });
  }
}