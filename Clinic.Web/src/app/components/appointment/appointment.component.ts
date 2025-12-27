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
import Swal from 'sweetalert2';
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
  isCalendarVisible: boolean = false;
  newPateint: any = [];
  doctorList: any = [];
  selectedDoctor: any = [];
  filteredHours: any = [];
  dropdownOpen: boolean = false;
  selectedPatientName: string = null;
  isCalendar2Visible: boolean = false;
  selectedDoctorList: any = [];
  listOfDoctorForCreateAppointment: any = [];
  isServiceBase: boolean = false;

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
  ) { }

  config: any = {
    hideInputContainer: true,
    hideOnOutsideClick: false,
    drops: "down",
    showNearMonthDays: false
  };

  dateNew: any;
  secondCalendarDateNew: any;
  firstCalendarDateNew: any;
  holidays: any = [];
  userType: number;
  userAppointmentsSettings: any = [];
  searchControl = '';
  allowedLinks: any = [];
  doctors: any = [];
  serviceBaselist: any = [];
  servicesList: any = [];

  async ngOnInit() {
    this.allowedLinks = await this.objectService.getDataAccess();
    if (this.checkAccess(1)) {
      this.userType = this.utilService.checkUserType();
      this.dateNew = new FormControl(moment().format('jYYYY/jMM/jDD'));
      this.firstCalendarDateNew = new FormControl(moment(this.dateNew).format('jYYYY/jMM/jDD'));
      this.secondCalendarDateNew = new FormControl(moment(this.dateNew).add(1, 'month').format('jYYYY/jMM/jDD'));
      await this.getClinics();
      await this.getBillableItems();
      if (this.userType != 9) {
        await this.getUsers();
      } else {
        await this.getDoctorSchedules(2);
      }
      if (this.userType == 9) {
        this.selectedDoctor = this.userType;
      }
      this.firstCalendarDateNew.valueChanges.subscribe(async (date: any) => {
        this.onDateSelect(date);
      });

      this.today = moment();
      // this.selectedDate = this.today;
      await this.getPatients();
      await this.getAppointmentTypes();
      await this.getAppointment(this.today);
      this.today = this.today._d;
      // this.getCurrentWeek(1);
      this.getWeeklyAppointments();
      const jalaliYear = moment().format('jYYYY');
      this.utilService.getIranianHolidaysWithFridays(jalaliYear).subscribe(days => {
        this.holidays = days
        this.addHoliday();
      });
    } else {
      this.toastR.error("شما دسترسی به این صفحه ندارید");
    }
  }


  ngAfterViewInit() {
    this.isCalendarVisible = true;
    const calendarEl = this.el.nativeElement.querySelector('#appointment');
    if (calendarEl) {
      const observer = new MutationObserver(() => {
        const switchViewEl = document.querySelector('.switch-view.dp-btn');
        const text = switchViewEl?.textContent?.trim();
        const parts = text?.split(' ');
        if (parts?.[1]) {
          this.utilService.getIranianHolidaysWithFridays(parts[1]).subscribe(days => {
            this.holidays = days;
            this.addHoliday();
            this.getDoctorSchedules(this.userType != 9 ? 1 : 2);
          });
        }
      });
      observer.observe(calendarEl, {
        childList: true,
        subtree: true
      });
    } else {
      console.error('#appointment element not found');
    }

    const calendarEl2 = this.el.nativeElement.querySelector('#appointment2');
    if (calendarEl2) {
      const observer = new MutationObserver(() => {
        const switchViewEl = document.querySelector('.switch-view.dp-btn');
        const text = switchViewEl?.textContent?.trim();
        const parts = text?.split(' ');
        if (parts?.[1]) {
          this.utilService.getIranianHolidaysWithFridays(parts[1]).subscribe(days => {
            this.holidays = days;
            this.addHoliday();
            this.getDoctorSchedules(this.userType != 9 ? 1 : 2);
          });
        }
      });
      observer.observe(calendarEl, {
        childList: true,
        subtree: true
      });
    } else {
      console.error('#appointment element not found');
    }
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




  changeDate(status: number, date?: any) {
    let formattedDate: any = '';

    switch (status) {
      case 1:
        formattedDate = moment(this.appointmentDate);
        this.appointmentDate = formattedDate.clone().add(1, 'day').toDate();
        this.getAppointment(this.appointmentDate);
        break;

      case 0:
        // formattedDate = moment(this.selectedDate);
        formattedDate = moment(date, 'jYYYY/jMM/jDD').add(3.5, 'hours');
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
    this.getWeeklyAppointments();
  }


  async getAppointment(date: any) {
    this.timeSheetData = [];
    const shamsiTimePipe = new ShamsiUTCPipe()
    this.hours.forEach(hour => this.timeSheetData[hour.time] = []);
    try {
      let formattedDate = moment(date).utc().toISOString();
      if (this.selectedDoctor.length == 0 && this.userType != 9) {
        return
      }
      let doctor = this.userType == 9 ? null : this.selectedDoctor;
      let model = {
        clinicId: this.selectedClinic.code,
        date: formattedDate,
        doctorId: doctor
      }
      // let formattedDate = moment(date).format('YYYY-MM-DD');
      let res: any = await this.treatmentService.getAppointments(model).toPromise();
      this.appointmentsData = res;
      this.isServiceBase = this.selectedClinic['services'].length > 0;
      if (this.selectedClinic['services'].length > 0) {
        this.serviceBaselist = [];
        this.selectedClinic['services'].forEach(element => {
          let temp = this.servicesList.filter(x => x.id == element.billableItemId)[0];
          this.serviceBaselist = [...this.serviceBaselist, temp];
        });
      }
      this.appointmentsData.forEach((appointment: any) => {
        appointment.typeName = this.appointmentTypes.filter((type: any) => type.id == appointment.appointmentTypeId)[0]?.name;
        // appointment.patientName = this.patientsList.filter((patient: any) => patient.id == appointment.patientId)[0]?.name;
        appointment.showStartTime = shamsiTimePipe.transform(appointment.start);
        // let startIndex = this.hours.indexOf(appointment.showStartTime);
        let startIndex = this.hours.findIndex(h => h.time === appointment.showStartTime);
        if (startIndex !== -1) {
          this.timeSheetData[this.hours[startIndex].time].push(appointment);
        }
      });
      this.timeSheetHeaderDate = date._d;
      this.getDoctorSchedules(1);


    }
    catch { }
  }

  async createAppointment() {
    try {
      let model = {
        "businessId": this.selectedClinic.code,
        "practitionerId": this.newAppointmentModel.selectedDoctor.code,
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
        "services": this.isServiceBase == true ? (this.newAppointmentModel.selectedService ? (this.newAppointmentModel.selectedService || []).map(opt => opt.id).join(',') : null) : null,
        "editOrNew": this.editmode == true ? this.newAppointmentModel.id : -1
      }
      let res = await this.treatmentService.createAppointment(model).toPromise();
      this.toastR.success('با موفقیت ثبت شد')
      this.getAppointment(this.appointmentDate);
      this.getWeeklyAppointments();
      this.newAppointmentModel = [];
      this.showNewAppointment = false;
      this.editmode = false;
    }
    catch (err) {
      this.toastR.error('خطا!', 'خطا در ثبت وقت')
    }
  }

  setNewAppointment(time: any, doctorId) {
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
      this.newAppointmentModel.selectedDoctor = [];
      this.selectedPatientName = null;
      this.newAppointmentModel.appointmentStartTime = this.combineDateAndTime(this.appointmentDate, time.time);
      this.newAppointmentModel.appointmentEndTime = this.combineDateAndTime(this.appointmentDate, this.getEndTime(time.time))
      const matchedDoctors = this.doctorList.filter(doc => doc.code == doctorId);
      this.newAppointmentModel.selectedDoctor = matchedDoctors[0];
      // this.newAppointmentModel.selectedDoctorIds = matchedDoctors.map(doc => doc.id);
      this.newAppointmentModel.selectedDoctorName = matchedDoctors[0]['name'];
      this.showNewAppointment = true;
      this.newAppointmentModel.handelNewPateintStatus = false;
      this.newAppointmentModel.time = time['time'];
      this.patientsList = [];
      this.searchControl = null;
      // this.listOfDoctorForCreateAppointment = this.doctorList.filter(doc => time.ids.includes(doc.id));
      // if (this.listOfDoctorForCreateAppointment.length == 1) {
      //   this.newAppointmentModel.selectedDoctor = this.listOfDoctorForCreateAppointment[0];
      // }
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
    this.showNewAppointment = true;
    this.newAppointmentModel.id = appointment.id;
    this.newAppointmentModel.selectedType = this.appointmentTypes.filter((type: any) => type.id == appointment.appointmentTypeId)[0];
    // this.newAppointmentModel.selectedPatient = this.patientsList.filter((patient: any) => patient.id == appointment.patientId)[0];
    this.newAppointmentModel.selectedPatient = appointment.patientId;
    this.newAppointmentModel.appointmentStartTime = appointment.start;
    this.newAppointmentModel.appointmentEndTime = appointment.end;
    this.newAppointmentModel.note = appointment.note;
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
      this.isServiceBase = this.clinicsList[0]['isServiceBase'];
      if (this.selectedClinic['services'].length > 0) {
        this.serviceBaselist = [];
        this.selectedClinic['services'].forEach(element => {
          let temp = this.servicesList.filter(x => x.id == element.billableItemId)[0];
          this.serviceBaselist = [...this.serviceBaselist, temp];
        });
      }
    }
    catch {
      this.toastR.error('خطا!', 'خطا در دریافت اطلاعات')
    }
  }

  closeNewAppointmentModal() {
    this.showNewAppointment = false;
    this.newAppointmentModel = [];
  }

  async getCurrentWeek(res, time) {
    let currentDate = moment(this.appointmentDate);
    let weekStart: any = currentDate.clone().locale('fa').startOf('week');
    let daysOfWeek = [];
    let isInSchedule = await this.setWeeklyScheduleForDay(res, weekStart.day(), time);

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


  async setWeeklyScheduleForDay(res, dayOfWeek: number, time: string) {
    if (this.selectedDoctor.length == 0) {
      return
    }
    try {
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
    let formattedDate = moment(this.appointmentDate).utc().toISOString();
    let doctor = this.userType == 9 ? null : this.selectedDoctor;
    let data: any = await this.mainService.getDoctorSchedules(this.selectedDoctor).toPromise();
    this.hours.forEach(async hour => this.weeklyTimetable[hour.time] = await this.getCurrentWeek(data, hour.time));
    let model = {
      clinicId: this.selectedClinic.code,
      date: formattedDate,
      doctorId: doctor
    }
    let res: any = await this.treatmentService.getWeeklyAppointments(model).toPromise();
    this.weeklyAppointments = [];
    if (res.length > 0) {
      this.weeklyAppointments = this.transformAppointments(res);
      this.weeklyAppointments.forEach(appointment => {
        // appointment.patientName = this.patientsList.filter((patient: any) => patient.patientCode == appointment.patientId)[0].name;
        // let startIndex = this.hours.indexOf(appointment.time);
        appointment.showStartTime = shamsiTimePipe.transform(appointment.fullDate);
        let startIndex = this.hours.findIndex(h => h.time === appointment.showStartTime);
        // this.weeklyTimetable[this.hours[startIndex].time][appointment.dayOfWeek].dayAppointments.push(appointment);
        this.weeklyTimetable[this.hours[startIndex].time][appointment.dayNumber].dayAppointments.push(appointment);

      });
      // console.log(this.weeklyTimetable);
    }
  }

  onDateSelect(date: string) {
    this.isCalendarVisible = false;
    this.isCalendar2Visible = false;
    setTimeout(() => {
      this.isCalendarVisible = true;
      this.isCalendar2Visible = true;
    }, 10);
    this.changeDate(0, date);
  }

  transformAppointments(data: any) {
    const dayMap: Record<string, number> = {
      Saturday: 0,
      Sunday: 1,
      Monday: 2,
      Tuesday: 3,
      Wednesday: 4,
      Thursday: 5
    };

    const result = Object.entries(data).flatMap(([day, appointments]) => {
      let intDay = Number(day);
      if (Array.isArray(appointments)) {
        return appointments.map((appointment) => ({
          ...appointment,
          dayOfWeek: dayMap[intDay] ?? null,
        }));
      }
      if (appointments && typeof appointments === "object") {
        return [{
          ...appointments,
          dayOfWeek: dayMap[intDay] ?? null,
        }];
      }
      return [];
    });

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
    await this.doctorList.forEach(user => {
      user.code = user.id;
      user.name = user.firstName + ' ' + user.lastName;
    });
    this.selectedDoctorList = [...this.selectedDoctorList, this.doctorList[0]];
    this.getDetailOfDoctore();
    this.getDoctorSchedules(1);
  }


  getDetailOfDoctore() {
    this.selectedDoctor = null;
    this.selectedDoctor = this.selectedDoctorList ? (this.selectedDoctorList || []).map(opt => opt.id).join(',') : [];
    if (this.selectedDoctor.length > 0) {
      this.getUserAppointmentsSettings();
      // this.getDoctorSchedules(1);
      if (this.newAppointmentModel.time) {
        this.isTimeInRange(this.newAppointmentModel.time);
      }
      this.getAppointment(this.appointmentDate);
      // if (this.weekMode) {
      this.getWeeklyAppointments();
      // }
    }
  }

  async getDoctorSchedules(type) {
    let userId;
    let res: any;
    try {
      if (type == 1) {
        if (this.selectedDoctor.length == 0) {
          return
        }
        userId = this.selectedDoctor;
        res = await this.mainService.getDoctorSchedules(userId).toPromise();

      } else {
        userId = null;
        res = await this.mainService.getDoctorSchedulesForDoctor().toPromise();
      }
      if (res.length > 0) {
        res = res.filter(x => x.businessId == this.selectedClinic.code);
        let weekday: any = [];
        let year: string;
        await res.forEach(element => {
          year = moment(element.createdOn).format('jYYYY');
          weekday.push({
            day: element.day,
            doctor: element.doctorName
          });
        });
        const unique: any = [...new Set(weekday)];
        let margeData = this.mergeDoctors(unique);
        this.getWeekdayDatesForDoctor(year, margeData);
      } else {
        this.addDaysForDoctor([]);
      }
    }
    catch { }
  }

  mergeDoctors(data) {
    const map = new Map<number, Set<string>>();
    data.forEach(item => {
      if (!map.has(item.day)) {
        map.set(item.day, new Set());
      }
      map.get(item.day)!.add(item.doctor);
    });
    return Array.from(map.entries()).map(([day, doctors]) => ({
      day,
      doctor: Array.from(doctors).join(", ")
    }));
  }


  getWeekdayDatesForDoctor(jalaliYear: string, weekdays: { day: number, doctor: string }[]) {
    const dates: { date: string, doctor: string }[] = [];
    let date = moment(`${jalaliYear}/01/01`, 'jYYYY/jMM/jDD');
    while (date.jYear() === parseInt(jalaliYear)) {
      const match = weekdays.find(w => w.day === date.day());
      if (match) {
        dates.push({
          date: date.format('jYYYY/jMM/jDD'),
          doctor: match.doctor
        });
      }
      date.add(1, 'day');
    }
    this.addDaysForDoctor(dates);
  }

  addDaysForDoctor(dates: { date: string, doctor: string }[]) {
    setTimeout(() => {
      const cells = this.el.nativeElement.querySelectorAll('.dp-btn');
      cells.forEach((cell: HTMLElement) => {
        const label = cell.innerText.trim();
        const fullDate = this.buildFullDate(label);
        const match = dates.find(d => d.date === fullDate);
        if (match) {
          this.renderer.addClass(cell, 'doctor-days');
          this.renderer.setAttribute(cell, 'title', match.doctor);
        } else {
          this.renderer.removeClass(cell, 'doctor-days');
          this.renderer.removeAttribute(cell, 'title');
        }
      });
    }, 300);
  }


  async getUserAppointmentsSettings() {
    if (this.selectedDoctor.length == 0) {
      return
    }
    let userId;
    if (this.userType == 9) {
      userId = String(-1);
    } else {
      userId = this.selectedDoctor
    }
    try {
      let model = {
        userId: userId,
        businessId: this.selectedClinic ? this.selectedClinic.code : null,
      }
      let res: any = await this.mainService.getUserAppointmentsSettings(model).toPromise();
      this.userAppointmentsSettings = res;
      // this.filteredHours = this.hours.filter(({ time }) => {
      //   const [hourStr, minuteStr] = time.split(':');
      //   const hour = parseInt(hourStr, 10);
      //   const minute = parseInt(minuteStr, 10);
      //   const decimalTime = hour + (minute === 30 ? 0.5 : 0);
      //   return res.some(config =>
      //     decimalTime >= config.calendarTimeFrom &&
      //     decimalTime < config.calendarTimeTo
      //   );
      // });

      this.filteredHours = this.hours
        .map(({ time }) => {
          const [hourStr, minuteStr] = time.split(':');
          const hour = parseInt(hourStr, 10);
          const minute = parseInt(minuteStr, 10);
          const decimalTime = hour + (minute === 30 ? 0.5 : 0);
          const matches = res.filter(config =>
            decimalTime >= config.calendarTimeFrom &&
            decimalTime < config.calendarTimeTo
          );
          if (matches.length > 0) {
            return {
              time,
              ids: matches.map(m => m.practitionerId),
              names: matches.map(m => m.doctorName).join(",")
            };
          }
          return null;
        })
        .filter(item => item !== null);

      const doctorsMap = {};
      const rows = [];
      this.filteredHours.forEach(item => {
        item.ids.forEach((id, index) => {
          if (!doctorsMap[id]) {
            doctorsMap[id] = {
              id,
              name: item.names.split(',')[index].trim()
            };
          }
        });
      });

      this.filteredHours.forEach(item => {
        const row = {
          time: item.time,
          doctors: {}
        };

        Object.keys(doctorsMap).forEach(id => {
          row.doctors[id] = item.ids.includes(+id);
        });

        rows.push(row);
      });

      this.doctors = Object.values(doctorsMap);
      this.setDoctorScheduleBasedHours(this.filteredHours, this.appointmentDate);
    }
    catch { }
  }

  async setDoctorScheduleBasedHours(filteredHours: any, selectedDate: any) {
    if (this.selectedDoctor.length == 0) {
      return
    }
    try {
      let res: any = await this.mainService.getDoctorSchedules(this.selectedDoctor).toPromise();
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
    this.selectedPatientName = null;
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
        this.dropdownOpen = true;
      } else {
        this.patientsList = [];
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

  selectPatient(item: any) {
    this.newAppointmentModel.selectedPatient = item.id;
    this.selectedPatientName = item.name;
    this.dropdownOpen = false;
  }

  changeSecondDate() {
    this.secondCalendarDateNew.valueChanges.subscribe(date => {
      this.onDateSelect(date);
    });
  }

  async cancelAppointment(id) {
    setTimeout(() => {
      this.showNewAppointment = false;
    }, 50);
    Swal.fire({
      title: "آیا از حذف این وقت مطمئن هستید ؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      try {
        if (result.value) {
          let res: any = await this.treatmentService.cancelAppointment(id).toPromise();
          if (res['status'] == 0) {
            this.toastR.success('با موفقیت حذف گردید');
            this.getAppointment(this.appointmentDate);
          }
        }
      }
      catch {
        this.toastR.error('خطایی رخ داد', 'خطا!')
      }
    })
  }


  async getBillableItems() {
    try {
      let res = await this.treatmentService.getBillableItems().toPromise();
      this.servicesList = res;
      this.servicesList.forEach((item: any) => {
        item.code = item.id;
      });
    }
    catch { }
  }


}