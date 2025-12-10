import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from "primeng/dropdown";
import { MainService } from '../../_services/main.service';
import { ToastrService } from 'ngx-toastr';
import { SharedModule } from '../../share/shared.module';
import moment from 'moment-jalaali';
import { Subject, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'attendance-schedule',
  standalone: true,
  imports: [DropdownModule, CommonModule, FormsModule, SharedModule],
  templateUrl: './attendance-schedule.component.html',
  styleUrl: './attendance-schedule.component.css'
})
export class AttendanceScheduleComponent {
  @Input() userId!: number;
  private sub!: Subscription;
  currentUserId!: number;
  clinicsList: any = [];
  newSchedule: any = [];
  selectedTimefrom: any = '00:00';
  selectedTimeTo: any = '23:00';
  scheduleRows: any = [];
  weekDays: any = [
    { code: 0, name: "یکشنبه" },
    { code: 1, name: "دوشنبه" },
    { code: 2, name: "سه‌شنبه" },
    { code: 3, name: "چهارشنبه" },
    { code: 4, name: "پنج‌شنبه" },
    { code: 5, name: "جمعه" },
    { code: 6, name: "شنبه" }
  ]

  hours = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const time = `${hour.toString().padStart(2, '0')}:${minute}`;

    const now = moment();
    const slotTime = moment().startOf('day');
    slotTime.set({
      hour: +time.split(':')[0],
      minute: +time.split(':')[1]
    });

    return {
      name: time,
      code: i
    };
  });
  doctorSchedule: any = [];
  hoveredBreak: any = '';
  constructor(
    private mainService: MainService,
    private toastR: ToastrService
  ) { }

  ngOnInit() {
    this.getClinics();
    this.scheduleRows = this.weekDays.map(d => ({
      day: d,
      active: false,
      fromTime: this.hours[0],
      toTime: this.hours[47],
      isBreak: false,
      code: d.code,
      breaks: []
    }));
  }

  ngOnChanges() {
    this.getDoctorSchedules(this.userId);
  }

  async getClinics() {
    try {
      let res = await this.mainService.getClinics().toPromise();
      this.clinicsList = res;
      this.clinicsList.forEach((clinic: any) => {
        clinic.code = clinic.id;
      });
      this.newSchedule.clinic = this.clinicsList[0];
    }
    catch {
      this.toastR.error('خطا!', 'خطا در دریافت اطلاعات')
    }
  }

  validateRows(rows: any[]) {
    for (let row of rows) {
      if (this.timeToNumber(row.fromTime.name) > this.timeToNumber(row.toTime.name)) {
        this.toastR.error('زمان شروع روز ' + row.day.name + ' بعد از زمان پایان است')
        return false;
      }
    }
    return true;
  }

  timeToNumber(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  buildPayload(row: any, isBreak) {
    if (isBreak) {
      return {
        businessId: this.newSchedule.clinic.code,
        practitionerId: this.userId,
        day: row.day.code,
        fromTime: row.breakFromTime['name'],
        toTime: row.breakToTime['name'],
        isBreak: row.isBreak,
        isActive: row.active,
        duration: 0,
        editOrNew: -1
      }
    }
    return {
      businessId: this.newSchedule.clinic.code,
      practitionerId: this.userId,
      day: row.day.code,
      fromTime: row.fromTime['name'],
      toTime: row.toTime['name'],
      isBreak: row.isBreak,
      isActive: row.active,
      duration: 0,
      editOrNew: -1
    }
  }

  saveAll() {
    const activeDays = this.scheduleRows.filter(r => r.active);
    if (activeDays.length === 0) {
      this.toastR.error("هیچ روزی انتخاب نشده!");
      return;
    }
    let validation = this.validateRows(activeDays);
    if (validation) {
      activeDays.forEach(day => {
        let dayModel = this.buildPayload(day, day.isBreak);
        this.saveDoctorSchedule(dayModel);
      });
    }
  }

  async saveDoctorSchedule(model) {
    try {
      let res: any = await this.mainService.saveDoctorSchedule(model).toPromise();
      if (res.status == 0) {
        this.toastR.success("با موفقیت ذخیره شد!");
        this.getDoctorSchedules(this.userId);
      }
    }
    catch { }
  }

  async getDoctorSchedules(userId) {
    try {
      let res: any = await this.mainService.getDoctorSchedules(userId).toPromise();
      if (res.length > 0) {
        this.doctorSchedule = res;
        this.handelByClinic();

      }
    } catch { }
  }

  handelByClinic() {
    this.scheduleRows = [];
    this.scheduleRows = this.weekDays.map(d => ({
      day: d,
      active: false,
      fromTime: this.hours[0],
      toTime: this.hours[47],
      isBreak: false,
      code: d.code,
      breaks: [],
      hasBreak: false
    }));
    let res = this.doctorSchedule.filter(x => x.businessId == this.newSchedule.clinic.code)
    res.forEach(item => {
      let dayData = {
        id: item.id,
        active: item.isActive ?? false,
        code: item.id ?? 0,
        day: this.weekDays.filter(day => day.code == item.day)[0],
        fromTime: this.hours.filter(hour => hour.name == item.fromTime.substring(0, 5))[0],
        toTime: this.hours.filter(hour => hour.name == item.toTime.substring(0, 5))[0],
        isBreak: item.isBreak ?? false
      }

      if (item.isBreak) {
        this.scheduleRows[item.day].breaks.push(dayData);
        this.scheduleRows[item.day].hasBreak = true;
      } else {
        this.scheduleRows[item.day].active = item.isActive;
        this.scheduleRows[item.day].code = item.id;
        this.scheduleRows[item.day].day = this.weekDays.filter(day => day.code == item.day)[0];
        this.scheduleRows[item.day].fromTime = this.hours.filter(hour => hour.name == item.fromTime.substring(0, 5))[0];
        this.scheduleRows[item.day].toTime = this.hours.filter(hour => hour.name == item.toTime.substring(0, 5))[0];
        this.scheduleRows[item.day].isBreak = false;
      }
    });
  }

  async deleteSchedule(scheduleId) {
    Swal.fire({
      title: "آیا از حذف این مکان مطمئن هستید ؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      try {
        if (result.value) {
          let res: any = await this.mainService.deleteDoctorSchedule(scheduleId).toPromise();
          if (res.status == 0) {
            this.toastR.success("با موفقیت حذف شد!")
            this.getDoctorSchedules(this.userId)
          }
        }
      }
      catch {
        this.toastR.error('خطایی رخ داد', 'خطا!')
      }
    })
  }
}