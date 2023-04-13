import { Component, OnInit, OnDestroy } from '@angular/core';
import { Modal } from "bootstrap";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit, OnDestroy {
  joinARoomModal: Modal | undefined;
  createARoomModal: Modal | undefined;

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

  openJoinARoomModal = () => {
    this.joinARoomModal?.show();
  }

  openCreateARoomModel = () => {
    this.createARoomModal?.show();
  }

  ngOnDestroy(): void {
    
  }
}
