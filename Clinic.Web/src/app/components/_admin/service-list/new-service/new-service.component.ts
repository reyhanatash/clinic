import { AfterViewInit, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { ColorPickerModule } from 'primeng/colorpicker';
import { SharedModule } from '../../../../share/shared.module';
import { TreatmentsService } from '../../../../_services/treatments.service';

@Component({
  selector: 'app-new-service',
  standalone: true,
  imports: [SharedModule, ColorPickerModule],
  templateUrl: './new-service.component.html',
  styleUrl: './new-service.component.css'
})
export class NewServiceComponent implements AfterViewInit {

  constructor(
    private treatmentsService: TreatmentsService,
    private activeRoute: ActivatedRoute,
    private toastR: ToastrService,
    private router: Router

  ) { }

  model: any = [];
  serviceList: any = [];
  editOrNew: number;
  treatmentList: any = [];
  itemCategory: any = [];
  billableItems: any = [];
  
  async ngAfterViewInit(): Promise<void> {
    this.editOrNew = +this.activeRoute.snapshot.paramMap.get('id') || -1;
    await this.getItemCategory();
    await this.getTreatmentTemplates();
    await this.getBillableItems();
  }

  async saveBillableItem() {
    let model = {
      code: this.model.code,
      name: this.model.name,
      price: +this.model.price,
      isOther: false,
      duration: this.model.duration,
      allowEditPrice: this.model.allowEditPrice,
      treatmentTemplateId: this.model.treatmentTemplateId?.id,
      forceOneInvoice: this.model.forceOneInvoice,
      isTreatmentDataRequired: this.model.isTreatmentDataRequired,
      parentId: this.model.parentId?.id,
      itemCategoryId: this.model.itemCategoryId?.id,
      orderInItemCategory: this.model.orderInItemCategory,
      autoCopyTreatment: this.model.autoCopyTreatment,
      needAccept: this.model.needAccept,
      lastTimeColor: this.model.lastTimeColor,
      editOrNew: this.editOrNew
    }
    try {
      let res: any = await firstValueFrom(this.treatmentsService.saveBillableItem(model));
      if (res.status == 0) {
        this.toastR.success('با موفقیت ثبت شد!');
        this.router.navigate(['/service-list']);
      } else {
        this.toastR.error('خطایی رخ داده است');
      }
    } catch (error) {
      this.toastR.error('خطایی رخ داده است');
    }
  }

  async getBillableItems() {
    try {
      let res: any = await this.treatmentsService.getBillableItems().toPromise();
      this.billableItems = res;
      if (this.editOrNew != -1) {
        let item = res.filter(x => x.id == this.editOrNew);
        this.model.name = item[0]['name'];
        this.model.code = item[0]['code'];
        this.model.price = item[0]['price'];
        this.model.duration = item[0]['duration'];
        this.model.allowEditPrice = item[0]['allowEditPrice'];
        this.model.forceOneInvoice = item[0]['forceOneInvoice'];
        this.model.treatmentTemplateId = this.treatmentList.filter(a => a.id === item[0]['treatmentTemplateId'])[0];
        this.model.isTreatmentDataRequired = item[0]['isTreatmentDataRequired'];
        this.model.parentId = this.billableItems.filter(a => a.id === item[0]['parentId'])[0];
        this.model.itemCategoryId = this.itemCategory.filter(a => a.id === item[0]['itemCategoryId'])[0];
        this.model.orderInItemCategory = item[0]['orderInItemCategory'];
        this.model.autoCopyTreatment = item[0]['autoCopyTreatment'];
        this.model.needAccept = item[0]['needAccept'];
        this.model.lastTimeColor = item[0]['lastTimeColor'];
      }
    }
    catch { }
  }

  async getItemCategory() {
    let res: any = await this.treatmentsService.getItemCategory().toPromise();
    this.itemCategory = res;
  }

  async getTreatmentTemplates() {
    let model = {
      id: null
    }
    let res: any = await this.treatmentsService.getTreatmentTemplates(model).toPromise();
    this.treatmentList = res;
  }
}