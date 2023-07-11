import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Modal } from "bootstrap";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit, OnDestroy, AfterViewInit {
  joinARoomModal: Modal | undefined;
  createARoomModal: Modal | undefined;

  @ViewChild('backgroundAndDeveloperInfo', {read: ElementRef}) backgroundAndDeveloperInfo?: ElementRef;
  @ViewChild('gameHistory', {read: ElementRef}) gameHistory?: ElementRef;

  ngOnInit(): void {
    this.joinARoomModal = new window.bootstrap.Modal(
      document.getElementById('joinARoom')!, {
        keyboard: false
    });
    this.createARoomModal = new window.bootstrap.Modal(
      document.getElementById('createARoom')!, {
        keyboard: false
      }
    );
  }

  ngAfterViewInit(): void {
    if(this.backgroundAndDeveloperInfo !== undefined){
      this.backgroundAndDeveloperInfo.nativeElement.click();
    } else {
      console.log("backgroundAndDeveloperInfo is null!")
    }
  }

  openJoinARoomModal = () => {
    this.joinARoomModal?.show();
  }

  openCreateARoomModel = () => {
    this.createARoomModal?.show();
  }

  ngOnDestroy(): void {
    
  }

  nextModal() {
    console.log("nextMoal")
    this.gameHistory!.nativeElement.click();
  }
}
