import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject, tap, takeUntil, Subject } from 'rxjs';

import { SignalrService } from '../service/signalr.service';
import { HttpsCommService } from '../service/https-comm.service';
import { IQuestions } from '../interface/IQuestions';

@Component({
  selector: 'app-question-modal',
  templateUrl: './question-modal.component.html',
  styleUrls: ['./question-modal.component.css']
})
export class QuestionModalComponent implements OnInit, OnDestroy {
  SpiritualQuestion: IQuestions = {
    Id: "",
    question: {
      Q: "",
      A: "",
      B: "",
      C: "",
      D: "",
      An: "",
      Ex: undefined
    }
  };

  ACorrect: boolean = false;
  BCorrect: boolean = false;
  CCorrect: boolean = false;
  DCorrect: boolean = false;
  AWrong: boolean = false;
  BWrong: boolean = false;
  CWrong: boolean = false;
  DWrong: boolean = false;

  playerChoice: string = "";
  playerFinishChoice: boolean = false;
  playerChoiceCorrect: boolean = false;
  // playerFinishChoice: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // _playerFinishChoice: boolean = false;

  @Input() _groupName: string = "";
  @Input() _name: string = "";
  // @Input() gameFinished: Subject<boolean> = new Subject();

  private readonly unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private httpService: HttpsCommService,
    private singalrService: SignalrService) {

  }

  ngOnInit(): void {
    // this.gameFinished.subscribe(
    //   v => {
    //     this.reset();
    // });
    // this.playerFinishChoice.pipe(takeUntil(this.unsubscribe$)).subscribe((playerFinishChoice: boolean) => {
    //   this._playerFinishChoice = playerFinishChoice;
    // });
    this.singalrService.GameOn.pipe(tap((GameOn: boolean) => {
      if(!GameOn) {
        this.reset();
      }
    }), takeUntil(this.unsubscribe$)).subscribe();
    this.singalrService.question.pipe(takeUntil(this.unsubscribe$)).subscribe((question: IQuestions) => {
      this.SpiritualQuestion = question;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    console.log("Question modal Destroy");
  }

  conformAnswer() {
    this.playerFinishChoice = true;
    if(this.playerChoice == this.SpiritualQuestion.question.An) {
      this.playerChoiceCorrect = true;
      switch(this.playerChoice) {
        case 'A':
          this.ACorrect = true;
          break;
        case 'B':
          this.BCorrect = true;
          break;
        case 'C':
          this.CCorrect = true;
          break;
        case 'D':
          this.DCorrect = true;
          break;
      }
    } else {
      this.playerChoiceCorrect = false;
      switch(this.SpiritualQuestion.question.An) {
        case 'A':
          this.ACorrect = true;
          break;
        case 'B':
          this.BCorrect = true;
          break;
        case 'C':
          this.CCorrect = true;
          break;
        case 'D':
          this.DCorrect = true;
          break;
      }
      switch(this.playerChoice) {
        case 'A':
          this.AWrong = true;
          break;
        case 'B':
          this.BWrong = true;
          break;
        case 'C':
          this.CWrong = true;
          break;
        case 'D':
          this.DWrong = true;
          break;
      }
    }
  }

  increaseWeightOrNot() {
    this.ACorrect = false;
    this.BCorrect = false;
    this.CCorrect = false;
    this.DCorrect = false;
    this.AWrong = false;
    this.BWrong = false;
    this.CWrong = false;
    this.DWrong = false;
    this.playerFinishChoice = false;
    const initQuesiont = {
      Id: "",
      question: {
        Q: "",
        A: "",
        B: "",
        C: "",
        D: "",
        An: "",
        Ex: undefined
      }
    }
    this.singalrService.question.next(initQuesiont);
    this.httpService.spiritualQuestionAnsweredCorrectOrNot(this._groupName, this._name, this.playerChoiceCorrect);
    this.playerChoice = "";
    this.playerChoiceCorrect = false;
  }

  reset (){
    console.log("reset question modal");
  }
}
