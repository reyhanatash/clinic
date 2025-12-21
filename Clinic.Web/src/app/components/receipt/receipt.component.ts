import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MainService } from '../../_services/main.service';
import { ToastrService } from 'ngx-toastr';
import { PatientService } from '../../_services/patient.service';
import { DropdownModule } from 'primeng/dropdown';
import { InvoiceService } from '../../_services/invoice.service';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../_services/payment.service';
import { SharedModule } from '../../share/shared.module';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [FormsModule, CommonModule, DropdownModule,SharedModule],
  templateUrl: './receipt.component.html',
  styleUrl: './receipt.component.css'
})
export class ReceiptComponent {

  constructor(
    private mainService: MainService,
    private toastR: ToastrService,
    private patientService: PatientService,
    private invoiceService: InvoiceService,
    private activeRoute: ActivatedRoute,
    private paymentService: PaymentService,

  ) { }
  receiptType: any = 0;
  newReceiptModel: any = [];
  patientsList: any;
  checkRout: any;
  isPayment: boolean = false;
  petientId: any;
  patientSelected: any;
  isPatientReceipt: boolean = false;
  patientId: any;
  invoiceList: any = [];

  async ngOnInit() {
    this.checkRout = this.activeRoute.snapshot.routeConfig.path;
    this.petientId = +this.activeRoute.snapshot.paramMap.get('id') || null;
    this.isPayment = this.checkRout === "payment" ? true : false;
    await this.getPatients();
    this.newReceiptModel.selectedPatient = this.patientsList.filter(patient => patient.id == this.patientId)[0];

    if (this.petientId != null) {
      this.isPatientReceipt = true;
      this.patientSelect();
    }
  }

  async getPatients() {
    try {
      let res: any = await this.patientService.getPatients().toPromise();
      if (res.length > 0) {
        this.patientsList = res;
        this.patientsList.forEach((patient: any) => {
          patient.name = patient.firstName + ' ' + patient.lastName;
          patient.code = patient.id;
        });
      }
    }
    catch {
      this.toastR.error('خطا!', 'خطا در دریافت اطلاعات')
    }
  }

  async savereceipt() {
    if (this.newReceiptModel.selectedPatient == null) {
      this.toastR.error('خطا', 'بیمار مورد نظر را انتخاب کنید');
      return;
    }
    if (this.isPayment) {
      let model = {
        receiptNo: null,
        patientId: this.newReceiptModel.selectedPatient.code,
        cash: +this.newReceiptModel.cash,
        eftPos: this.newReceiptModel.eftPos,
        other: null,
        notes: this.newReceiptModel.note,
        allowEdit: true,
        receiptTypeId: this.receiptType ? 1 : 0,
        editOrNew: -1
      }
      try {
        let data = await this.paymentService.savePayment(model).toPromise();
        if (data['status'] == 0) {
          this.toastR.success('با موفقیت ثبت شد!');
          this.newReceiptModel.selectedPatient = null;
          this.newReceiptModel.Criticism = null;
          this.newReceiptModel.eftPos = null;
          this.newReceiptModel.note = null;
          this.newReceiptModel.cash = null;
          this.newReceiptModel.sum = null;
          this.receiptType = 0;
        }
      } catch {
        this.toastR.error('خطا', 'خطا در انجام عملیات')
      }
    }
    else {
      let model = {
        receiptNo: null,
        patientId: this.newReceiptModel.selectedPatient.code,
        cash: +this.newReceiptModel.cash,
        eftPos: this.newReceiptModel.eftPos,
        other: null,
        notes: this.newReceiptModel.note,
        allowEdit: true,
        receiptTypeId: this.receiptType ? 1 : 0
      }
      try {
        let data = await this.invoiceService.saveReceipt(model).toPromise();
        if (data['status'] == 0) {
          this.toastR.success('با موفقیت ثبت شد!');
          this.newReceiptModel.selectedPatient = null;
          this.newReceiptModel.Criticism = null;
          this.newReceiptModel.eftPos = null;
          this.newReceiptModel.note = null;
          this.newReceiptModel.cash = null;
          this.newReceiptModel.sum = null;
          this.receiptType = 0;
        }
      } catch {
        this.toastR.error('خطا', 'خطا در انجام عملیات');
      }
    }
  }

  sumNumber() {
    this.newReceiptModel.sum = (this.newReceiptModel.eftPos | 0) + (this.newReceiptModel.cash | 0);
  }

  patientSelect() {
    this.newReceiptModel.selectedPatient = this.patientsList.filter(x => x.id == this.petientId)[0];
    console.log(this.patientSelected);
  }
}