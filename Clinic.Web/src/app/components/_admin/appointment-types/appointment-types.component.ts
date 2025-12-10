import { Component } from '@angular/core';
import { MainService } from '../../../_services/main.service';
import { TreatmentsService } from '../../../_services/treatments.service';
import { DropdownModule } from "primeng/dropdown";
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../share/shared.module';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ToastrService } from 'ngx-toastr';
import { ObjectService } from '../../../_services/store.service';

@Component({
  selector: 'app-appointment-types',
  standalone: true,
  imports: [DropdownModule, CommonModule, SharedModule, ColorPickerModule],
  templateUrl: './appointment-types.component.html',
  styleUrl: './appointment-types.component.css'
})
export class AppointmentTypesComponent {

  billableItems: any = [];
  newType: any = [];
  treatmentTypes: any = [];
  productList: any = [];
  appointmentTypes: any = [];
  allowedLinks: any = [];

  constructor(
    private treatmentService: TreatmentsService,
    private mainService: MainService,
    private toastR: ToastrService,
    private objectService: ObjectService
  ) { }

  async ngOnInit() {
    this.allowedLinks = await this.objectService.getDataAccess();
    if (this.checkAccess(1)) {
      this.getBillableItems();
      this.getTreatmentTemplate();
      this.getProducts();
      this.getAppointmentTypes();
    } else {
      this.toastR.error("شما دسترسی به این صفحه ندارید");
    }
  }
  async getBillableItems() {
    try {
      let res: any = await this.treatmentService.getBillableItems().toPromise();
      if (res.length > 0) {
        this.billableItems = res;
        this.billableItems.forEach((item: any) => {
          item.code = item.id,
            item.name = item.name
        });
      }
    }
    catch { }
  }

  async getTreatmentTemplate() {
    try {
      let model = {
        id: null
      }
      let res: any = await this.treatmentService.getTreatmentTemplates(model).toPromise();
      if (res.length > 0) {
        this.treatmentTypes = res;
        this.treatmentTypes.forEach((item: any) => {
          item.code = item.id,
            item.name = item.name
        });
      }
    }
    catch { }
  }

  async getProducts() {
    try {
      let res = await this.mainService.getProducts().toPromise();
      this.productList = res;
      this.productList.forEach((item: any) => {
        item.code = item.id;
      });
    }
    catch { }
  }

  async saveAppointmentType() {
    let model = {
      "name": this.newType.name,
      "description": this.newType.description,
      "duration": Number(this.newType.duration),
      "relatedBillableItemId": this.newType.firstService.code,
      "relatedBillableItem2Id": this.newType.secondService.code,
      "relatedBillableItem3Id": this.newType.thirdService.code,
      "defaultTreatmentNoteTemplate": this.newType.treatmentType.code,
      "relatedProductId": this.newType.firstProduct.code,
      "relatedProduct2Id": this.newType.secondProduct.code,
      "relatedProduct3Id": this.newType.thirdProduct.code,
      "color": this.newType.typeColor,
      "showInOnlineBookings": this.newType.showInAppoinment,
      "editOrNew": this.newType.id || -1
    }

    try {
      let res: any = this.treatmentService.saveAppointmentType(model).toPromise();
      if (res.status == 0) {
        this.toastR.success("یا موفقیت ذخیره شد!");
      }
    }
    catch { }
  }

  async getAppointmentTypes() {
    try {
      let res: any = await this.treatmentService.getAppointmentTypes().toPromise();
      if (res.length > 0) {
        this.appointmentTypes = res;
        this.appointmentTypes.forEach((type: any) => {
          type.relatedService1Name = this.billableItems.filter((item: any) => item.id == type.relatedBillableItemId)[0];
          type.relatedService2Name = this.billableItems.filter((item: any) => item.id == type.relatedBillableItem2Id)[0];
          type.relatedService3Name = this.billableItems.filter((item: any) => item.id == type.relatedBillableItem3Id)[0];
          type.relatedProduct1Name = this.productList.filter((item: any) => item.id == type.relatedProductId)[0];
          type.relatedProduct2Name = this.productList.filter((item: any) => item.id == type.relatedProduct2Id)[0];
          type.relatedProduct3Name = this.productList.filter((item: any) => item.id == type.relatedProduct3Id)[0];
          type.defaultTreatmentNoteTemplateName = this.treatmentTypes.filter((item: any) => item.id == type.defaultTreatmentNoteTemplate)[0];
        });
      }
    }
    catch {
      this.toastR.error('خطا!', 'خطا در دریافت اطلاعات')
    }
  }


  editType(type) {
    this.newType.id = type.id;
    this.newType.name = type.name;
    this.newType.description = type.description;
    this.newType.duration = type.duration;
    this.newType.firstService = this.billableItems.filter((item: any) => item.id == type.relatedBillableItemId)[0];
    this.newType.secondService = this.billableItems.filter((item: any) => item.id == type.relatedBillableItem2Id)[0];
    this.newType.thirdService = this.billableItems.filter((item: any) => item.id == type.relatedBillableItem3Id)[0];
    this.newType.treatmentType = this.treatmentTypes.filter((item: any) => item.id == type.defaultTreatmentNoteTemplate)[0];
    this.newType.firstProduct = this.productList.filter((item: any) => item.id == type.relatedProductId)[0];
    this.newType.secondProduct = this.productList.filter((item: any) => item.id == type.relatedProduct2Id)[0];
    this.newType.thirdProduct = this.productList.filter((item: any) => item.id == type.relatedProduct3Id)[0];
    this.newType.typeColor = type.color;
    this.newType.showInAppoinment = type.showInOnlineBookings;
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
