import { MainService } from './../../../_services/main.service';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../share/shared.module';
import { TreatmentsService } from './../../../_services/treatments.service';
import { Component, Input, OnInit } from '@angular/core';
import { InvoiceService } from '../../../_services/invoice.service';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { UtilService } from '../../../_services/util.service';
@Component({
  selector: 'app-invoice-items',
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: './invoice-items.component.html',
  styleUrl: './invoice-items.component.css'
})
export class InvoiceItemsComponent implements OnInit {

  constructor(
    private treatmentsService: TreatmentsService,
    private toastR: ToastrService,
    private invoiceService: InvoiceService,
    private mainService: MainService,
    private utilService: UtilService
  ) { }

  servicesList: any = [];
  selectedservice: any;
  type = 1;
  number: number = 1;
  discount: any = null;
  price: any;
  amount: any;
  paymentType: any = null;
  editOrNew: boolean = false;
  totalAmount: number;
  totalDiscount: number;
  @Input('invoiceId')
  set invoiceId(invoiceId: number) {
    if (invoiceId != -1 || invoiceId != null) {
      this._invoiceId = invoiceId;
      this.getBillableItems();
      this.getProducts();
      setTimeout(() => {
        this.getInvoiceItems();
      }, 1000);
    }
  }
  _invoiceId: any;
  productList: any = [];
  selectedProduct: any;
  invoiceItemsList: any = [];
  @Input() viewOrEdit;
  stateOptions: any[] = [{ label: 'اضافه نمودن خدمت', value: 1 }, { label: 'اضافه نمودن کالای مصرفی', value: 2 }];
  selectedType: number = 1;
  userType: number;
  @Input() isCanceled;

  async ngOnInit() {
    this.userType = this.utilService.checkUserType();
    await this.getBillableItems();
    await this.getProducts();
  }

  async getBillableItems() {
    try {
      let res = await this.treatmentsService.getBillableItems().toPromise();
      this.servicesList = res;
      this.servicesList.forEach((item: any) => {
        item.code = item.id;
      });
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

  hadelType(type) {
    this.type = type;
    this.paymentType = null;
    this.number = 1;
    this.discount = null;
    this.amount = null;
  }

  selectedItemMetod() {
    this.paymentType = null;
    this.number = 1;
    this.discount = null;
    this.amount = null;
    if (this.type == 1) {
      this.price = this.selectedservice.price;
    } else {
      this.price = this.selectedProduct.price;
    }
  }

  handelPrice() {
    this.amount = null;
    if (this.paymentType == null) {
      return
    } else {
      let totalPrice = (+this.number * +this.price);
      switch (this.paymentType) {
        case '1':
          this.amount = totalPrice - +this.discount;
          break;
        case '2':
          this.amount = totalPrice - (totalPrice * +this.discount / 100);
          break;
      }
    }
  }

  async saveInvoiceItem() {
    if ((!this.selectedservice && this.type == 1) || (this.type == 2 && !this.selectedProduct)) {
      this.toastR.error('خطا', 'مقادیر را وارد کنید');
      return
    }
    let model = {
      invoiceId: this._invoiceId,
      itemId: this.type == 1 ? this.selectedservice.code : null,
      productId: this.type == 2 ? this.selectedProduct.code : null,
      quantity: this.number,
      discount: this.discount,
      discountTypeId: this.paymentType,
      editOrNew: this.editOrNew ? 1 : -1
    }
    try {
      let res: any = await firstValueFrom(this.invoiceService.saveInvoiceItem(model));
      if (res.status == 0) {
        this.toastR.success('با موفقیت ثبت شد!');
        this.paymentType = null;
        this.number = 1;
        this.discount = null;
        this.amount = null;
        this.selectedservice = null;
        this.selectedProduct = null;
        this.getInvoiceItems();
      } else {
        this.toastR.error('خطایی رخ داده است');
      }
    } catch (error) {
      this.toastR.error('خطایی رخ داده است');
    }
  }

  async getInvoiceItems() {
    try {
      let res = await this.invoiceService.getInvoiceItems(this._invoiceId).toPromise();
      this.invoiceItemsList = res;
      this.invoiceItemsList.forEach(element => {
        element.type = element.productId != null ? 2 : 1;
        if (element.type == 1) {
          element.selected = this.servicesList.filter(x => x.id == element['itemId'])[0];
        } else {
          element.selected = this.productList.filter(x => x.id == element['productId'])[0];
        }
        element.price = element.selected.price;
        element.amount = this.calculateAmount(element.discountTypeId, element.price, element.quantity, element.discount);
      });
      this.calculateTotal();
    }
    catch { }
  }


  calculateAmount(paymentType: number, price: number, number: number, discount: number): any {
    const totalPrice = price * number;
    switch (paymentType) {
      case 0:
        return totalPrice;
      case 1:
        return totalPrice - discount;
      case 2:
        return totalPrice - (totalPrice * discount / 100);
    }
  }


  async deleteInvoiceItem(id) {
    Swal.fire({
      title: "آیا از حذف این قلم مطمئن هستید ؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      try {
        if (result.value) {
          let res: any = await this.invoiceService.deleteInvoiceItem(id).toPromise();
          if (res['status'] == 0) {
            this.toastR.success('با موفقیت حذف گردید');
            this.getInvoiceItems();
          }
        }
      }
      catch {
        this.toastR.error('خطایی رخ داد', 'خطا!')
      }
    })
  }


  calculateTotal() {
    let totalAmount = 0;
    let totalDiscount = 0;
    for (const item of this.invoiceItemsList) {
      totalAmount += item.amount;
      if (item.discountTypeId == 1) {
        totalDiscount += item.discount;
      } else if (item.discountTypeId == 2) {
        totalDiscount += item.price * item.discount / 100;
      }
    }
    this.totalAmount = totalAmount;
    this.totalDiscount = totalDiscount;
  }

}
