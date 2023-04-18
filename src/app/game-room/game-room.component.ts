import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { Router } from '@angular/router';

import { HttpsCommService } from '../service/https-comm.service';
import { IOnlineUsers } from '../interface/IOnlineUser';
import { SignalrService } from '../service/signalr.service'
import { IMessage } from '../interface/IMessage';
import { tap } from 'rxjs';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css']
})
export class GameRoomComponent implements OnInit, AfterViewInit  {

  @ViewChild('viewMyIdentity', {read: ElementRef}) identityModal?: ElementRef;

  onlineUser: IOnlineUsers[];
  messages: IMessage[];
  number: number;
  groupName: string | null;
  name: string | null;
  groupLeader: IOnlineUsers;
  gameOn: boolean;
  MaxPlayer: number;
  identity: string;
  startGameShow: boolean;
  abilities: string[];

  
  constructor(private httpService: HttpsCommService, 
    private route: ActivatedRoute,
    private singalrService: SignalrService,
    private router: Router){
      this.onlineUser = [];
      this.number = 1;
      this.groupName = this.route.snapshot.paramMap.get('groupName');
      this.name = this.route.snapshot.paramMap.get('name');
      this.MaxPlayer = 0;
      this.messages = [];
      this.groupLeader = null!;
      this.gameOn = false;
      this.identity = "";
      this.startGameShow = false;
      this.abilities = [];
  }

  ngOnInit(): void {
    this.singalrService.onlineUser.pipe(tap(
      onlineUser => {
        if(onlineUser[0] != null && onlineUser[0].identity!= ""){
            onlineUser.forEach(x => {
            if(x.name == this.name){
              this.identity = x.identity;
            }
          });
          this.httpService.getIdentitiesExplanation(this.groupName!);
          this.identityModal?.nativeElement.click();
        }
      }
    )).subscribe((onlineUser: IOnlineUsers[]) => {
      this.onlineUser = onlineUser;
    });
    this.singalrService.messagesToAll.subscribe((messages: IMessage[]) => {
      this.messages = messages;
    });
    this.singalrService.groupLeader.subscribe((groupLeader: IOnlineUsers) =>{
      this.groupLeader = groupLeader;
    });
    this.singalrService.identitiesExplanation.subscribe((identitiesExplanation: string[]) => {
      this.abilities = identitiesExplanation
    });
    this.singalrService.maxPlayer.pipe(tap( x => {
      if(x > 0 && x == this.onlineUser.length){
        this.startGameShow = true;
      }
    })).subscribe((maxPlayer: number) => {
      this.MaxPlayer = maxPlayer;
    });
  }

  ngAfterViewInit(): void {
  }
  
  showInOurGame():void {
    const inGame = document.getElementById('inGame');
    const outGame = document.getElementById('outGame');
    if(inGame && outGame) {
      
    }
  }

  async gameStart(): Promise<void> {
    this.gameOn = true;
    let half = this.onlineUser.length / 2; 

    await this.httpService.CreateAGame(this.groupName!, half).subscribe(
      response => {
        
      }
    );
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
