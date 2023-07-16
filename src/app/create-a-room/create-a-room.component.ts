import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { SignalrService } from '../service/signalr.service';
import { HttpsCommService } from '../service/https-comm.service';
import { takeUntil, Subject } from 'rxjs';


@Component({
  selector: 'app-create-a-room',
  templateUrl: './create-a-room.component.html',
  styleUrls: ['./create-a-room.component.css']
})
export class CreateARoomComponent implements OnInit, OnDestroy {

  form: FormGroup = new FormGroup({
    name: new FormControl(""),
    groupName: new FormControl(""),
    maxPlayerInGroup: new FormControl("")
  });
  submitted = false;
  options = [
    { name: "8", value: 8 },
    { name: "9", value: 9 },
    { name: "10", value: 10},
    { name: "11", value: 11},
    { name: "12", value: 12}
  ]
  isHidden: boolean;
  private unsubscribe$ = new Subject<void>();

  constructor(private singalrService: SignalrService,
    private http: HttpsCommService,
    private formBuilder: FormBuilder,
    private router: Router) {
      this.form = this.formBuilder.group({
        name: ['', Validators.required],
        groupName: ['', 
          Validators.required],
        maxPlayerInGroup: ['', Validators.required]
      });
      this.isHidden = false;
  }

  ngOnInit(): void {
    
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  onSubmit(): void{
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    this.http.checkIfGroupExists(this.form.value.groupName)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(
      response => {
        // if game room not exists
        if(!response){
          this.singalrService.hubConnection.invoke("onConntionAndCreateGroup",this.form.value)
          .then(
            () => {
              let gameRoom = this.form.value.groupName;
              let name = this.form.value.name;
              this.onReset();
              this.router.navigate(['/gameRoom', {groupName: gameRoom, name: name}]);
            }
          ).catch(
            (err: any) => console.log(`PlayerGroupsHub.onConntionAndCreateGroup() error: ${err}`)
          );
        } else {
          this.isHidden = true;
          this.onReset();
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onReset(): void {
    this.submitted = false;
    this.form.reset();
  }
}
