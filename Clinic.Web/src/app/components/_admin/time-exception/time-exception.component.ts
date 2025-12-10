import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DropdownModule } from 'primeng/dropdown';
import { NgPersianDatepickerModule } from "ng-persian-datepicker";
import moment from 'moment-jalaali';
import { TableModule } from 'primeng/table';
import { UserService } from '../../../_services/user.service';
import { MainService } from '../../../_services/main.service';
import { SharedModule } from '../../../share/shared.module';
import { ObjectService } from '../../../_services/store.service';

@Component({
  selector: 'app-time-exception',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, NgPersianDatepickerModule, SharedModule, TableModule],
  templateUrl: './time-exception.component.html',
  styleUrl: './time-exception.component.css'
})
export class TimeExceptionComponent {

  newException: any = [];
  timeExceptions: any = [];
  doctorsList: any = [];
  clinicsList: any = [];
  selectedClinic: any = [];
  doctorList: any = [];
  selectedDoctor: any = [];

  constructor(
    private toastR: ToastrService,
    private userService: UserService,
    private mainService: MainService,
    private objectService: ObjectService
  ) { }

  ngOnInit() {
    this.newException.startDate = new FormControl(moment().format('jYYYY/jMM/jDD'));
    this.newException.startTime = '00:00';
    this.newException.endTime = '23:00';
    if (this.checkAccess(1)) {
      this.getDoctors();
      this.getClinics();
      this.getExceptions();
    }
  }

  async getDoctors() {
    try {
      let res: any = await this.userService.getDoctors().toPromise();
      if (res.length > 0) {
        this.doctorsList = res;
        this.doctorsList.forEach(doctor => {
          doctor.code = doctor.id;
          doctor.name = doctor.firstName + ' ' + doctor.lastName;
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
      this.newException.selectedClinic = this.clinicsList[0];
    }
    catch {
      this.toastR.error('خطا!', 'خطا در دریافت اطلاعات');
    }
  }

  async saveException() {
    console.log(this.newException);

    let model =
    {
      "startDate": moment(this.newException.startDate.value, 'jYYYY/jMM/jDD').add(3.5, 'hours').toDate(),
      "startTime": this.convertTimeToUTC(this.newException.startTime),
      "endTime": this.convertTimeToUTC(this.newException.endTime),
      // "practitionerId": this.newException.selectedDoctor['code'] || 0,
      "timeExceptionTypeId": 0,
      "repeatEvery": this.newException.repeatEvery,
      "endsAfter": this.newException.endsAfter,
      "duration": this.newException.duration,
      "businessId": this.newException.selectedClinic.code || null,
      "practitionerTimeExceptionId": this.newException.practitionerTimeExceptionId,
      "outOfTurn": this.newException.outOfTurn,
      "defaultAppointmentTypeId": this.newException.defaultAppointmentTypeId,
      "timeSlotSize": this.newException.timeSlotSize,
      "editOrNew": this.newException.id || -1
    }
    try {
      if (!this.newException.selectedDoctor || !this.newException.dateFrom || !this.newException.dateTo) {
        let res: any = await this.mainService.saveTimeException(model).toPromise();
        this.toastR.success('اطلاعات با موفقیت ثبت شد');
        this.newException = [];
        this.getExceptions();
      }
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

  async getExceptions() {
    try {
      let res: any = await this.mainService.getTimeException().toPromise();
      if (res.length > 0) {
        this.timeExceptions = res;
      }
    }
    catch { }
  }

  editException(exception: any) {
    this.newException.doctor = this.doctorList.filter((doctor: any) => doctor.id == exception.practitionerId)[0];
    this.newException.startDate = new FormControl(moment(exception.startDate).format('jYYYY/jMM/jDD'));
    this.newException.startTime = exception.startTime;
    this.newException.endTime = exception.endTime;
    this.newException.repeatEvery = exception.repeatEvery;
    this.newException.endsAfter = exception.endsAfter;
    this.newException.duration = exception.duration;
    this.newException.practitionerTimeExceptionId = exception.id;
    this.newException.outOfTurn = exception.outOfTurn;
    this.newException.defaultAppointmentTypeId = exception.defaultAppointmentTypeId;
    this.newException.timeSlotSize = exception.timeSlotSize;
    this.newException.selectedClinic = this.clinicsList.filter((clinic: any) => clinic.id == exception.businessId)[0];
    this.newException.id = exception.id;
  }
  checkAccess(id) {
    return this.objectService.checkAccess(id);
  }

}


//  {
//         "id": 1,
//         "startDate": null,
//         "startTime": null,
//         "endTime": null,
//         "practitionerId": 0,
//         "timeExceptionTypeId": 0,
//         "repeatId": null,
//         "repeatEvery": null,
//         "endsAfter": null,
//         "modifierId": null,
//         "createdOn": "2025-12-03T15:03:29.6470562",
//         "lastUpdated": null,
//         "duration": null,
//         "grigoryDate": "0001-01-01T00:00:00",
//         "businessId": 7795,
//         "creatorId": 1156,
//         "practitionerTimeExceptionId": null,
//         "outOfTurn": 0,
//         "defaultAppointmentTypeId": null,
//         "timeSlotSize": null
//     },
