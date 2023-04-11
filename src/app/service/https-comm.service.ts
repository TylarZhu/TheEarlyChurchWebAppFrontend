import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { first } from 'rxjs/operators';

import { IOnlineUsers } from '../interface/IOnlineUser';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpsCommService {
  huburl: string;
  

  constructor(private http: HttpClient) { 
    this.huburl = "https://localhost:7252/HubRequest";
    
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
}
