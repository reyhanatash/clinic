import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { SharedModule } from '../../../share/shared.module';
import { MainService } from '../../../_services/main.service';

@Component({
  selector: 'app-business-list',
  standalone: true,
  imports: [SharedModule, RouterLink],
  templateUrl: './business-list.component.html',
  styleUrl: './business-list.component.css'
})
export class BusinessListComponent implements OnInit {

  constructor(
    private router: Router,
    private mainService: MainService,
    private toastR: ToastrService
  ) { }

  clinicsList: any = [];

  ngOnInit(): void {
    this.getBusinesses();
  }

  async getBusinesses() {
    try {
      let res = await this.mainService.getBusinesses().toPromise();
      this.clinicsList = res;
    }
    catch {
    }
  }

  goToNewBusiness(id) {
    this.router.navigate(['/new-business', id]);
  }

  async deleteBusiness(id) {
    Swal.fire({
      title: "آیا از حذف این مکان مطمئن هستید ؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      try {
        if (result.value) {
          let res: any = await this.mainService.deleteBusiness(id).toPromise();
          if (res['status'] == 0) {
            this.toastR.success('با موفقیت حذف گردید');
            this.getBusinesses();
          }
        }
      }
      catch {
        this.toastR.error('خطایی رخ داد', 'خطا!')
      }
    })
  }
}