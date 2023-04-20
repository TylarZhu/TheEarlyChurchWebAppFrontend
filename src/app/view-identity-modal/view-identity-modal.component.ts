import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-view-identity-modal',
  templateUrl: './view-identity-modal.component.html',
  styleUrls: ['./view-identity-modal.component.css']
})
export class ViewIdentityModalComponent {
  @Input() childAbilities: string[];
  @Input() identity: string;
  @Output("findViewIdentityReadyToPlay") findViewIdentityReadyToPlay: EventEmitter<any> = new EventEmitter();

  constructor(){
    this.childAbilities = [];
    this.identity = "";
  }
  finishedViewIdentity(){
    this.findViewIdentityReadyToPlay.emit();
  }
}
