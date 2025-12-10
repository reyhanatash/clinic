import { MainService } from './../../_services/main.service';
import { Component, ElementRef, Renderer2 } from '@angular/core';
import { SharedModule, ShamsiUTCPipe } from "../../share/shared.module";
import { FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../_services/user.service';
import { MatCardModule } from '@angular/material/card';
import moment from 'moment-jalaali';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastrService } from 'ngx-toastr';
import { PatientService } from '../../_services/patient.service';
import { TreatmentsService } from '../../_services/treatments.service';
import { firstValueFrom } from 'rxjs';
import { UtilService } from '../../_services/util.service';
import { ObjectService } from '../../_services/store.service';
@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [SharedModule, FormsModule, CommonModule, MatCardModule, DialogModule, DropdownModule],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css'
})
export class AppointmentComponent {
  private _selectedDate: Date | null = null;

  appointmentsData: any = [];
  today: any;

  datePickerConfig = {
    locale: 'fa',
    format: 'jYYYY/jMM/jDD',
    displayMode: 'popup',
    theme: 'material',
    showGoToCurrent: true
  };
  // hours = Array.from({ length: 48 }, (_, i) => {
  //   const hour = Math.floor(i / 2);
  //   const minute = i % 2 === 0 ? '00' : '30';
  //   return `${hour.toString().padStart(2, '0')}:${minute}`;
  // });


  hours = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const time = `${hour.toString().padStart(2, '0')}:${minute}`;

    const now = moment(); // الان
    const slotTime = moment().startOf('day');
    slotTime.set({
      hour: +time.split(':')[0],
      minute: +time.split(':')[1]
    });

