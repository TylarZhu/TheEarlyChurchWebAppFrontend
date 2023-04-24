import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { Router } from '@angular/router';

import { HttpsCommService } from '../service/https-comm.service';
import { IOnlineUsers } from '../interface/IOnlineUser';
import { SignalrService } from '../service/signalr.service'
import { IMessage } from '../interface/IMessage';
import { tap } from 'rxjs';
import { INextStep } from '../interface/INextStep';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css']
})
export class GameRoomComponent implements OnInit, AfterViewInit  {

  @ViewChild('viewMyIdentity', {read: ElementRef}) identityModal?: ElementRef;

  @ViewChild('waitingForOtherPlayers', {read: ElementRef}) waitingForOtherPlayersModal?: ElementRef;
  @ViewChild('closeWaitingForOtherPlayers', {read: ElementRef}) closeWaitingForOtherPlayers?: ElementRef;

  @ViewChild('waitingDiscussionModel', {read: ElementRef}) waitingDiscussionModel?: ElementRef;
  @ViewChild('closeWaitingDiscussionModel', {read: ElementRef}) closeWaitingDiscussionModel?: ElementRef;

  @ViewChild('discussionModel', {read: ElementRef}) discussionModel?: ElementRef;

  @ViewChild('prepareToVoteModel', {read: ElementRef}) prepareToVoteModel?: ElementRef;
  @ViewChild('closePrepareToVoteModel', {read: ElementRef}) closePrepareToVoteModel?: ElementRef;

  onlineUser: IOnlineUsers[];
  messages: IMessage[];
  groupName: string | null;
  name: string | null;
  groupLeader: IOnlineUsers;
  gameOn: boolean;
  MaxPlayer: number;
  identity: string;
  startGameShow: boolean;
  abilities: string[];
  day: number;
  daylightOrNight: string;
  nextStep: INextStep;
  discussionTopic: string;
  playerInGame: boolean;
  
  
  constructor(private httpService: HttpsCommService, 
    private route: ActivatedRoute,
    private singalrService: SignalrService,
    private router: Router){
      this.onlineUser = [];
      this.groupName = this.route.snapshot.paramMap.get('groupName');
      this.name = this.route.snapshot.paramMap.get('name');
      this.MaxPlayer = 0;
      this.messages = [];
      this.groupLeader = null!;
      this.gameOn = false;
      this.identity = "";
      this.startGameShow = false;
      this.abilities = [];
      this.day = 1;
      this.daylightOrNight = "Daylight";
      this.nextStep = null!;
      this.discussionTopic = "";
      this.playerInGame = true;
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
    this.singalrService.identitiesExplanation.pipe(tap(
      _ => {
        this.identityModal?.nativeElement.click();
      }
    )).subscribe((identitiesExplanation: string[]) => {
      this.abilities = identitiesExplanation
    });
    this.singalrService.nextStep.pipe(tap(
      nextStep => {
        this.prepareNextStep(nextStep);
      }
    )).subscribe((nextStep: INextStep) => {
      this.nextStep = nextStep;
    });

    this.singalrService.maxPlayer.pipe(tap( x => {
        if(x > 0 && x == this.onlineUser.length){
          this.startGameShow = true;
        }
      })).subscribe((maxPlayer: number) => {
        this.MaxPlayer = maxPlayer;
      }
    );

    this.singalrService.finishDisscussion.pipe(tap(
        finishDisscussion => {
          if(this.playerInGame) {
            if(finishDisscussion == "InDisscussion"){
              this.closeWaitingDiscussionModel?.nativeElement.click();
              this.discussionModel?.nativeElement.click();
            } else if(finishDisscussion == "FinishDisscussionWaitOthers") {
              this.waitingDiscussionModel?.nativeElement.click();
            } else {
              this.closeWaitingDiscussionModel?.nativeElement.click();
            }
          }
      })).subscribe();


    this.singalrService.finishedViewIdentityOrNot.pipe(tap(
      finishedViewIdentityOrNot => {
        if(finishedViewIdentityOrNot)
        {
          this.waitingForOtherPlayersModal?.nativeElement.click();
        } else {
          this.closeWaitingForOtherPlayers?.nativeElement.click();
        }
      })).subscribe();

    this.singalrService.playerInGame.subscribe((playerInGame: boolean) => {
      this.playerInGame = playerInGame;
    });
    this.singalrService.GameOn.subscribe((GameOn: boolean) => {
      this.gameOn = GameOn;
    });
    this.singalrService.identity.subscribe((identity: string) => {
      this.identity = identity;
    });
    
  }

  ngAfterViewInit(): void {
  }

  prepareNextStep(nextStep: INextStep): void{
    console.log(nextStep.nextStepName);
    if(nextStep.nextStepName == "discussing")
    {
      if(nextStep.options.length == 0)
      {
        this.discussionTopic = "Freely Disscuss";
      }
      else
      {
        this.discussionTopic = nextStep.options[0];
      }
    } else if(nextStep.nextStepName == "vote") {
      this.prepareToVoteModel?.nativeElement.click();
      setTimeout(() => {
        this.closePrepareToVoteModel?.nativeElement.click();
      }, 4000);
    }
  }
  
  showInOurGame():void {
    const inGame = document.getElementById('inGame');
    const outGame = document.getElementById('outGame');
    if(inGame && outGame) {
      
    }
  }

  async gameStart(): Promise<void> {
    let half = this.onlineUser.length / 2; 
    this.httpService.CreateAGame(this.groupName!, half);
  }

  finishedDiscussion() {
    this.httpService.whoIsDiscussing(this.groupName!, this.name!);
  }

  findViewIdentityReadyToPlay(): void {
    this.httpService.IdentityViewingState(this.groupName!, this.name!);
  }

  async userLeavesGroup(){
    await this.singalrService.connection.invoke("leaveGroup", this.groupName);
    this.httpService.userLeaveTheGame(this.groupName!, this.name!, this.gameOn);
    this.router.navigate(['/']);
  }
}
