import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MainService } from '../../../_services/main.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sms-setting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sms-setting.component.html',
  styleUrl: './sms-setting.component.css'
})
export class SmsSettingComponent {

  newSetting: any = [];
  smsSettings: any = [];

  constructor(
    private mainService: MainService,
    private toastR: ToastrService
  ) { }

  ngOnInit() {
    this.getSmsSetting();
  }

  async getSmsSetting() {
    try {
      let res: any = await this.mainService.getSmsSetting().toPromise();
      if (res.length > 0) {
        this.smsSettings = res[0];
        this.smsSettingFieldSet();
      }
    }
    catch { }
  }

  smsSettingFieldSet() {
    this.newSetting.id = this.smsSettings.id;
    this.newSetting.sendAfterAppointment = this.smsSettings.sendAfterAppointment;
    this.newSetting.sendBeforeAppointmentDay = this.smsSettings.sendBeforeAppointmentDay;
    this.newSetting.sendAfterAppointmentTemplateId = this.smsSettings.sendAfterAppointmentTemplateId;
    this.newSetting.sendBeforeAppointmentDayTemplateId = this.smsSettings.sendBeforeAppointmentDayTemplateId;
    this.newSetting.reminderDaysBefore = this.smsSettings.reminderDaysBefore;
    this.newSetting.sendAfterAppointmentTemplate = this.smsSettings.sendAfterAppointmentTemplate;
    this.newSetting.sendBeforeAppointmentDayTemplate = this.smsSettings.sendBeforeAppointmentDayTemplate;
  }

  // updateSmsSetting() {
  //   let model = {
  //     "id": this.newSetting.id,
  //     "sendAfterAppointment": this.newSetting.sendAfterAppointment,
  //     "sendBeforeAppointmentDay": this.newSetting.sendBeforeAppointmentDay,
  //     "sendAfterAppointmentTemplateId": this.newSetting.sendAfterAppointmentTemplateId,
  //     "sendBeforeAppointmentDayTemplateId": this.newSetting.sendBeforeAppointmentDayTemplateId,
  //     "reminderDaysBefore": this.newSetting.reminderDaysBefore,
  //     "sendAfterAppointmentTemplate": this.newSetting.sendAfterAppointmentTemplate,
  //     "sendBeforeAppointmentDayTemplate": this.newSetting.sendBeforeAppointmentDayTemplate
  //   }
  //   let res: any = this.mainService.updateSmsSetting(model).toPromise();

  // }
  async updateSmsSetting() {
    let model = {
      "id": 1,
      "sendAfterAppointment": this.newSetting.sendAfterAppointment,
      "sendBeforeAppointmentDay": this.newSetting.sendBeforeAppointmentDay,
      "sendAfterAppointmentTemplateId": this.newSetting.sendAfterAppointmentTemplateId,
      "sendBeforeAppointmentDayTemplateId": this.newSetting.sendBeforeAppointmentDayTemplateId,
      "reminderDaysBefore": this.newSetting.reminderDaysBefore,
      "sendAfterAppointmentTemplate": this.newSetting.sendAfterAppointmentTemplate,
      "sendBeforeAppointmentDayTemplate": this.newSetting.sendBeforeAppointmentDayTemplate
    }

    try {
      let res: any = await this.mainService.updateSmsSetting(model).toPromise();
      if (res.status == 0) {
        this.getSmsSetting();
        this.toastR.success('با موفقیت ذخیره شد!');
      }

    }
    catch {
      this.toastR.error('خطایی رخ داده است!');
    }
  }

}
