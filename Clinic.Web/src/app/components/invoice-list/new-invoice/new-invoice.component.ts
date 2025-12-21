import { InvoiceService } from './../../../_services/invoice.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../../_services/user.service';
import { SharedModule } from '../../../share/shared.module';
import { PatientService } from '../../../_services/patient.service';
import { InvoiceItemsComponent } from '../invoice-items/invoice-items.component';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment-jalaali';
import { MainService } from '../../../_services/main.service';
import Swal from 'sweetalert2';
import { PaymentService } from '../../../_services/payment.service';
import { ObjectService } from '../../../_services/store.service';

@Component({
  selector: 'app-new-invoice',
  standalone: true,
  imports: [SharedModule, InvoiceItemsComponent],
  templateUrl: './new-invoice.component.html',
  styleUrl: './new-invoice.component.css'
})
export class NewInvoiceComponent implements OnInit {

  constructor(
    private userService: UserService,
    private patientService: PatientService,
    private invoiceService: InvoiceService,
    private toastR: ToastrService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private mainService: MainService,
    private paymentService: PaymentService,
    private objectService: ObjectService
  ) { }

  patientsList: any = [];
  selectedPatient: any;
  clinicsList: any = [];
  selectedClinic: any;
  editOrNew: number;
  selectedPatientAppointment: any = []
  hasInviceId: number;
  note: string;
  patientAppointmentsList: any = []
  type: any;
  selectedPatientTitle: any;
  selectedClinicTitle: any;
  selectedClinicId: any;
  selectedappointmentId: any;
  patientId: any;
  @ViewChild(InvoiceItemsComponent) invoiceItemsComponent: InvoiceItemsComponent;
  isCanceled: boolean = false;
  invoiceAccess: any = [];

  async ngOnInit() {
    this.activeRoute.params.subscribe(async () => {
      this.editOrNew = this.activeRoute.snapshot.paramMap.get('invoiceId') == 'n' ? -1 : +this.activeRoute.snapshot.paramMap.get('invoiceId');
      this.patientId = this.activeRoute.snapshot.paramMap.get('patientId') == 'n' ? null : +this.activeRoute.snapshot.paramMap.get('patientId');
      this.selectedClinicId = this.activeRoute.snapshot.paramMap.get('clinicId') == 'n' ? null : +this.activeRoute.snapshot.paramMap.get('clinicId');
      this.selectedappointmentId = this.activeRoute.snapshot.paramMap.get('appointmentId') == 'n' ? null : +this.activeRoute.snapshot.paramMap.get('appointmentId');
      this.type = +this.activeRoute.snapshot.paramMap.get('type') || 2;
      let accessList: any = await this.objectService.getItemAccess();
      let item = accessList.filter(x => x.id == 6);
      this.invoiceAccess = item[0]['itmes'];
      if (item[0]['itmes'][0]['clicked']) {
        await this.getPatients();
        if (this.patientId != null) {
          // this.selectedPatient = this.patientsList.filter(patient => patient.id == this.patientId)[0];
          await this.getPatientAppointments();
          if (this.selectedappointmentId != null) {
            this.selectedPatientAppointment = this.patientAppointmentsList.filter(item => item.id == this.selectedappointmentId)[0];
          }
        }

        await this.getClinics();
        if (this.selectedClinicId != null) {
          this.selectedClinic = this.clinicsList.filter(clinic => clinic.id == this.selectedClinicId)[0];
        }

        if (this.editOrNew != -1) {
          this.getInvoices();
          this.setSelectedPatient(this.editOrNew);
        }
        await this.getPatientAppointments();
      }
    });
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
    catch { }
  }

  async getClinics() {
    try {
      let res = await this.mainService.getClinics().toPromise();
      this.clinicsList = res;
      this.clinicsList.forEach((clinic: any) => {
        clinic.code = clinic.id;
      });
    }
    catch { }
  }

  async saveInvoice() {
    if (!this.selectedPatient || !this.selectedClinic || !this.selectedPatientAppointment) {
      this.toastR.error('خطا', 'مقادیر را وارد کنید');
      return
    }
    let model = {
      businessId: this.selectedClinic.code,
      patientId: this.selectedPatient.code,
      appointmentId: this.selectedPatientAppointment.code,
      notes: this.note,
      editOrNew: this.editOrNew
    }
    try {
      let res: any = await firstValueFrom(this.invoiceService.saveInvoice(model));
      if (res.status == 0) {
        this.toastR.success('با موفقیت ثبت شد!');
        if (this.editOrNew == -1) {
          const match = res.message.match(/Id\s*:\s*(\d+)/);
          const id = match ? parseInt(match[1], 10) : null;
          this.router.navigate(['/new-invoice', id, "n", "n", "n", 2]);

        }
      } else {
        this.toastR.error('خطا');
      }
    } catch (error) {
      this.toastR.error('خطا');
    }
  }

