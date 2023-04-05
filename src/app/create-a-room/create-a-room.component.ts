import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { SignalrService } from '../service/signalr.service';


@Component({
  selector: 'app-create-a-room',
  templateUrl: './create-a-room.component.html',
  styleUrls: ['./create-a-room.component.css']
})
export class CreateARoomComponent implements OnInit {

  form: FormGroup = new FormGroup({
    userName: new FormControl(""),
    groupName: new FormControl(""),
    numberOfPlayers: new FormControl("")
  });
  submitted = false;
  options = [
    { name: "8", value: 8 },
    { name: "9", value: 9 },
    { name: "10", value: 10},
    { name: "11", value: 11},
    { name: "12", value: 12}
  ]

  constructor(public singalrService: SignalrService, 
    private formBuilder: FormBuilder,
    private router: Router) {
      this.form = this.formBuilder.group({
        username: ['', Validators.required],
        groupName: ['', 
          Validators.required],
          // Validators.minLength(1), 
          // Validators.maxLength(10)],
        numberOfPlayers: ['', Validators.required]
      });
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
    console.log(JSON.stringify(this.form.value));
    // this.singalrService.connection.invoke("onConntionAndCreateGroup",this.form.value).catch(
    //     (err: any) => console.log(`PlayerGroupsHub.onConntionAndCreateGroup() error: ${err}`));
    this.onReset();
    this.router.navigate(['/gameRoom']);
  }

  onReset(): void {
    this.submitted = false;
    this.form.reset();
  }
}
