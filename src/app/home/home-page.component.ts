import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit, OnDestroy, AfterViewInit {
  imagePath: string = "../../assets/topicIcon.png";

  @ViewChild('backgroundAndDeveloperInfo', {read: ElementRef}) backgroundAndDeveloperInfo?: ElementRef;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // if(this.backgroundAndDeveloperInfo !== undefined){
    //   this.backgroundAndDeveloperInfo.nativeElement.click();
    // } else {
    //   console.log("backgroundAndDeveloperInfo is null!")
    // }
  }

  ngOnDestroy(): void {
  }
}