    return {
      time,
      isBeforeNow: slotTime.isBefore(now)
    };
  });


  weekDays: any = [];
  timeSheetHeaderDate: any;
  showNewAppointment: boolean = false;
  pateints: any = [];
  selectedPateint: any;
  appointmentTypes: any = [];
  selectedType: any;
  patientsList: any = [];
  appointmentStartTime: any;
  newAppointmentModel: any = [];
  appointmentDate: any;
  clinicId: any;
  timeSheetData: any = [];
  editmode: boolean = false;
  clinicsList: any = [];
  selectedClinic: any;
  weekMode: any = 0;
  dayIndexMap = {
    Saturday: 0,
    Sunday: 1,
    Monday: 2,
    Tuesday: 3,
    Wednesday: 4,
    Thursday: 5
  };
  weeklyTimetable: any = [];
  weeklyAppointments: any = [];
  weekDaysAppointmentCount: any = [];
  get selectedDate(): any {
    return this._selectedDate;
  }

  set selectedDate(value: any) {
    this._selectedDate = value;
    this.changeDate(0);
  }

  isBeforeNow: boolean;
  isCalendarVisible = true;
  newPateint: any = [];
  doctorList: any = [];
  selectedDoctor: any = [];
  filteredHours: any = [];

  constructor(
    private userService: UserService,
    private toastR: ToastrService,
    private treatmentService: TreatmentsService,
    private patientService: PatientService,
    private mainService: MainService,
    private utilService: UtilService,
    private renderer: Renderer2,
    private el: ElementRef,
    private objectService: ObjectService
  ) {
  }

  config: any = {
    hideInputContainer: true,
    hideOnOutsideClick: false,
    drops: "down",
    showNearMonthDays: false
  };

  dateNew: any;
  holidays: any = [];
  userType: number;
  userAppointmentsSettings: any = [];
  searchControl = '';
  async ngOnInit() {
    if (this.checkAccess(1)) {
      this.userType = this.utilService.checkUserType();
      if (this.userType == 9) {
        this.selectedDoctor.code = this.userType;
      }
      this.getWeeklyAppointments();
      this.dateNew = new FormControl(moment().format('jYYYY/jMM/jDD'));
      this.dateNew.valueChanges.subscribe(date => {
        this.onDateSelect(date);
      });

      this.today = moment();
      if (this.userType != 9) {
        await this.getUsers();
      } else {
        this.getDoctorSchedules(2);
      }
      // this.selectedDate = this.today;
      await this.getPatients();
      await this.getAppointmentTypes();
      await this.getClinics();
      await this.getAppointment(this.today);
      this.today = this.today._d;
      this.getCurrentWeek(1);
      this.getWeeklyAppointments();
      const jalaliYear = moment().format('jYYYY');
      this.utilService.getIranianHolidaysWithFridays(jalaliYear).subscribe(days => {
        this.holidays = days
        this.addHoliday();
      });
    }
  }


  ngAfterViewInit() {
    const calendarEl = this.el.nativeElement.querySelector('#appointment');
    const observer = new MutationObserver(() => {
      const switchViewEl = document.querySelector('.switch-view.dp-btn');
      const text = switchViewEl.textContent?.trim();
      const parts = text?.split(' ');
      this.utilService.getIranianHolidaysWithFridays(parts[1]).subscribe(days => {
        this.holidays = days
        this.addHoliday();
        this.getDoctorSchedules(this.userType != 9 ? 1 : 2);
      });
    });

    observer.observe(calendarEl, {
      childList: true,
      subtree: true
    });
  }



  addHoliday() {
    setTimeout(() => {
      const cells = this.el.nativeElement.querySelectorAll('.dp-btn');
      cells.forEach((cell: HTMLElement) => {
        const label = cell.innerText.trim();
        const fullDate = this.buildFullDate(label);
        if (this.isHoliday(fullDate)) {
          this.renderer.addClass(cell, 'holiday-day');
        }
      });
    }, 300);
  }


  buildFullDate(dayLabel: string): string {
    let jalaliYear = moment().format('jYYYY');
    let jalaliMonth = moment().format('jMM');
    const switchViewEl = document.querySelector('.switch-view.dp-btn');
    if (switchViewEl) {
      const text = switchViewEl.textContent?.trim();
      const parts = text?.split(' ');
      if (parts && parts.length === 2) {
        const monthName = parts[0];
        const yearText = parts[1];
        const monthMap: { [key: string]: string } = {
          'فروردین': '01',
          'اردیبهشت': '02',
          'خرداد': '03',
          'تیر': '04',
          'مرداد': '05',
          'شهریور': '06',
          'مهر': '07',
          'آبان': '08',
          'آذر': '09',
          'دی': '10',
          'بهمن': '11',
          'اسفند': '12'
        };
        jalaliMonth = monthMap[monthName] || jalaliMonth;
        jalaliYear = yearText;
      }
    }

    const paddedDay = dayLabel.padStart(2, '0');
    return `${jalaliYear}/${jalaliMonth}/${paddedDay}`;
  }


  isHoliday(date: string): boolean {
    return this.holidays.includes(date);
  }




  changeDate(status: number) {
    let formattedDate: any = '';

    switch (status) {
      case 1:
        formattedDate = moment(this.appointmentDate);
        this.appointmentDate = formattedDate.clone().add(1, 'day').toDate();
        this.getAppointment(this.appointmentDate);
        break;

      case 0:
        // formattedDate = moment(this.selectedDate);
        formattedDate = moment(this.dateNew.value, 'jYYYY/jMM/jDD').add(3.5, 'hours');
        this.appointmentDate = formattedDate.clone().toDate();
        this.getAppointment(this.appointmentDate);
        break;

      case -1:
        formattedDate = moment(this.appointmentDate);
        this.appointmentDate = formattedDate.clone().subtract(1, 'day').toDate();
        this.getAppointment(this.appointmentDate);
        break;


      case 14:
        formattedDate = moment(this.appointmentDate);
        this.appointmentDate = formattedDate.clone().add(2, 'weeks').toDate();
        this.getAppointment(this.appointmentDate);
        break;

      case 28:
        formattedDate = moment(this.appointmentDate);
        this.appointmentDate = formattedDate.clone().add(4, 'weeks').toDate();
        this.getAppointment(this.appointmentDate);
        break;

      case 42:
        formattedDate = moment(this.appointmentDate);
        this.appointmentDate = formattedDate.clone().add(6, 'weeks').toDate();
        this.getAppointment(this.appointmentDate);
        break;

      case 90:
        formattedDate = moment(this.appointmentDate);
        this.appointmentDate = formattedDate.clone().add(3, 'months').toDate();
        this.getAppointment(this.appointmentDate);
        break;

      case 180:
        formattedDate = moment(this.appointmentDate);
        this.appointmentDate = formattedDate.clone().add(6, 'months').toDate();
        this.getAppointment(this.appointmentDate);
        break;

      case 365:
        formattedDate = moment(this.appointmentDate);
        this.appointmentDate = formattedDate.clone().add(12, 'months').toDate();
        this.getAppointment(this.appointmentDate);
        break;

      default:
        break;
    }
    this.isBeforeNow = moment(this.appointmentDate).isBefore(moment().startOf('day'));
    this.getUserAppointmentsSettings();
  }


  async getAppointment(date: any) {
    const shamsiTimePipe = new ShamsiUTCPipe()
    this.hours.forEach(hour => this.timeSheetData[hour.time] = []);
    try {
      let formattedDate = moment(date).utc().toISOString();
      let doctor = this.userType == 9 ? null : this.selectedDoctor?.code
      let model = {
        clinicId: this.selectedClinic.code,
        date: formattedDate,
        doctorId: doctor
      }
      // let formattedDate = moment(date).format('YYYY-MM-DD');
      let res: any = await this.treatmentService.getAppointments(model).toPromise();
      this.appointmentsData = res;
      this.appointmentsData.forEach((appointment: any) => {
        appointment.typeName = this.appointmentTypes.filter((type: any) => type.id == appointment.appointmentTypeId)[0].name;
        appointment.patientName = this.patientsList.filter((patient: any) => patient.id == appointment.patientId)[0].name;
        appointment.showStartTime = shamsiTimePipe.transform(appointment.start);
        // let startIndex = this.hours.indexOf(appointment.showStartTime);
        let startIndex = this.hours.findIndex(h => h.time === appointment.showStartTime);
        if (startIndex !== -1) {
          this.timeSheetData[this.hours[startIndex].time].push(appointment);
        }
      });
      this.timeSheetHeaderDate = date._d;
    }
    catch { }
  }

  async createAppointment() {
    try {
      let model = {
        "businessId": this.selectedClinic.code,
        "practitionerId": this.selectedDoctor ? this.selectedDoctor.code : null,
        // "patientId": this.newAppointmentModel.selectedPatient.code,
        "patientId": this.newAppointmentModel.selectedPatient,
        "appointmentTypeId": this.newAppointmentModel.selectedType.code,
        "start": this.newAppointmentModel.appointmentStartTime,
        "end": this.newAppointmentModel.appointmentEndTime,
        "repeatId": null,
        "repeatEvery": null,
        "endsAfter": null,
        "note": this.newAppointmentModel.note,
        "arrived": null,
        "waitListId": null,
        "cancelled": null,
        "appointmentCancelTypeId": null,
        "cancelNotes": null,
        "isUnavailbleBlock": null,
        "modifierId": null,
        "createdOn": null,
        "lastUpdated": null,
        "isAllDay": null,
        "sendReminder": null,
        "appointmentSMS": null,
        "ignoreDidNotCome": null,
        "creatorId": null,
        "byInvoice": null,
        "editOrNew": this.editmode == true ? this.newAppointmentModel.id : -1
      }
      let res = await this.treatmentService.createAppointment(model).toPromise();
      this.toastR.success('با موفقیت ثبت شد')
      this.getAppointment(this.appointmentDate);
      this.getWeeklyAppointments()
      this.newAppointmentModel = [];
      this.showNewAppointment = false;
      this.editmode = false;
    }
    catch (err) {
      this.toastR.error('خطا!', 'خطا در ثبت وقت')
    }
  }

  setNewAppointment(time: any) {
    if (!this.checkAccess(2)) { return }

    if (this.isBeforeNow || this.timeIsBeforeNow(this.appointmentDate, time.time)) {
      this.toastR.error('ثبت وقت برای ساعت های پیشین ممکن نیست! ')
      return
    }
    if (time.isInSchedule == false) {
      this.toastR.error('ثبت وقت برای این ساعت ممکن نیست! ')
      return
    }
    else {
      // this.newAppointmentModel = [];
      this.newAppointmentModel.appointmentStartTime = this.combineDateAndTime(this.appointmentDate, time.time);
      this.newAppointmentModel.appointmentEndTime = this.combineDateAndTime(this.appointmentDate, this.getEndTime(time.time))
      this.showNewAppointment = true;
      this.newAppointmentModel.handelNewPateintStatus = false;
      this.newAppointmentModel.time = time['time'];
      this.patientsList = [];
      this.searchControl = null;
    }
    this.isTimeInRange(time['time']);
  }

  async getPatients() {
    // try {
    //   let res: any = await this.patientService.getPatients().toPromise();
    //   if (res.length > 0) {
    //     this.patientsList = res;
    //     this.patientsList.forEach((patient: any) => {
    //       patient.name = patient.firstName + ' ' + patient.lastName;
    //       patient.code = patient.id;
    //     });
    //   }
    // }
    // catch {
    //   this.toastR.error('خطا!', 'خطا در دریافت اطلاعات')
    // }
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
      this.toastR.error('خطا!', 'خطا در دریافت اطلاعات')
    }
  }

  combineDateAndTime(dateInput: any, timeInput: any): string {
    const date = new Date(dateInput);
    const timeString = String(timeInput);
    const [hours, minutes] = timeString.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  }

  getEndTime(startTime: string, durationMinutes: number = 15) {
    const [hours, minutes] = startTime.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + durationMinutes);
    const endHours = String(date.getHours()).padStart(2, "0");
    const endMinutes = String(date.getMinutes()).padStart(2, "0");
    return `${endHours}:${endMinutes}`;
  }

  editAppointment(appointment: any) {
    this.newAppointmentModel.id = appointment.id;
    this.newAppointmentModel.selectedType = this.appointmentTypes.filter((type: any) => type.id == appointment.appointmentTypeId)[0];
    // this.newAppointmentModel.selectedPatient = this.patientsList.filter((patient: any) => patient.id == appointment.patientId)[0];
    this.newAppointmentModel.selectedPatient = appointment.patientId;
    this.newAppointmentModel.appointmentStartTime = appointment.start;
    this.newAppointmentModel.appointmentEndTime = appointment.end;
    this.newAppointmentModel.note = appointment.note;
    this.showNewAppointment = true;
    this.newAppointmentModel.handelNewPateintStatus = false;
    this.patientsList = [];
    this.searchControl = null;
    this.editmode = true;
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
    catch {
      this.toastR.error('خطا!', 'خطا در دریافت اطلاعات')
    }
  }

  closeNewAppointmentModal() {
    this.showNewAppointment = false;
    this.newAppointmentModel = [];
  }

  async getCurrentWeek(time) {
    let currentDate = moment(this.appointmentDate);
    let weekStart: any = currentDate.clone().locale('fa').startOf('week');
    let daysOfWeek = [];
    let isInSchedule = await this.setWeeklyScheduleForDay(weekStart.day(), time);

    for (let i = 0; i < 6; i++) {
      daysOfWeek.push({
        dayName: weekStart.locale('fa').format('dddd'),
        dayNumber: weekStart.format('jDD'),
        fullDate: weekStart.toDate(),
        isToday: weekStart.isSame(moment(), 'day'),
        isPast: weekStart.isBefore(moment(), 'day'),
        dayAppointments: [],
        isInSchedule: isInSchedule
      });
      weekStart.add(1, 'day');
    }

    this.weekDays = daysOfWeek;
    return this.weekDays;
  }

  // async setWeeklyScheduleForDay(dayOfWeek: number, time) {
  //   try {
  //     let res: any = await this.mainService.getDoctorSchedules(this.selectedDoctor.code).toPromise();
  //     if (res) {
  //       let daySchedules = res;
  //       daySchedules = daySchedules.filter((x: any) => x.day == dayOfWeek);
  //       const [hourStr, minuteStr] = time.split(':');
  //       const hourNum = parseInt(hourStr, 10);
  //       const minuteNum = parseInt(minuteStr, 10);
  //       const decimalTime = hourNum + (minuteNum === 30 ? 0.5 : 0);
  //       const isAvailable = daySchedules.some((sched: any) =>
  //         decimalTime >= sched.calendarTimeFrom && decimalTime < sched.calendarTimeTo
  //       );
  //       return isAvailable;
  //     }
  //   }
  //   catch {
  //     return false;
  //   }
  // }


  async setWeeklyScheduleForDay(dayOfWeek: number, time: string) {
    try {
      let res: any = await this.mainService.getDoctorSchedules(this.selectedDoctor.code).toPromise();
      if (!res) return false;
      let daySchedules = res.filter((x: any) => x.day == dayOfWeek);
      if (daySchedules.length == 0) return false;

      const [hourStr, minuteStr] = time.split(':');
      const hourNum = parseInt(hourStr, 10);
      const minuteNum = parseInt(minuteStr, 10);
      const decimalTime = hourNum + (minuteNum === 30 ? 0.5 : 0);

      const isAvailable = daySchedules.some((sched: any) =>
        decimalTime >= sched.fromTime &&
        decimalTime < sched.toTime
      );
      return isAvailable;
    } catch {
      return false;
    }
  }


  setWeeklyNewAppointment(date: any, time: any, isPast: any) {
    if (isPast || this.timeIsBeforeNow(date, time)) {
      this.toastR.error('ثبت وقت برای روزهای پیشین ممکن نیست! ')
      return
    }
    else {
      this.newAppointmentModel.appointmentStartTime = this.combineDateAndTime(date, time);
      this.newAppointmentModel.appointmentEndTime = this.combineDateAndTime(date, this.getEndTime(time))
      this.showNewAppointment = true;
      this.newAppointmentModel.handelNewPateintStatus = false;
      this.newAppointmentModel.time = time['time'];
      this.patientsList = [];
      this.searchControl = null;
    }
    this.isTimeInRange(time['time']);
  }

  async getWeeklyAppointments() {
    const shamsiTimePipe = new ShamsiUTCPipe()
    this.hours.forEach(async hour => this.weeklyTimetable[hour.time] = await this.getCurrentWeek(hour.time));
    let res: any = await this.treatmentService.getWeeklyAppointments().toPromise();
    this.weeklyAppointments = this.transformAppointments(res);
    this.weeklyAppointments.forEach(appointment => {
      appointment.patientName = this.patientsList.filter((patient: any) => patient.patientCode == appointment.patientId)[0].name;
      // let startIndex = this.hours.indexOf(appointment.time);
      let startIndex = this.hours.findIndex(h => h.time === appointment.time);
      this.weeklyTimetable[this.hours[startIndex].time][appointment.dayOfWeek].dayAppointments.push(appointment);
    });
    console.log(this.weeklyTimetable);

  }

  onDateSelect(date: string) {
    this.isCalendarVisible = false;
    setTimeout(() => {
      this.isCalendarVisible = true;
    }, 10);
    this.changeDate(0);
  }

  transformAppointments(data: any) {
    const dayMap: Record<string, number> = {
      Saturday: 0,
      Sunday: 1,
      Monday: 2,
      Tuesday: 3,
      Wednesday: 4,
      Thursday: 5
    }
    const result = Object.entries(data)
      .flatMap(([day, appointments]) =>
        (appointments as any[]).map((appointment) => ({
          ...appointment,
          dayOfWeek: dayMap[day] ?? null,
        }))
      );
    return result;
  }


  timeIsBeforeNow(date: Date, hour: string): boolean {
    const [h, m] = hour.split(':').map(Number);
    const slot = moment(date).hour(h).minute(m).second(0);
    return slot.isBefore(moment());
  }


  async createPatient() {
    if (!this.newPateint.firstName || !this.newPateint.lastName || !this.newPateint.mobile) {
      this.toastR.error('تمامی موارد خواسته شده رو تکمیل کیند');
      return
    }
    let model = {
      titleId: null,
      firstName: this.newPateint.firstName,
      lastName: this.newPateint.lastName,
      gender: null,
      fatherName: null,
      birthDate: null,
      city: null,
      note: null,
      referringInsurerId: null,
      referringInsurer2Id: null,
      referringContactId: null,
      referringContact2Id: null,
      nationalCode: null,
      jobId: null,
      referringInpatientInsurerId: null,
      editOrNew: -1,
      mobile: this.newPateint.mobile,
    }
    let res: any = await firstValueFrom(this.patientService.savePatient(model));
    if (res) {
      this.toastR.success('با موفقیت ثبت شد!');
      await this.getPatients();
      this.newAppointmentModel.selectedPatient = res['data'];
    }
  }

  async getUsers() {
    let res: any = await this.userService.getAllUsers().toPromise();
    this.doctorList = res.filter(x => x.roleId == 9);
    this.doctorList.forEach(user => {
      user.code = user.id;
      user.name = user.firstName + ' ' + user.lastName;
    });
    this.selectedDoctor = this.doctorList[0];
    this.getDoctorSchedules(1);
  }


  getDetailOfDoctore() {
    this.getUserAppointmentsSettings();
    this.getDoctorSchedules(1);
    if (this.newAppointmentModel.time) {
      this.isTimeInRange(this.newAppointmentModel.time);
    }
    this.getAppointment(this.appointmentDate);
    if (this.weekMode) {
      this.getWeeklyAppointments();
    }
  }

  async getDoctorSchedules(type) {
    let userId;
    let res: any;
    try {
      if (type == 1) {
        if (!this.selectedDoctor.code) {
          return
        }
        userId = this.selectedDoctor.code;
        res = await this.mainService.getDoctorSchedules(userId).toPromise();

      } else {
        userId = null;
        res = await this.mainService.getDoctorSchedulesForDoctor().toPromise();
      }
      if (res.length > 0) {
        let weekday: any = [];
        let year: string;
        await res.forEach(element => {
          year = moment(element.createdOn).format('jYYYY');
          weekday.push(element.day);
        });
        const unique = [...new Set(weekday)];
        this.getWeekdayDatesForDoctor(year, unique);
      } else {
        this.addDaysForDoctor([]);
      }
    }
    catch { }
  }

  getWeekdayDatesForDoctor(jalaliYear: string, weekdays) {
    const dates: string[] = [];
    let date = moment(`${jalaliYear}/01/01`, 'jYYYY/jMM/jDD');
    while (date.jYear() === parseInt(jalaliYear)) {
      if (weekdays.includes(date.day())) {
        dates.push(date.format('jYYYY/jMM/jDD'));
      }
      date.add(1, 'day');
    }
    this.addDaysForDoctor(dates)
  }

  addDaysForDoctor(dates: string[]) {
    setTimeout(() => {
      const cells = this.el.nativeElement.querySelectorAll('.dp-btn');
      cells.forEach((cell: HTMLElement) => {
        const label = cell.innerText.trim();
        const fullDate = this.buildFullDate(label);
        if (dates.includes(fullDate)) {
          this.renderer.addClass(cell, 'doctor-days');
        } else {
          this.renderer.removeClass(cell, 'doctor-days');
        }
      });
    }, 300);
  }

  async getUserAppointmentsSettings() {
    if (!this.selectedDoctor.code) {
      return
    }
    let userId;
    if (this.userType == 9) {
      userId = -1;
    } else {
      userId = this.selectedDoctor.code
    }
    try {
      let model = {
        userId: userId,
        businessId: this.selectedClinic ? this.selectedClinic.code : null,
      }
      let res: any = await this.mainService.getUserAppointmentsSettings(model).toPromise();
      this.userAppointmentsSettings = res;
      this.filteredHours = this.hours.filter(({ time }) => {
        const [hourStr, minuteStr] = time.split(':');
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);
        const decimalTime = hour + (minute === 30 ? 0.5 : 0);
        return res.some(config =>
          decimalTime >= config.calendarTimeFrom &&
          decimalTime < config.calendarTimeTo
        );
      });
      this.setDoctorScheduleBasedHours(this.filteredHours, this.appointmentDate);
    }
    catch { }
  }

  async setDoctorScheduleBasedHours(filteredHours: any, selectedDate: any) {
    try {
      let res: any = await this.mainService.getDoctorSchedules(this.selectedDoctor.code).toPromise();
      if (res.length > 0) {
        let selectedDay = moment(selectedDate).day();
        let daySchedules = res.filter(x => x.day == selectedDay);
        filteredHours.forEach(hour => {
          const [hourStr, minuteStr] = hour.time.split(':');
          const hourNum = parseInt(hourStr, 10);
          const minuteNum = parseInt(minuteStr, 10);
          const decimalTime = hourNum + (minuteNum === 30 ? 0.5 : 0);

          hour.isInSchedule = daySchedules.some(cfg =>
            decimalTime >= this.toDecimal(cfg.fromTime) &&
            decimalTime < this.toDecimal(cfg.toTime)
          );
        });
      }
      console.log(filteredHours);

    }
    catch { }
  }


  toDecimal(time: string) {
    const [h, m] = time.split(':').map(Number);
    return h + (m === 30 ? 0.5 : 0);
  }

  isTimeInRange(time: string) {
    const [hourStr, minuteStr] = time.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const decimalTime = hour + (minute === 30 ? 0.5 : 0);
    this.userAppointmentsSettings.forEach(element => {
      if (decimalTime >= element.calendarTimeFrom && decimalTime < element.calendarTimeTo) {
        this.newAppointmentModel.selectedType = this.appointmentTypes.filter((type: any) => type.id == element.defaultAppointmentTypeId)[0];
        this.newAppointmentModel.userAppointmentsSettingsId = element.id;
      }
    });
  }

  handelNewPateint(type) {
    let element = this.userAppointmentsSettings?.filter(x => x.id == this.newAppointmentModel.userAppointmentsSettingsId)[0];
    if (type == 1) {
      this.newAppointmentModel.handelNewPateintStatus = true;
      this.newAppointmentModel.selectedType = this.appointmentTypes.filter((type: any) => type.id == element.newPatientAppointmentTypeId)[0];
    } else {
      this.newAppointmentModel.handelNewPateintStatus = false;
      this.newAppointmentModel.selectedType = this.appointmentTypes.filter((type: any) => type.id == element.defaultAppointmentTypeId)[0];
    }
  }

  async getFilteredPatient() {
    try {

      let model = {
        value: this.searchControl,
      }
      let res: any = await this.patientService.getFilteredPatient(model).toPromise();
      if (res['data'].length > 0) {
        this.patientsList = res['data'];
        this.patientsList.forEach(element => {
          element.name = element.firstName + " " + element.lastName;

        });
      } else {
        this.patientsList = [];
      }
    }
    catch { }
  }

  checkAccess(id) {
    return this.objectService.checkAccess(id);
  }

}