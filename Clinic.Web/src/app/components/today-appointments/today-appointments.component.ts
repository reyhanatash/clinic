import { Component, OnInit } from '@angular/core';
import { TreatmentsService } from './../../_services/treatments.service';
import { SharedModule } from '../../share/shared.module';
import { MainService } from './../../_services/main.service';
import moment from 'moment-jalaali';
import { FormControl } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { InputMaskModule } from 'primeng/inputmask';
import { InvoiceService } from '../../_services/invoice.service';
import { ToastrService } from 'ngx-toastr';
import { MultiSelectModule } from 'primeng/multiselect';
import { UtilService } from '../../_services/util.service';
import { ObjectService } from '../../_services/store.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-today-appointments',
  standalone: true,
  imports: [SharedModule, RouterLink, InputMaskModule, MultiSelectModule],
  templateUrl: './today-appointments.component.html',
  styleUrl: './today-appointments.component.css'
})
export class TodayAppointmentsComponent implements OnInit {
  appointmentDiscount: any;

  constructor(
    private treatmentsService: TreatmentsService,
    private mainService: MainService,
    private invoiceService: InvoiceService,
    private toastR: ToastrService,
    private router: Router,
    private utilService: UtilService,
    private objectService: ObjectService
  ) { }

  clinicsList: any = [];
  selectedClinic: any;
  todayAppointmentsList: any = [];
  servicesList: any = [];
  selectedservice: any;
  selectedDatefrom: any;
  selectedTimefrom: any = '00:00';
  selectedDateTo: any;
  selectedTimeTo: any = '23:00';
  showNewDiscount: boolean = false;
  visitStatusList: any = [
    { name: "انتظار ", code: 1 },
    { name: "پذیرش شده", code: 2 },
    { name: "ملاقات شده", code: 3 },
    { name: "تسویه نشده", code: 4 },
    { name: "تخفیف گرفته", code: 5 },
  ]
  filteredAppointments: any = [];
  showAppointmentDetail: any;
  appointmentDetailItem: any = [];
  selectedStatus: any = [];
  discountAppointment: any = [];
  discount: any = [];
  appointmentInvoices: any = [];
  userType: any;
  isAdminOrDoctor: boolean;
  allowedLinks: any = [];
  
  async ngOnInit() {
    this.allowedLinks = await this.objectService.getDataAccess();
    if (this.checkAccess(1)) {
      this.userType = this.utilService.checkUserType();
      this.isAdminOrDoctor = this.userType == 3 ? false : true;
      this.selectedDatefrom = new FormControl(moment().format('jYYYY/jMM/jDD'));
      this.selectedDateTo = new FormControl(moment().format('jYYYY/jMM/jDD'));
      await this.getClinics();
      await this.getBillableItems();
      setTimeout(() => {
        this.getAppointment();
      }, 1000);
    } else {
      this.toastR.error("شما دسترسی به این صفحه ندارید");
    }
  }

  async getAppointment() {
    let model = {
      fromDate: moment(this.selectedDatefrom.value, 'jYYYY/jMM/jDD').add(3.5, 'hours').toDate(),
      toDate: moment(this.selectedDateTo.value, 'jYYYY/jMM/jDD').add(3.5, 'hours').toDate(),
      clinic: this.selectedClinic?.code,
      service: this.selectedservice?.code,
      from: this.convertTimeToUTC(this.selectedTimefrom),
      to: this.convertTimeToUTC(this.selectedTimeTo)
    }
    try {
      const res: any = await this.treatmentsService.getTodayAppointments(model).toPromise();
      this.todayAppointmentsList = res;
      this.todayAppointmentsList.forEach(appointment => {
        appointment.hasDiscount = appointment.totalDiscount > 0 ? true : false;
      });
      this.filteredAppointments = [];

      if (this.selectedStatus && this.selectedStatus.length > 0) {
        this.selectedStatus.forEach(status => {
          let filtered = [];
          switch (status.code) {
            case 4:
              filtered = this.todayAppointmentsList.filter(a => a.receipt == 0);
              break;
            case 5:
              filtered = this.todayAppointmentsList.filter(a => a.totalDiscount > 0);
              break;
            default:
              filtered = this.todayAppointmentsList.filter(a => a.status === status.code);
              break;
          }
          this.filteredAppointments.push(...filtered);
        });
      } else {
        this.filteredAppointments = [...this.todayAppointmentsList];
      }
    } catch { }
  }

