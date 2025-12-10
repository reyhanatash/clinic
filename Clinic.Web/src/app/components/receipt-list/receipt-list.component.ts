import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SharedModule } from "../../share/shared.module";
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { MainService } from '../../_services/main.service';
import { ToastrService } from 'ngx-toastr';
import { InvoiceService } from '../../_services/invoice.service';
import { PaymentService } from '../../_services/payment.service';
import Swal from 'sweetalert2';
import { ObjectService } from '../../_services/store.service';

@Component({
  selector: 'app-receipt-list',
  standalone: true,
  imports: [SharedModule, CommonModule, TableModule, FormsModule, DialogModule, RouterLink],
  templateUrl: './receipt-list.component.html',
  styleUrl: './receipt-list.component.css'
})
export class ReceiptListComponent {
  constructor(
    private toastR: ToastrService,
    private invoiceService: InvoiceService,
    private activeRoute: ActivatedRoute,
    private paymentService: PaymentService,
    private objectService: ObjectService
  ) { }
  receiptsList: any = [];
  paymentList: any = [];
  editReceiptsModel: any = [];
  showReceiptsModal: boolean = false;
  patientId: any;
  receiptType: any = 0;
  checkRout: any;
  isPayment: boolean = false;
  tableData: any = [];
  allowedLinks: any = [];

  async ngOnInit() {
    this.checkRout = this.activeRoute.snapshot.routeConfig.path;
    this.allowedLinks = await this.objectService.getDataAccess();
    if (this.checkAccess(1)) {
      if (this.checkRout === "payment-list") {
        this.isPayment = true;
        this.getAllPayments();
      }
      else {
        this.isPayment = false;
        this.getReceipts();
      }
    } else {
      this.toastR.error("شما دسترسی به این صفحه ندارید");
    }
  }

  async getReceipts() {
    let data = await this.invoiceService.getReceipts().toPromise();
    this.receiptsList = data;
    if (this.receiptsList.length > 0) {
      this.receiptsList.forEach(element => {
        element.sumPrice = element.eftPos + element.cash;
      });
    }
    this.tableData = this.receiptsList;
  }

  async getAllPayments() {
    let data = await this.paymentService.getAllPayments().toPromise();
    this.paymentList = data;
    if (this.paymentList.length > 0) {
      this.paymentList.forEach(element => {
        element.sumPrice = element.eftPos + element.cash;
      });
    }
    this.tableData = this.paymentList;
  }

  async deleteReceipt(id) {
    Swal.fire({
      title: "آیا از حذف مطمئن هستید ؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      try {
        if (result.value) {
          if (this.isPayment) {
            let data = await this.paymentService.deletePayment(id).toPromise();
            if (data['status'] == 0) {
              this.toastR.success('با موفقیت حذف گردید');
              this.getAllPayments();
            }
          }
          else {
            let data = await this.invoiceService.deleteReceipt(id).toPromise();
            if (data['status'] == 0) {
              this.toastR.success('با موفقیت حذف گردید');
              this.getReceipts();
            }
          }
        }
      }
      catch {
        this.toastR.error('خطایی رخ داد', 'خطا!')
      }
    })
  }
  openEditreceipt(item) {
    this.editReceiptsModel.name = item.patientName;
    this.editReceiptsModel.patientId = item.patientId;
    this.editReceiptsModel.cash = item.cash;
    this.editReceiptsModel.eftPos = item.eftPos;
    this.editReceiptsModel.note = item.notes;
    this.receiptType = item.receiptTypeId ? 1 : 0;
    this.editReceiptsModel.sum = item.cash + item.eftPos;
    this.editReceiptsModel.id = item.id;
    this.showReceiptsModal = true;
  }

  async editreceipt() {
    if (this.isPayment) {
      let model = {
        receiptNo: null,
        patientId: this.editReceiptsModel.patientId,
        cash: +this.editReceiptsModel.cash,
        eftPos: this.editReceiptsModel.eftPos,
        other: null,
        notes: this.editReceiptsModel.note,
        allowEdit: true,
        receiptTypeId: this.receiptType ? 1 : 0,
        editOrNew: this.editReceiptsModel.id
      }
      try {
        let data = await this.paymentService.savePayment(model).toPromise();
        if (data['status'] == 0) {
          this.toastR.success('با موفقیت ثبت شد!');
          this.closeeditReceiptsModel();
          this.getAllPayments();
        }
      } catch {
        this.toastR.error('خطا', 'خطا در انجام عملیات')
      }
    }
    else {
      let model = {
        receiptNo: null,
        patientId: this.editReceiptsModel.patientId,
        cash: +this.editReceiptsModel.cash,
        eftPos: this.editReceiptsModel.eftPos,
        other: null,
        notes: this.editReceiptsModel.note,
        allowEdit: true,
        receiptTypeId: this.receiptType ? 1 : 0
      }
      try {
        let data = await this.invoiceService.saveReceipt(model).toPromise();
        if (data['status'] == 0) {
          this.toastR.success('با موفقیت ثبت شد!');
          this.closeeditReceiptsModel();
          this.getReceipts();
        }
      } catch {
        this.toastR.error('خطا', 'خطا در انجام عملیات')
      }
    }
  }
  closeeditReceiptsModel() {
    this.editReceiptsModel.name = null;
    this.editReceiptsModel.patientId = null;
    this.editReceiptsModel.cash = null;
    this.editReceiptsModel.eftPos = null;
    this.editReceiptsModel.note = null;
    this.receiptType = 0;
    this.editReceiptsModel.sum = null;
    this.showReceiptsModal = false;
  }

  sumNumber() {
    this.editReceiptsModel.sum = (this.editReceiptsModel.eftPos | 0) + (this.editReceiptsModel.cash | 0);
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
