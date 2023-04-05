import { Injectable } from '@angular/core';
import * as singalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  hubUrl: string;
  connection: singalR.HubConnection;

  constructor() {
    this.hubUrl = "https://localhost:7252/PlayerGroupsHub";
    this.connection = new singalR.HubConnectionBuilder().withUrl(this.hubUrl).withAutomaticReconnect().build();
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
    this.connection.on('ReceiveMessage', (message: string, type: string) => {
      console.log("The type of this message is: " + type);
      console.log("message is: " + message);
    });
  }
}