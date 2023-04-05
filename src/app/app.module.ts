import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { HomePageComponent } from './home/home-page.component';
import { CreateARoomComponent } from './create-a-room/create-a-room.component';
import { JoinARoomComponent } from './join-a-room/join-a-room.component';
import { CopyrightComponent } from './copyright/copyright.component';
import { GameRoomComponent } from './game-room/game-room.component';

import { SignalrService } from './service/signalr.service';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomePageComponent,
    CreateARoomComponent,
    JoinARoomComponent,
    CopyrightComponent,
    GameRoomComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      {path: '', component: HomePageComponent},
      {path: 'gameRoom', component: GameRoomComponent}
    ])
  ],
  providers: [
    SignalrService,
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: (SignalrService: SignalrService) => () => SignalrService.initConnection(),
    //   deps: [SignalrService],
    //   multi: true
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
