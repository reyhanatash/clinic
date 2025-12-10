import { Component } from '@angular/core';
import { ObjectService } from '../../../../_services/store.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../../_services/user.service';
import Swal from 'sweetalert2';
import { SharedModule } from '../../../../share/shared.module';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-role-list',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './user-role-list.component.html',
  styleUrl: './user-role-list.component.css'
})
export class UserRoleListComponent {

  roles: any;
  allowedLinks: any = [];
  constructor(
    private userService: UserService,
    private toastR: ToastrService,
    private objectService: ObjectService
  ) { }

  async ngOnInit() {
    this.allowedLinks = await this.objectService.getDataAccess();
    if (this.checkAccess(1)) {
      this.getRoles();
    } else {
      this.toastR.error("شما دسترسی به این صفحه ندارید");
    }
  }

  async getRoles() {
    try {
      let res: any = await this.userService.getRoles().toPromise();
      if (res.length > 0) {
        this.roles = res;
        this.roles.forEach((type: any) => {
          type.code = type.id;
        });
      }

    }
    catch { }
  }

  // deleteUser(userId) {
  //   Swal.fire({
  //     title: "آیا از حذف این نقش مطمئن هستید ؟",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonText: "بله انجام بده",
  //     cancelButtonText: "منصرف شدم",
  //     reverseButtons: false,
  //   }).then(async (result) => {
  //     try {
  //       let res: any = this.userService.deleteUser(userId).toPromise();
  //       if (res.status == 0) {
  //         this.toastR.success("با موفقیت حذف شد!");
  //         this.getRoles();
  //       }
  //     }
  //     catch {
  //       this.toastR.error('خطایی رخ داد', 'خطا!');
  //     }
  //   })
  // }

  checkAccess(id) {
    if (this.allowedLinks?.length > 0) {
      const item = this.allowedLinks.find(x => x.id === id);
      return item.clicked;
    } else {
      return false
    }
  }

}
