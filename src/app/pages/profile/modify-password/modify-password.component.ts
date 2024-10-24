import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-modify-password',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './modify-password.component.html',
  styleUrl: './modify-password.component.scss'
})
export class ModifyPasswordComponent {

  isSent: boolean = false;
  validEmail: boolean = true;

  recoverPswForm = new FormGroup({
    email: new FormControl('', Validators.required),
  })

  constructor(private router: Router) {}

  send() {
    //Send the request to the server
    const email = this.recoverPswForm.get('email')?.value;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(emailRegex.test(email!)) {
      this.validEmail = true;
      this.isSent = true;
    }
    else {
      this.validEmail = false;
    }
  }

}
