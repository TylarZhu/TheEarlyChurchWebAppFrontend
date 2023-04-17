import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { Router } from '@angular/router';

import { HttpsCommService } from '../service/https-comm.service';
import { IOnlineUsers } from '../interface/IOnlineUser';
import { SignalrService } from '../service/signalr.service'
import { IMessage } from '../interface/IMessage';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css']
})
export class GameRoomComponent implements OnInit  {

  onlineUser: IOnlineUsers[];
  messages: IMessage[];
  number: number;
  groupName: string | null;
  name: string | null;
  groupLeader: IOnlineUsers;
  gameOn: boolean;
  

  
  constructor(private httpService: HttpsCommService, 
    private route: ActivatedRoute,
    private singalrService: SignalrService,
    private router: Router){
      this.onlineUser = [];
      this.number = 1;
      this.groupName = this.route.snapshot.paramMap.get('groupName');
      this.name = this.route.snapshot.paramMap.get('name');
      this.messages = [];
      this.groupLeader = null!;
      this.gameOn = false;
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
  }
  
  showInOurGame():void {
    const inGame = document.getElementById('inGame');
    const outGame = document.getElementById('outGame');
    if(inGame && outGame) {
      
    }
  }

  async assignNewGroupLeader(nextLeader: string):Promise<void> {
    await this.httpService.assignNextGroupLeader(this.groupName!, nextLeader, this.groupLeader.name);
  }

  gameStart(): void{
    this.gameOn = true;
  }

  async userLeavesGroup(){
    await this.singalrService.connection.invoke("leaveGroup", this.groupName);
    await this.httpService.userLeaveTheGame(this.groupName!, this.name!, this.gameOn).then(
      response => {
        console.log("DELETE call successful value returned in body", response);
      }
    );
    this.router.navigate(['/']);
  }
}
