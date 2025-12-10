import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { TreatmentsService } from '../../_services/treatments.service';
import { SharedModule } from '../../share/shared.module';
import { ObjectService } from '../../_services/store.service';

@Component({
  selector: 'app-service-grouplist',
  standalone: true,
  imports: [SharedModule, RouterLink],
  templateUrl: './service-group-list.component.html',
  styleUrl: './service-group-list.component.css'
})
export class ServiceGrouplistComponent implements OnInit {

  constructor(
    private router: Router,
    private treatmentsService: TreatmentsService,
    private toastR: ToastrService,
    private objectService: ObjectService,
  ) { }

  itemCategory: any = [];

  ngOnInit(): void {
    if (this.checkAccess(1)) {
      this.getItemCategory();
    }
  }

  async getItemCategory() {
    let res: any = await this.treatmentsService.getItemCategory().toPromise();
    this.itemCategory = res;
  }

  goToNewService(id) {
    this.router.navigate(['/new-service-group', id]);
  }

  async deleteItemCategory(id) {
    Swal.fire({
      title: "آیا از حذف این گروه خدمت مطمئن هستید ؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      try {
        if (result.value) {
          let res: any = await this.treatmentsService.deleteItemCategory(id).toPromise();
          if (res['status'] == 0) {
            this.toastR.success('با موفقیت حذف گردید');
            this.getItemCategory();
          }
        }
      }
      catch {
        this.toastR.error('خطایی رخ داد', 'خطا!')
      }
    })
  }

  checkAccess(id) {
    return this.objectService.checkAccess(id);
  }
}
