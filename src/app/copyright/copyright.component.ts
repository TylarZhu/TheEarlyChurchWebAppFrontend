import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { SignalrService } from '../service/signalr.service';

@Component({
  selector: 'app-copyright',
  templateUrl: './copyright.component.html',
  styleUrls: ['./copyright.component.css']
})
export class CopyrightComponent implements OnInit, OnDestroy {
  currentYear: number = Date.now();

  startReconnection: boolean = false;

  private readonly unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private signalrService: SignalrService) {
  }

 ngOnInit(): void {
  this.signalrService.startReconnection.pipe(takeUntil(this.unsubscribe$)).subscribe((startReconnection: boolean) => {
    this.startReconnection = startReconnection;
  });
 }

 ngOnDestroy(): void {
  this.unsubscribe$.next();
  this.unsubscribe$.complete();
  console.log("Home destory");
 }
}
