import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TreatmentsService } from '../../../../_services/treatments.service';
import { ToastrService } from 'ngx-toastr';
import { ObjectService } from '../../../../_services/store.service';
import Swal from 'sweetalert2';
import { SharedModule } from '../../../../share/shared.module';

@Component({
  selector: 'app-treatment-template-list',
  standalone: true,
  imports: [SharedModule,RouterLink],
  templateUrl: './treatment-template-list.component.html',
  styleUrl: './treatment-template-list.component.css'
})
export class TreatmentTemplateListComponent implements OnInit {

  constructor(
    private router: Router,
    private treatmentsService: TreatmentsService,
    private toastR: ToastrService,
    private objectService: ObjectService
  ) { }

  itemList: any = [];
  allowedLinks: any = [];

  async ngOnInit() {
    this.allowedLinks = await this.objectService.getDataAccess();
    if (this.checkAccess(1)) {
      this.getTreatmentTemplate();
    } else {
      this.toastR.error("شما دسترسی به این صفحه ندارید");
    }
  }

  async getTreatmentTemplate() {
    try {
      let model = {
        id: null
      }
      let res: any = await this.treatmentsService.getTreatmentTemplates(model).toPromise();
      if (res.length > 0) {
        this.itemList = res;
      }
    }
    catch { }
  }


  goToEdit(id) {
    this.router.navigate(['/treatment-template', id]);
  }

  async deleteItem(id) {
    Swal.fire({
      title: "آیا از حذف این قالب مطمئن هستید ؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      try {
        if (result.value) {
          let res: any = await this.treatmentsService.deleteTreatmentTemplate(id).toPromise();
          if (res['status'] == 0) {
            this.toastR.success('با موفقیت حذف گردید');
            this.getTreatmentTemplate();
          }
        }
      }
      catch {
        this.toastR.error('خطایی رخ داد', 'خطا!')
      }
    })
  }

  checkAccess(id) {
    if (this.allowedLinks?.length > 0) {
      const item = this.allowedLinks.find(x => x.id === id);
      return item.clicked;
    } else {
      return false
    }
  }

}