  async getPatientAppointments() {
    try {
      let res = await this.patientService.getPatientAppointments(this.selectedPatient.code).toPromise();
      this.patientAppointmentsList = res;
      this.patientAppointmentsList.forEach((item: any) => {
        item.code = item.id;
        let time = moment(item.start).format('HH:mm - jYYYY/jMM/jDD')
        item.name = time + " " + item.appointmentTypeName;
      });
    }
    catch { }
  }

  async getInvoices() {
    try {
      let res: any = await this.invoiceService.getInvoices().toPromise();
      let item = res.filter(x => x.id == this.editOrNew);
      this.selectedClinic = this.clinicsList.filter(x => x.id == item[0]['businessId'])[0];
      this.selectedClinicTitle = item[0]['businessName'];
      // this.selectedPatient = this.patientsList.filter(x => x.id == item[0]['patientId'])[0];
      this.selectedPatient = {
        code: this.patientId
      };
      this.selectedPatientTitle = item[0]['patientName'];
      this.note = item[0]['notes'];
      this.selectedPatientAppointment = this.patientAppointmentsList.filter(x => x.id == item[0]['appointmentId'])[0];
      this.isCanceled = item[0]['isCanceled'];
    }
    catch { }
  }

  goToEditPage() {
    this.router.navigate(['/new-invoice', this.editOrNew, "n", "n", "n", 2]);
  }

  setSelectedPatient(patientId) {
    this.selectedPatient = this.patientsList.filter(patient => patient.id == patientId)[0];
  }

  async savereceipt(type) {
    if (this.selectedPatient.code == null) {
      this.toastR.error('خطا', 'بیمار مورد نظر را انتخاب کنید');
      return;
    }
    let typeTitle = type == 1 ? 'دریافت' : 'پرداخت';
    Swal.fire({
      title: `آیا از ${typeTitle} این صورتحساب مطمئن هستید ؟`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      if (result.value) {
        if (type == 1) {
          this.router.navigate(['/patient/receipt/' + this.selectedPatient.code]);
        } else {
          this.router.navigate(['/patient/payment/' + this.selectedPatient.code]);
        }

        //   let model;
        //   if (type == 1) {
        //     model = {
        //       receiptNo: null,
        //       patientId: this.selectedPatient.code,
        //       cash: +this.invoiceItemsComponent.totalAmount,
        //       eftPos: null,
        //       other: null,
        //       notes: this.note,
        //       allowEdit: true,
        //       receiptTypeId: 0
        //     }
        //   } else {
        //     model = {
        //       receiptNo: null,
        //       patientId: this.selectedPatient.code,
        //       cash: +this.invoiceItemsComponent.totalAmount,
        //       eftPos: null,
        //       other: null,
        //       notes: this.note,
        //       allowEdit: true,
        //       receiptTypeId: 0,
        //       editOrNew: -1
        //     }
        //   }
        //   try {
        //     let data;
        //     if (type == 1) {
        //       data = await this.invoiceService.saveReceipt(model).toPromise();
        //     } else {
        //       data = await this.paymentService.savePayment(model).toPromise();
        //     }
        //     if (data['status'] == 0) {
        //       this.toastR.success('با موفقیت ثبت شد!');
        //     }
        //   } catch {
        //     this.toastR.error('خطا', 'خطا در انجام عملیات')
        //   }
      }
    })
  }

  async cancelInvoice(id) {
    Swal.fire({
      title: "آیا از ابطال این صورتحساب مطمئن هستید ؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      if (result.value) {
        try {
          let res: any = await this.invoiceService.cancelInvoice(this.editOrNew).toPromise();
          if (res['status'] == 0) {
            this.toastR.success('با موفقیت ابطال گردید');
            this.isCanceled = true;
          }
        }
        catch {
          this.toastR.error('خطایی رخ داد', 'خطا!');
        }
      }
    })
  }

  checklInvoiceAccess(id) {
    const item = this.invoiceAccess.find(x => x.id === id);
    return item ? item.clicked : false;
  }
}
