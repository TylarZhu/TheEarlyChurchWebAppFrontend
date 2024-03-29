import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntil, Subject } from 'rxjs';

import { SignalrService } from '../service/signalr.service';
import { HttpsCommService } from '../service/https-comm.service';

@Component({
  selector: 'app-join-a-room',
  templateUrl: './join-a-room.component.html',
  styleUrls: ['./join-a-room.component.css']
})
export class JoinARoomComponent implements OnInit, OnDestroy {
  submitted = false;
  gourpDoesNotExists: boolean;
  groupIsFull: boolean
  nameIsDuplicate: boolean

  private unsubscribe$: Subject<void> = new Subject<void>();

  form: FormGroup = new FormGroup({
    name: new FormControl(""),
    groupName: new FormControl(""),
  });

  constructor(private singalrService: SignalrService,
    private http: HttpsCommService,
    private formBuilder: FormBuilder,
    private router: Router){
      this.form = this.formBuilder.group({
        name: ['', Validators.required],
        groupName: ['', Validators.required]
      });
      this.gourpDoesNotExists = false;
      this.groupIsFull = false;
      this.nameIsDuplicate = false;
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
    this.http.checkIfGroupExists(this.form.value.groupName).pipe(takeUntil(this.unsubscribe$))
    .subscribe(
      response => {
        // if game room exists
        if(response){
          this.http.checkIfGroupFull(this.form.value.groupName).pipe(takeUntil(this.unsubscribe$))
          .subscribe(
            response => {
              // if game room is not full
              if(!response) {
                this.http.checkIfUserNameInGroupDuplicate(this.form.value.groupName, this.form.value.name)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(
                  // if player's name is not duplicate
                  response => {
                    if(!response) {
                      this.singalrService.hubConnection.invoke("onConntionAndCreateGroup",this.form.value).then(
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
                      this.groupIsFull = false;
                      this.nameIsDuplicate = true;
                      this.gourpDoesNotExists = false;
                      
                      this.onReset();
                    }
                  }
                );
              }
              else {
                this.groupIsFull = true;
                this.nameIsDuplicate = false;
                this.gourpDoesNotExists = false;
                this.onReset();
              }
            }
          );
        } else {
          this.groupIsFull = false;
          this.nameIsDuplicate = false;
          this.gourpDoesNotExists = true;
          this.onReset();
        }
      }
    );
  }

  onReset(): void {
    this.submitted = false;
    this.form.reset();
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
