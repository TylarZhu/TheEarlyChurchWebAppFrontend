import { Component, OnDestroy, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CountdownComponent, CountdownConfig, CountdownEvent } from "ngx-countdown";
import { Subject, takeUntil } from 'rxjs';

import { SignalrService } from '../service/signalr.service';

@Component({
  selector: 'app-view-identity-modal',
  templateUrl: './view-identity-modal.component.html',
  styleUrls: ['./view-identity-modal.component.css']
})
export class ViewIdentityModalComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() _groupName: string = "";
  @Input() _name: string = "";

  @ViewChild('cd', { static: false }) private countdown?: CountdownComponent;
  @ViewChild('closeViewIdentityModal', {read: ElementRef}) closeViewIdentityModal?: ElementRef;

  identity: string = "";
  abilities: string[] = [];
  private readonly unsubscribe$: Subject<void> = new Subject<void>();

  config: CountdownConfig = {
    leftTime: 90,
    format: 'm:ss',
    demand: true
  };

  constructor(private singalrService: SignalrService){

  }

  ngOnInit(): void {
    this.singalrService.identity.pipe(takeUntil(this.unsubscribe$)).subscribe((identity: string) => {
      this.identity = identity;
    });
    this.singalrService.identitiesExplanation.pipe(takeUntil(this.unsubscribe$)).subscribe((identitiesExplanation: string[]) => {
      this.abilities = identitiesExplanation
    });
  }

  ngAfterViewInit(): void {
    
  }

  startCd(): void {
    if(this.countdown !== undefined) {
      this.countdown.begin();
    } else {
      console.log("countdown is undefined!");
    }
  }


  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    console.log("view identity modal destory");
  }

  handleEvent(e: CountdownEvent) {
    if(e.action === 'done') {
      if(this.countdown !== undefined) {
        this.countdown.restart();
      }
      if(this.closeViewIdentityModal !== undefined) {
        this.closeViewIdentityModal.nativeElement.click();
      }
      this.singalrService.hubConnection.invoke("IdentityViewingState", this._groupName, this._name);
    }
  }

  finishedViewIdentity(){
    if(this.countdown !== undefined) {
      this.countdown.restart();
    }
    this.singalrService.hubConnection.invoke("IdentityViewingState", this._groupName, this._name);
  }
}
