import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MainService } from '../../../_services/main.service';
import { ToastrService } from 'ngx-toastr';
import { ColorPickerModule } from 'primeng/colorpicker';
import { UtilService } from '../../../_services/util.service';

export const ValidFormat = ['jpg', 'jpeg', 'png'];


@Component({
  selector: 'app-general-setting',
  standalone: true,
  imports: [FormsModule, CommonModule, ColorPickerModule],
  templateUrl: './general-setting.component.html',
  styleUrl: './general-setting.component.css'
})
export class GeneralSettingComponent {
  newGeneralSetting: any = [];
  generalSetting: any = [];
  fileName: any = '';
  fileToUpload: any;
  base64: any;
  fileType: any;

  constructor(
    private mainService: MainService,
    private toastR: ToastrService,
    private utilService: UtilService,
  ) { }

  ngOnInit() {
    this.getGeneralSettings();
  }

  handleFileInput(files: any) {
    let size = files[0].size;
    let type = files[0]['name'].split('.').pop();
    if (!ValidFormat.includes(type.toLowerCase())) {
      this.toastR.error("فرمت وارد شده معتبر نمی باشد.", "خطا");
      return;
    }
    if (size > 5000000) {
      this.toastR.error("حداکثر سایز فایل 5 مگابایت می باشد", "خطا");
      return;
    }
    this.fileToUpload = files.item(0);
    this.utilService.getBase64(files.item(0)).then((data) => {
      let base: any = data;
      this.base64 = base.split(',')[1];

      this.fileName = this.fileToUpload['name'];
      this.fileType = this.fileToUpload['name'].split('.').pop();
    });
  }

  async updateSettings() {
    let model = {
      "id": this.newGeneralSetting.id,
      "companyName": this.newGeneralSetting.clinicName,
      "firstName": "string",
      "lastName": "string",
      "practitionerCanOnlyReadLettersTheyAuthoredThemselves": true,
      "practitionerCannotSeeAnyFinancialDetails": true,
      "receptionistsCanOnlyReadLettersTheyAuthoredThemselves": true,
      "receptionistsCanViewFileAttachment": true,
      "timeSlotHeight": 0,
      "multipleAppointments": true,
      "showCurrentTimeIndicator": true,
      "emailFrom": "string",
      "modifierId": 0,
      "createdOn": "2025-12-22T14:01:01.642Z",
      "lastUpdated": "2025-12-22T14:01:01.642Z",
      "logo": this.base64,
      "emailOnAppointment": true,
      "birthDateOnAppointment": this.newGeneralSetting.birthDate,
      "insurer1OnAppointment": this.newGeneralSetting.insuranceProvider1,
      "insurer2OnAppointment": this.newGeneralSetting.insuranceProvider2,
      "referr1OnAppointment": this.newGeneralSetting.referralProvider1,
      "referr2OnAppointment": this.newGeneralSetting.referralProvider2,
      "address": this.newGeneralSetting.address || "",
      "address2": this.newGeneralSetting.addressLine2 || "",
      "city": this.newGeneralSetting.city || "",
      "state": "string",
      "postCode": this.newGeneralSetting.postalCode || "",
      "webSiteAddress": this.newGeneralSetting.website,
      "infoEmail": this.newGeneralSetting.emailInput || "",
      "contactInformation": "string",
      "location": "string",
      "zoom": 0,
      "setPayableAmountInNewPaymentCash": this.newGeneralSetting.enablepayments,
      "disallowOutOfTurnWhenHaveTime": true,
      "checkInvoiceDateByPractitionerSchedule": true,
      "patientCodeStartFrom": Number(this.newGeneralSetting.patientCodeStartFrom),
      "setReceivebleAmountInNewReceiptBank": this.newGeneralSetting.enableReceipts,
      "creatorId": 0,
      "holidayColor": this.newGeneralSetting.holidayColor,
      "emptyDayColor": this.newGeneralSetting.emptyDayColor,
      "fullDayColor": this.newGeneralSetting.fullDayColor,
      "notFullDayColor": this.newGeneralSetting.notFullDayColor,
      "showPatientNotes": this.newGeneralSetting.showPatientNotes
    }
    try {
      let res: any = await this.mainService.updateGeneralSettings(model).toPromise();
      if (res.status == 0) {
        this.toastR.success('با موفقیت ثبت شد!');
      }
    }
    catch { }
  }

  async getGeneralSettings() {
    try {
      let res: any = await this.mainService.getGeneralSettings().toPromise();
      if (res.length > 0) {
        this.generalSetting = res[0];
        this.setFormInputs();
      }
    }
    catch {
      this.toastR.error('خطا در دریافت اطلاعات');
    }
  }

  setFormInputs() {
    this.newGeneralSetting.id = this.generalSetting.id;
    this.newGeneralSetting.logo = this.generalSetting.logo;
    this.newGeneralSetting.clinicName = this.generalSetting.companyName;
    this.newGeneralSetting.address = this.generalSetting.address;
    this.newGeneralSetting.addressLine2 = this.generalSetting.address2;
    this.newGeneralSetting.city = this.generalSetting.city;
    this.newGeneralSetting.postalCode = this.generalSetting.postCode;
    this.newGeneralSetting.website = this.generalSetting.webSiteAddress || "";
    this.newGeneralSetting.emailInput = this.generalSetting.infoEmail;
    this.newGeneralSetting.birthDate = this.generalSetting.birthDateOnAppointment;
    this.newGeneralSetting.insuranceProvider1 = this.generalSetting.insurer1OnAppointment;
    this.newGeneralSetting.insuranceProvider2 = this.generalSetting.insurer2OnAppointment;
    this.newGeneralSetting.referralProvider1 = this.generalSetting.referr1OnAppointment;
    this.newGeneralSetting.referralProvider2 = this.generalSetting.referr2OnAppointment;
    this.newGeneralSetting.enablepayments = this.generalSetting.setPayableAmountInNewPaymentCash;
    this.newGeneralSetting.enableReceipts = this.generalSetting.setReceivebleAmountInNewReceiptBank;
    this.newGeneralSetting.patientCodeStartFrom = this.generalSetting.patientCodeStartFrom;
    this.newGeneralSetting.holidayColor = this.generalSetting.holidayColor;
    this.newGeneralSetting.emptyDayColor = this.generalSetting.emptyDayColor;
    this.newGeneralSetting.fullDayColor = this.generalSetting.fullDayColor;
    this.newGeneralSetting.notFullDayColor = this.generalSetting.notFullDayColor;
    this.newGeneralSetting.showPatientNotes = this.generalSetting.showPatientNotes;
  }
}