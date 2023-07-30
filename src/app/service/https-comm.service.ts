import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { IOnlineUsers } from '../interface/IOnlineUser';
import { Observable, firstValueFrom } from 'rxjs';
import { IGroupInfo } from '../interface/IGroupInfo'; 

@Injectable({
  providedIn: 'root'
})
export class HttpsCommService {
  huburl: string;
  inGameUrl: string;

  constructor(private http: HttpClient) { 
    this.huburl = "https://localhost:7252/HubRequest";
    this.inGameUrl = "https://localhost:7252/InGame";
    // this.huburl = "https://theearlychurchgame.azurewebsites.net/HubRequest";
    // this.inGameUrl = "https://theearlychurchgame.azurewebsites.net/InGame";
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
    this.http.post<IGroupInfo>(this.huburl + "/onlineUser", 
      body,
      {headers}
    ).subscribe(
      response => {
      }
    );
  }

  public userLeaveTheGame(groupName: string, userName: string, gameOn: boolean): void{

      this.http.delete<IOnlineUsers>(
        this.huburl + "/userLeaveTheGame/" + groupName + "/" + userName + "/" + gameOn)
        .subscribe(response => {
        }
      );
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

  public assignNextGroupLeader(groupName: string, nextGroupLeader: string, originalGroupLeader: string): void{
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.http.post<IOnlineUsers>(
      this.huburl + "/assignNextGroupLeader/" + groupName + "/" + nextGroupLeader + "/" + originalGroupLeader,
      {},
      {headers}
    ).subscribe(
      response => {
      }
    ); 
  }

  public CreateAGame(groupName: string): void {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.http.post<IOnlineUsers>(
      this.inGameUrl + "/CreateAGame/" + groupName,
      {},
      {headers}
    ).subscribe(response => {
    }); 
  }

  public getMaxPlayersInGroup(groupName: string): void {
    this.http.get<void>(this.huburl + "/GetMaxPlayersInGroup/" + groupName).subscribe(
      response => {

      }
    );
  }

  public IdentityViewingState(groupName: string, name: string): void{
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.http.post<IOnlineUsers>(
      this.inGameUrl + "/IdentityViewingState/" + groupName + "/" + name,
      {},
      {headers}
    ).subscribe(
      response => {
      }
    ); 
  }

  public whoIsDiscussing(groupName: string): void{
    this.http.get(this.inGameUrl + "/WhoIsDiscussing" + "/" + groupName).subscribe();
  }

  public voteHimOrHer(groupName: string, voteName: string, fromWho: string): void{
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.http.post(this.inGameUrl + "/voteHimOrHer" + "/" + groupName + "/" + voteName + "/" + fromWho,
    {},
    {headers}).subscribe(
      response => {
      }
    );
  }

  public assignPriestAndRulerOfTheSynagogue(groupName: string): void {
    this.http.get(this.inGameUrl + "/assignPriestAndRulerOfTheSynagogue" + "/" + groupName).subscribe();
  }

  public aboutToExileHimOrHer(groupName: string, exileName: string): void{
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.http.put(this.inGameUrl + "/aboutToExileHimOrHer" + "/" + groupName + "/" + exileName, 
    {},
    {headers}).subscribe(
      response => {
      }
    );
  }

  public NicodemusAction(groupName: string, saveOrNot: boolean): void {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.http.put(this.inGameUrl + "/NicodemusAction" + "/" + groupName + "/" + saveOrNot, 
    {},
    {headers}).subscribe(
      response => {
      }
    );
  }

  public FireHimOrHer(groupName: string, firePerson: string): void {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.http.put(this.inGameUrl + "/JohnFireRound" + "/" + groupName + "/" + firePerson + "/" + true, 
    {},
    {headers}).subscribe(
      response => {
      }
    );
  }

  public JudasCheckRound(groupName: string, checkPerson: string): void {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.http.put(this.inGameUrl + "/JudasCheckRound" + "/" + groupName + "/" + checkPerson, 
    {},
    {headers}).subscribe(
      response => {
      }
    );
  }
  
  public NightRoundEnd(groupName: string): void{
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.http.put(this.inGameUrl + "/NightRoundEnd" + "/" + groupName, 
    {},
    {headers}).subscribe(
      response => {
      }
    );
  }

  public finishedToViewTheExileResult(groupName: string, name: string): void {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.http.post(this.inGameUrl + "/finishedToViewTheExileResult" + "/" + groupName + "/" + name, 
    {},
    {headers}).subscribe(
      response => {
      }
    );
  }

  public spiritualQuestionAnsweredCorrectOrNot(groupName: string, name: string, playerChoiceCorrectOrNot: boolean): void {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.http.post(this.inGameUrl + "/spiritualQuestionAnsweredCorrectOrNot" + "/" + groupName + "/" + name + "/" + playerChoiceCorrectOrNot, 
    {},
    {headers}).subscribe(
      response => {
      }
    );
  }

  public JudasMeetWithPriest(groupName: string, name: string) {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.http.post(this.inGameUrl + "/JudasMeetWithPriest" + "/" + groupName + "/" + name, 
    {},
    {headers}).subscribe(
      response => {
      }
    );
  }

  // public userLeaveTheGameByConnectionId(connectionId: string | null) {
  //   console.log(connectionId);
  //   if(connectionId !== null) {
  //     this.http.delete(this.huburl + "/userLeaveTheGameByConnectionId/" + connectionId).subscribe();
  //   }
  // }

  // user refresh page or close tab methods
  public PriestRoundStateFinish(groupName: string) {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    this.http.post(this.inGameUrl + "/PriestRound" + "/" + groupName, 
    {},
    {headers}).subscribe(
      response => {
      }
    );
  }
}
