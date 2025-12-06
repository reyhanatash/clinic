import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TreatmentsService } from './../../../_services/treatments.service';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { SharedModule } from '../../../share/shared.module';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [SharedModule, RouterLink],
  templateUrl: './service-list.component.html',
  styleUrl: './service-list.component.css'
})
export class ServiceListComponent implements OnInit {

  constructor(
    private router: Router,
    private treatmentsService: TreatmentsService,
    private toastR: ToastrService
  ) { }

  serviceList: any = [];

  ngOnInit(): void {
    this.getBillableItems();
  }

  async getBillableItems() {
    try {
      let res = await this.treatmentsService.getBillableItems().toPromise();
      this.serviceList = res;
    }
    catch {
    }
  }

  goToNewService(id) {
    this.router.navigate(['/new-service', id]);
  }

  async deleteBillableItem(id) {
    Swal.fire({
      title: "آیا از حذف این خدمت مطمئن هستید ؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      try {
        if (result.value) {
          let res: any = await this.treatmentsService.deleteBillableItem(id).toPromise();
          if (res['status'] == 0) {
            this.toastR.success('با موفقیت حذف گردید');
            this.getBillableItems();
          }
        }
      }
      catch {
        this.toastR.error('خطایی رخ داد', 'خطا!')
      }
    })
  }
}