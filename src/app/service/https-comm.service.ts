import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

import { IOnlineUsers } from '../interface/IOnlineUser';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpsCommService {
  huburl: string;
  // groupLeader: BehaviorSubject<boolean>
  // groupLeaderName: BehaviorSubject<string>
  

  constructor(private http: HttpClient) { 
    this.huburl = "https://localhost:7252/HubRequest";
    // this.groupLeader = new BehaviorSubject<boolean>(false);
    // this.groupLeaderName = new BehaviorSubject<string>("");
  }

  public createNewUserAndGroup(connectionId: string, groupName: string, username: string, groupMaxPlayers: string): void {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    var body = {"connectionId": connectionId, 
      "name": username, 
      "groupName": groupName, 
      "maxPlayerInGroup": groupMaxPlayers};
      if(body.maxPlayerInGroup == null) {
        body.maxPlayerInGroup = "";
      }

    console.log(body);

    this.http.post(this.huburl + "/onlineUser", 
      body,
      {headers}
    ).subscribe(
      response => {
        console.log(response);
        this.checkIfUserIsGroupLeader(groupName, username).subscribe(
          response => {
            // this.groupLeader.next(response);
            // if(response){
            //   this.groupLeaderName.next(username);
            // }
          }
        );
      }
    );
  }

  public userLeaveTheGame(groupName: string, userName: string): Promise<IOnlineUsers>{
    return firstValueFrom(this.http.delete<IOnlineUsers>(this.huburl + "/userLeaveTheGame/" + groupName + "/" + userName));
  }

  public checkIfGroupExists(groupName: string): Observable<boolean> {
    return this.http.get<boolean>(this.huburl + "/checkIfGroupExists/" + groupName);
  }

  public checkIfGroupFull(groupName: string): Observable<boolean> {
    return this.http.get<boolean>(this.huburl + "/checkIfGroupIsFull/" + groupName);
  }

  public checkIfUserNameInGroupDuplicate(groupName: string, userName: string): Observable<boolean> {
    return this.http.get<boolean>(this.huburl + "/checkIfUserNameInGroupDuplicate/" + groupName + "/" + userName);
  }

  public checkIfUserIsGroupLeader(groupName: string, userName: string): Observable<boolean> {
    return this.http.get<boolean>(this.huburl + "/checkIfUserIsGroupLeader/" + groupName + "/" + userName);
  }
}
