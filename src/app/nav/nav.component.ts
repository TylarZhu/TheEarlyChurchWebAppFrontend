import { Component } from '@angular/core';

import { SignalrService } from '../service/signalr.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  constructor(private singalrService: SignalrService){

  }
}
