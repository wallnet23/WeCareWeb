import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IpInfoConnectService } from '../../../services/ip-info-connect.service';
import { ConnectServerService } from '../../../services/connect-server.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  valid: boolean = true;
  toggled: boolean = true;
  type: string = 'password'

  loginForm = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  })

  constructor(private router: Router, private ipInfoConnectService: IpInfoConnectService,
     private authService: AuthService) { }

  async login() {

    this.ipInfoConnectService.getLanguage().subscribe((val) => {
      //console.log(val)
    });
    // try {
    await this.authService.loginUser(
      this.loginForm.get('email')?.value!,
      this.loginForm.get('password')?.value!);
    if (this.authService.getToken() != null) {
      this.router.navigate(['/batterySystem']);
    }
    // } catch (error) {
    //   console.error('Login failed', error);
    // }
  }

  seePassword() {
    if (this.type === 'password') {
      this.type = 'text';
      this.toggled = false;
    }
    else {
      this.type = 'password';
      this.toggled = true;
    }
  }

}

