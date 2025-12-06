import { AfterViewInit, Component } from '@angular/core';
import { TreatmentsService } from '../../../_services/treatments.service';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedModule } from '../../../share/shared.module';

@Component({
  selector: 'app-new-service-group',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './new-service-group.component.html',
  styleUrl: './new-service-group.component.css'
})
export class NewServiceGroupComponent implements AfterViewInit {

  constructor(
    private treatmentsService: TreatmentsService,
    private activeRoute: ActivatedRoute,
    private toastR: ToastrService,
    private router: Router

  ) { }

  model: any = [];
  editOrNew: number;
  itemCategory: any = [];

  async ngAfterViewInit(): Promise<void> {
    this.editOrNew = +this.activeRoute.snapshot.paramMap.get('id') || -1;
    await this.getItemCategory();
  }

  async saveItemCategory() {
    let model = {
      name: this.model.name,
      orderNo: this.model.orderNo,
      defaultClosed: this.model.defaultClosed,
      editOrNew: this.editOrNew
    }
    try {
      let res: any = await firstValueFrom(this.treatmentsService.saveItemCategory(model));
      if (res.status == 0) {
        this.toastR.success('با موفقیت ثبت شد!');
        this.router.navigate(['/service-group-list']);
      } else {
        this.toastR.error('خطایی رخ داده است');
      }
    } catch (error) {
      this.toastR.error('خطایی رخ داده است');
    }
  }

  async getItemCategory() {
    try {
      let res: any = await this.treatmentsService.getItemCategory().toPromise();
      this.itemCategory = res;
      if (this.editOrNew != -1) {
        let item = res.filter(x => x.id == this.editOrNew);
        this.model.name = item[0]['name'];
        this.model.orderNo = item[0]['orderNo'];
        this.model.defaultClosed = item[0]['defaultClosed'];
      }
    }
    catch { }
  }
}