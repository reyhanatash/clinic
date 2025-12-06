import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../_services/user.service';
import { SharedModule } from '../../share/shared.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent implements OnInit {

  model: any = [];
  token: any;

  constructor(
    private userService: UserService,
    private router: Router,
    private toastR: ToastrService
  ) { }

  ngOnInit(): void {
    this.model.userName = localStorage.getItem('userName');
  }

  async changePassword() {
    try {
      if (!this.model.userName) {
        this.toastR.error('خطا', ' نام کاربری را وارد نمایید');
        return
      }
      let data = {
        username: this.model.userName,
        oldPassword: this.model.oldPassword,
        newPassword: this.model.newPassword
      }
      await this.userService.changePassword(data).toPromise();
      localStorage.setItem("userName", this.model.userName);
      this.toastR.success('رمز عبور جدید ثبت شد');
      this.router.navigate(["/appointment"]);
    }
    catch { }
  }


}
