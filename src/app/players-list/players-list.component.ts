import { Component, Input, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpsCommService } from '../service/https-comm.service';

import { IOnlineUsers } from '../interface/IOnlineUser';
import { SignalrService } from '../service/signalr.service';
import { GameRoomComponent } from '../game-room/game-room.component';
import { tap } from 'rxjs';

@Component({
  selector: 'app-players-list',
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.css']
})
export class PlayersListComponent implements OnInit{

  @Input() childGroupName: string | null;
  @Input() childOnlineUser: IOnlineUsers[];
  @Input() childGroupLeader: IOnlineUsers;
  @Input() childName: string | null;
  @Input() childGameOn: boolean; 
  @Input() playerInGame: boolean;
  @Input() voteState: string;

  @ViewChild('waitOthersToVoteModel', {read: ElementRef}) waitOthersToVoteModel?: ElementRef;
  @ViewChild('closeWaitOthersToVoteModel', {read: ElementRef}) closePrepareToVoteModel?: ElementRef;

  votePersonName: string;
  conformToVote: boolean;
  exilePersonName: string;
  exileToVote: boolean;
  isPriest: boolean;
  PriestName: string;
  
  constructor(private httpService: HttpsCommService,
      private singalrService: SignalrService,
      private gameRoomComponent: GameRoomComponent){
    this.childGroupName = "";
    this.childOnlineUser = [];
    this.childGroupLeader = null!;
    this.childName = "";
    this.childGameOn = false;
    this.voteState = "";
    this.votePersonName = "";
    this.conformToVote = false;
    this.playerInGame = true;
    this.exilePersonName = "";
    this.exileToVote = false;
    this.isPriest = false;
    this.PriestName = "";
  }

  ngOnInit(): void {
    this.singalrService.finishVoteWaitForOthers.pipe(tap(
      finishVoteWaitForOthers => {
        if(finishVoteWaitForOthers) {
          if(this.waitOthersToVoteModel != null) {
            this.waitOthersToVoteModel.nativeElement.click();
          } else {
            console.log("waitOthersToVoteModel is null!");
          }
        } else {
          if(this.closePrepareToVoteModel != null) {
            this.closePrepareToVoteModel.nativeElement.click();
          } else {
            console.log("closePrepareToVoteModel is null!");
          }
        }
      })).subscribe();
    this.singalrService.PriestRound.subscribe((PriestRound: boolean) => {
      this.isPriest = PriestRound;
    });
    this.singalrService.PriestName.subscribe((PriestName: string) => {
      this.PriestName = PriestName;
    });
  }

  async assignNewGroupLeader(nextLeader: string):Promise<void> {
    await this.httpService.assignNextGroupLeader(this.childGroupName!, nextLeader, this.childGroupLeader.name);
  }

  exileHimOrHer(name: string, conformToExile: boolean) {
    this.votePersonName = name;
    if(conformToExile && this.playerInGame) {
      this.httpService.aboutToExileHimOrHer(this.childGroupName!, name);
    }
  }

  voteHimOrHer(name: string, conformToVote: boolean){
    this.votePersonName = name;
    if(conformToVote && this.playerInGame) {
      this.httpService.voteHimOrHer(this.childGroupName!, name, this.childName!);
      this.conformToVote = false;
    }
  }
}
