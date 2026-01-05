import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../_services/user.service';
import { ObjectService } from '../../_services/store.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  model: any = [];
  token: any;
  constructor(
    private userService: UserService,
    private router: Router,
    private toastR: ToastrService,
    private objectService: ObjectService
  ) { }

  ngOnInit() {
  }
  ngAfterViewInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.router.navigate(['/appointment']);

    }
  }

  async login() {
    try {
      if (this.model.userName && this.model.password) {
        let data = {
          Username: this.model.userName,
          Password: this.model.password
        }
        let res: any = await this.userService.login(data).toPromise();
        if (res.token && res.secretCode) {
          localStorage.setItem("token", res.token);
          localStorage.setItem("userName", this.model.userName);
          localStorage.setItem('xP98_g#d94H0w', res.secretCode);
          this.getUserRole();
          localStorage.setItem('fullName', res.userName);
          this.router.navigate(["/appointment"]);
        }
      }
      else if (this.model.userName && !this.model.password) {
        this.toastR.error('خطا', 'رمز عبور را وارد نمایید')
      }
      else {
        this.toastR.error('خطا', 'نام کاربری و رمز عبور را وارد نمایید')
      }
    }
    catch (ex) {
      let msg = ex.error.exceptionMessage;
      if (msg == 'Invalid username or password.') {
        this.toastR.error('خطا', 'نام کاربری یا رمز عبور اشتباه است ');
      }
    }
  }


  handleKeyUp(event) {
    if (event.key === 'Enter') {
      this.login()
    }
  }

  async getUserRole() {
    let res: any = await this.userService.getUserRole().toPromise();
    localStorage.setItem("userId", res[0].id);
    this.objectService.setData(res[0]);
  }
}