  async getClinics() {
    try {
      let res = await this.mainService.getClinics().toPromise();
      this.clinicsList = res;
      this.clinicsList.forEach((clinic: any) => {
        clinic.code = clinic.id;
      });
      setTimeout(() => {
        this.selectedClinic = this.clinicsList[0];
      }, 1000);
    }
    catch { }
  }

  async getBillableItems() {
    try {
      let res = await this.treatmentsService.getBillableItems().toPromise();
      this.servicesList = res;
      this.servicesList.forEach((service: any) => {
        service.code = service.id;
      });
      this.servicesList.unshift({
        name: 'همه',
        id: -1,
      });
    }
    catch { }
  }

  convertTimeToUTC(time: string): string {
    let [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    const date = new Date(Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0,
      0
    ));
    const timePart = date.toISOString().split("T")[1];
    return timePart.replace("Z", "");
  }

  onDateChange(newDate: string) {
  }

  openDiscount(event, item, isEdit) {
    event.stopPropagation();
    if (isEdit) {
      this.discount.amount = item.totalDiscount;
    }
    this.showNewDiscount = true;
    this.discountAppointment = item
  }

  async submitDiscount() {
    try {
      let model = {
        "invoiceId": this.discountAppointment.invoiceId,
        "totalDiscount": this.discount.amount
      }
      let res: any = await this.invoiceService.saveInvoiceDiscount(model).toPromise();
      if (res.status == 0) {
        this.toastR.success('با موفقیت ثبت شد!');
        this.getAppointment();
      }
      this.showNewDiscount = false;
    }
    catch { }
  }

  filterAppointments(searchText: any) {
    if (!searchText) {
      this.filteredAppointments = this.todayAppointmentsList;
      return;
    }
    const text = searchText.toLowerCase();
    this.filteredAppointments = this.todayAppointmentsList.filter(item => {
      return (
        item.patientPhone?.toLowerCase().includes(text) ||
        item.patientName?.toLowerCase().includes(text) ||
        item.id.toString().includes(text)
      );
    });
  }

  async openAppointmentDetail(event, item) {
    event.stopPropagation();
    this.appointmentDetailItem = [];
    try {
      this.showAppointmentDetail = true;
      // this.invoiceService.getInvoiceDetails(item.id).toPromise();
      let res: any = await this.invoiceService.getInvoiceDetails(item.id).toPromise();
      if (res.length > 0) {
        this.appointmentDetailItem = res;
      }
    }
    catch { }
  }

  cancelDiscount() {
    this.discountAppointment = [];
    this.showNewDiscount = false;
  }

  navigateToTreatment(item) {
    if (item.status != 1) {
      this.router.navigate(["/patient/treatment/" + item.patientId])
    }
  }

  async approveDiscount(event, item) {
    event.stopPropagation();
    try {
      let res: any = await this.invoiceService.approveDiscount(item.invoiceId).toPromise();
      if (res.status == 0) {
        this.toastR.success('با موفقیت تایید شد!');
      }
    }
    catch { }
  }

  async patientArrived(event, item) {
    event.stopPropagation();
    try {
      let res: any = await this.treatmentsService.savePatientArrived(item.id).toPromise();
      if (res.status == 0) {
        this.toastR.success('وضعیت بیمار به حضور در مطب تغییر کرد!');
        this.getAppointment();
      }
    }
    catch { }
  }

  checkAccess(id) {
    if (this.allowedLinks?.length > 0) {
      const item = this.allowedLinks.find(x => x.id === id);
      return item.clicked;
    } else {
      return false
    }
  }

  async invoiceItemIsDone(item) {
    if (!this.checkAccess(3)) {
      return
    }
    Swal.fire({
      title: `آیا از انجام این ${item.name} مطمئن هستید ؟`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      try {
        if (result.value) {
          item.done = !item.done;
          let res: any = await this.invoiceService.invoiceItemIsDone(item.invoiceItemId, item.done).toPromise();
          if (res['status'] == 0) {
            this.toastR.success('با موفقیت انجام گردید');
          }
        }
      }
      catch {
        this.toastR.error('خطایی رخ داد', 'خطا!')
      }
    })
  }
}