import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../../share/shared.module';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MainService } from '../../../../_services/main.service';
import { TreatmentsService } from '../../../../_services/treatments.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-appointment-setting',
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: './user-appointment-setting.component.html',
  styleUrl: './user-appointment-setting.component.css'
})
export class UserAppointmentSettingComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private mainService: MainService,
    private treatmentService: TreatmentsService,
    private toastR: ToastrService

  ) {
    this.route.queryParams.subscribe(params => {
      this.userName = params['userName'];
      // this.userId = params['id'];
    });
  }

  userName: string;
  userId: number;
  clinicsList: any = [];
  selectedClinic: any;
  times = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    label: i.toString().padStart(2, '0') + ':00'
  }));
  editOrNew = -1;
  appointmentTypes: any = [];
  defaultType: any = null;
  defaultNewPatientType: any = null;
  numberOutTurn: any;
  minutes = [5, 10, 15, 20, 30, 60];
  minuteSelected: any = null;
  calendarTimeFrom: any = null;
  calendarTimeTo: any = null;
  multipleAppointment: any;
  userAppointmentsList: any = [];

  async ngOnInit(): Promise<void> {
    this.userId = +this.route.snapshot.paramMap.get('uid');
    await this.getClinics();
    await this.getAppointmentTypes();
    this.getUserAppointmentsSettings();
  }

  async getClinics() {
    try {
      let res = await this.mainService.getClinics().toPromise();
      this.clinicsList = res;
      this.clinicsList.forEach((clinic: any) => {
        clinic.code = clinic.id;
      });
      this.selectedClinic = this.clinicsList[0];
    }
    catch { }
  }

  async getAppointmentTypes() {
    try {
      let res: any = await this.treatmentService.getAppointmentTypes().toPromise();
      if (res.length > 0) {
        this.appointmentTypes = res;
        this.appointmentTypes.forEach((type: any) => {
          type.code = type.id;
        });
      }
    }
    catch {
    }
  }

  async getUserAppointmentsSettings() {
    try {
      let model = {
        userId: String(this.userId),
        businessId: -1,
      }
      let res: any = await this.mainService.getUserAppointmentsSettings(model).toPromise();
      if (res.length > 0) {
        this.userAppointmentsList = res;
        this.userAppointmentsList.forEach(element => {
          element.selectedClinics = this.clinicsList.filter(x => x.id == element['businessId'])[0];
        });
      }
    }
    catch { }
  }

  async saveUserAppointmentsSettings() {
    if (!this.selectedClinic.code || this.numberOutTurn == undefined || this.numberOutTurn == null
      || !this.minuteSelected || !this.calendarTimeFrom || !this.calendarTimeTo
    ) {
      this.toastR.error('تمامی موارد خواسته شده رو تکمیل کنید');
      return
    }
    try {
      let model = {
        practitionerId: this.userId,
        businessId: this.selectedClinic.code,
        defaultAppointmentTypeId: this.defaultType,
        newPatientAppointmentTypeId: this.defaultNewPatientType,
        outOfTurn: this.numberOutTurn,
        timeSlotSize: this.minuteSelected,
        calendarTimeFrom: this.calendarTimeFrom,
        calendarTimeTo: this.calendarTimeTo,
        multipleAppointment: this.multipleAppointment,
        editOrNew: this.editOrNew
      }
      let res: any = await this.mainService.saveUserAppointmentsSettings(model).toPromise();
      if (res.status == 0) {
        this.toastR.success('با موفقیت ثبت شد!');
        this.editOrNew = -1;
        this.multipleAppointment = false;
        this.calendarTimeTo = null;
        this.calendarTimeFrom = null;
        this.minuteSelected = null;
        this.numberOutTurn = null;
        this.defaultNewPatientType = null;
        this.defaultType = null;
        this.selectedClinic = null;
        this.getUserAppointmentsSettings();
      }
    }
    catch { }
  }

  async edit(item) {
    this.editOrNew = item.id;
    this.multipleAppointment = false;
    this.calendarTimeTo = item.calendarTimeTo;
    this.calendarTimeFrom = item.calendarTimeFrom;
    this.minuteSelected = item.timeSlotSize;
    this.numberOutTurn = item.outOfTurn;
    this.defaultNewPatientType = item.newPatientAppointmentTypeId;
    this.defaultType = item.defaultAppointmentTypeId;
    this.selectedClinic = item.selectedClinics;
  }
}