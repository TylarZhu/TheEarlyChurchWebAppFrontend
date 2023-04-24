import { Component, Input, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpsCommService } from '../service/https-comm.service';

import { IOnlineUsers } from '../interface/IOnlineUser';
import { SignalrService } from '../service/signalr.service';
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
  @Input() voteState: string
  @Input() playerInGame: boolean

  @ViewChild('waitOthersToVoteModel', {read: ElementRef}) waitOthersToVoteModel?: ElementRef;
  @ViewChild('closeWaitOthersToVoteModel', {read: ElementRef}) closePrepareToVoteModel?: ElementRef;

  @ViewChild('voteResultModel', {read: ElementRef}) voteResultModel?: ElementRef;
  @ViewChild('closeVoteResultModel', {read: ElementRef}) closeVoteResultModel?: ElementRef;

  votePersonName: string;
  conformToVote: boolean;
  voteResult: string;
  
  
  constructor(private httpService: HttpsCommService,
      private singalrService: SignalrService){
    this.childGroupName = "";
    this.childOnlineUser = [];
    this.childGroupLeader = null!;
    this.childName = "";
    this.childGameOn = false;
    this.voteState = "";
    this.votePersonName = "";
    this.conformToVote = false;
    this.playerInGame = true;
    this.voteResult = "";
  }

  ngOnInit(): void {
    this.singalrService.finishVoteWaitForOthers.pipe(tap(
      finishVoteWaitForOthers => {
        if(finishVoteWaitForOthers) {
          this.waitOthersToVoteModel?.nativeElement.click();
        } else {
          this.closePrepareToVoteModel?.nativeElement.click();
          this.showVoteResult();
        }
      })).subscribe();

    this.singalrService.voteResult.subscribe((voteResult: string) => {
      this.voteResult = voteResult;
    });
  }

  async assignNewGroupLeader(nextLeader: string):Promise<void> {
    await this.httpService.assignNextGroupLeader(this.childGroupName!, nextLeader, this.childGroupLeader.name);
  }

  showVoteResult() {
    this.voteResultModel?.nativeElement.click();
    setTimeout(() => {
      this.closeVoteResultModel?.nativeElement.click();
    }, 4000);
  }

  async voteHimOrHer(name: string, conformToVote: boolean){
    this.votePersonName = name;
    if(conformToVote && this.playerInGame) {
      this.httpService.voteHimOrHer(this.childGroupName!, name, this.childName!);
    }
  }
}
