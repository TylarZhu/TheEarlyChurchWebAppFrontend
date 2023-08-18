import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CountdownModule } from 'ngx-countdown';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { HomePageComponent } from './home/home-page.component';
import { CreateARoomComponent } from './create-a-room/create-a-room.component';
import { JoinARoomComponent } from './join-a-room/join-a-room.component';
import { CopyrightComponent } from './copyright/copyright.component';
import { GameRoomComponent } from './game-room/game-room.component';
import { PlayersListComponent } from './players-list/players-list.component';

import { SignalrService } from './service/signalr.service';
import { HttpsCommService } from './service/https-comm.service';
import { ViewIdentityModalComponent } from './view-identity-modal/view-identity-modal.component';
import { GameHistoryComponent } from './game-history/game-history.component';
import { QuestionModalComponent } from './question-modal/question-modal.component';
import { GameMessageHistoryComponent } from './game-message-history/game-message-history.component';
import { NightWaitingModelComponent } from './night-waiting-model/night-waiting-model.component';

import { NgbModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { InfoModalComponent } from './info-modal/info-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomePageComponent,
    CreateARoomComponent,
    JoinARoomComponent,
    CopyrightComponent,
    GameRoomComponent,
    PlayersListComponent,
    ViewIdentityModalComponent,
    GameHistoryComponent,
    QuestionModalComponent,
    GameMessageHistoryComponent,
    NightWaitingModelComponent,
    InfoModalComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    CountdownModule,
    RouterModule.forRoot([
      {path: '', component: HomePageComponent},
      {path: 'home', component: HomePageComponent},
      {path: 'gameRoom', component: GameRoomComponent}
    ], {useHash: true}),
    NgbModule,
    NgbCollapseModule
  ],
  providers: [
    SignalrService,
    HttpsCommService,
    {
      provide: APP_INITIALIZER,
      useFactory: (SignalrService: SignalrService) => () => SignalrService.initConnection(),
      deps: [SignalrService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
