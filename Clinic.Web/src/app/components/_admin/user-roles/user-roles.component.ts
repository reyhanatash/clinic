import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { SharedModule } from '../../../share/shared.module';
import { UserService } from '../../../_services/user.service';

@Component({
  selector: 'app-user-roles',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './user-roles.component.html',
  styleUrl: './user-roles.component.css'
})
export class UserRolesComponent implements OnInit {

  constructor(
    private userService: UserService,
    private toastR: ToastrService
  ) { }

  itemList: any = [
    {
      id: 0, title: 'وقت دهی', itmes: [
        { id: 1, text: 'مشاهده', clicked: false, fieldName: 'appointmentView' },
        { id: 2, text: 'ثبت', clicked: false, fieldName: 'appointmentCreateAndUpdate' },
        { id: 3, text: 'حذف', clicked: false, fieldName: 'appointmentDelete' }
      ]
    },
    {
      id: 1, title: ' اوقات امروز', itmes: [
        { id: 1, text: 'مشاهده', clicked: false, fieldName: 'totdayAppointmentView' },
        { id: 2, text: 'تایید تخفیف', clicked: false, fieldName: 'acceptDiscount' },
        { id: 3, text: 'تایید انجام خدمت', clicked: false, fieldName: 'canAcceptItem' }
      ]
    },
    {
      id: 2, title: 'بیماران', itmes: [
        { id: 1, text: 'مشاهده', clicked: false, fieldName: 'patientView' },
        { id: 2, text: 'ثبت', clicked: false, fieldName: 'patientCreateANdUpdate' },
        { id: 3, text: 'حذف', clicked: false, fieldName: 'patientDelete' },
        { id: 4, text: 'مجوز وقت دهی', clicked: false, fieldName: 'setAppointmentPermission' },
        { id: 5, text: 'تغییر وضعیت پرونده بیمار به کاغذی یا سیستمی', clicked: false, fieldName: 'changePatientRecordStatus' },
        { id: 6, text: 'ادغام بیماران', clicked: false, fieldName: 'mergePatients' },
        { id: 7, text: 'ثبت یادداشت', clicked: false, fieldName: 'medicalAlertCreateAndUpdate' },
        { id: 8, text: 'ویرایش یادداشت', clicked: false, fieldName: 'medicalAlertUpdate' },
        { id: 9, text: 'حذف یادداشت', clicked: false, fieldName: 'medicalAlertDelete' }
      ]
    },
    {
      id: 3, title: ' پرونده بالینی', itmes: [
        { id: 1, text: 'مشاهده', clicked: false, fieldName: 'treatmentView' },
        { id: 2, text: 'ثبت', clicked: false, fieldName: 'treatmentCreateAndUpdate' },
        { id: 3, text: 'حذف', clicked: false, fieldName: 'treatmentDelete' }
      ]
    },
    {
      id: 4, title: 'پیوست', itmes: [
        { id: 1, text: 'مشاهده', clicked: false, fieldName: 'attachmentView' },
        { id: 2, text: 'ثبت', clicked: false, fieldName: 'attachmentCreateAndUpdate' },
        { id: 3, text: 'حذف', clicked: false, fieldName: 'attachmentDelete' }
      ]
    },
    {
      id: 5, title: 'نامه ها', itmes: [
        { id: 1, text: 'مشاهده', clicked: false, fieldName: 'letterView' },
        { id: 2, text: 'ثبت', clicked: false, fieldName: 'letterCreateAndUpdate' },
        { id: 3, text: 'حذف', clicked: false, fieldName: 'letterDelete' }
      ]
    },
    {
      id: 6, title: 'صورتحساب ها ', itmes: [
        { id: 1, text: 'مشاهده', clicked: false, fieldName: 'invoiceView' },
        { id: 2, text: 'ثبت', clicked: false, fieldName: 'invoiceCreateAndUpdate' },
        { id: 3, text: 'حذف', clicked: false, fieldName: 'invoiceDelete' },
        { id: 4, text: 'ابطال', clicked: false, fieldName: 'invoiceCancel' },
        { id: 5, text: 'مجوز بدهی', clicked: false, fieldName: 'allowPayLater' },
        { id: 6, text: 'امکان تغییر یا حذف صورتحساب بعد از دریافت', clicked: false, fieldName: 'changeInvoiceAfterRecieve' },
        { id: 7, text: 'اعمال تخفیف', clicked: false, fieldName: 'invoiceDiscount' }
      ]
    },
    {
      id: 7, title: ' دریافت ها', itmes: [
        { id: 1, text: 'مشاهده', clicked: false, fieldName: 'receiptView' },
        { id: 2, text: 'ثبت', clicked: false, fieldName: 'receiptCreateAndUpdate' },
        { id: 3, text: 'حذف', clicked: false, fieldName: 'receiptDelete' },
        { id: 4, text: 'مجوز ویرایش', clicked: false, fieldName: 'receiptAllowEdit' },
        { id: 5, text: 'مجوز دریافت بیشتر از بدهی بیمار', clicked: false, fieldName: 'allowReceiptOverBalance' }
      ]
    },
    {
      id: 8, title: ' پرداخت ها', itmes: [
        { id: 1, text: 'مشاهده', clicked: false, fieldName: 'paymentView' },
        { id: 2, text: 'ثبت', clicked: false, fieldName: 'paymentCreateAndUpdate' },
        { id: 3, text: 'حذف', clicked: false, fieldName: 'paymentDelete' },
        { id: 4, text: 'مجوز ویرایش', clicked: false, fieldName: 'paymentAllowEdit' },
        { id: 5, text: 'مجوز پرداخت بیشتر از طلب بیمار', clicked: false, fieldName: 'allowPayOverBalance' },
      ]
    },
    {
      id: 9, title: 'هزینه ها', itmes: [
        { id: 1, text: 'مشاهده', clicked: false, fieldName: '' },
        { id: 2, text: 'ثبت', clicked: false, fieldName: '' },
        { id: 3, text: 'حذف', clicked: false, fieldName: '' }
      ]
    }, {
      id: 10, title: ' کاربران و پزشکان', itmes: [
        { id: 1, text: 'مشاهده', clicked: false, fieldName: 'userView' },
        { id: 2, text: 'ثبت', clicked: false, fieldName: 'userCreateAndUpdate' },
        { id: 3, text: 'حذف', clicked: false, fieldName: 'userDelete' }
      ]
    }, {
      id: 11, title: 'نقش ها ', itmes: [
        { id: 1, text: 'مشاهده', clicked: false, fieldName: '' },
        { id: 2, text: 'ثبت', clicked: false, fieldName: '' },
        { id: 3, text: 'حذف', clicked: false, fieldName: '' }
      ]
    }, {
      id: 12, title: 'انواع وقت دهی ', itmes: [
        { id: 1, text: 'مشاهده', clicked: false, fieldName: 'appointmentTypeView' },
        { id: 2, text: 'ثبت', clicked: false, fieldName: 'appointmentTypeCreateAndUpdate' },
        { id: 3, text: 'حذف', clicked: false, fieldName: 'appointmentTypeDelete' }
      ]
    }, {
      id: 13, title: 'تعطیلات  ', itmes: [
        { id: 1, text: 'مشاهده', clicked: false, fieldName: 'holidayView' },
        { id: 2, text: 'ثبت', clicked: false, fieldName: 'holidayCreateAndUpdate' },
        { id: 3, text: 'حذف', clicked: false, fieldName: 'holidayDelete' }
      ]
    }, {
      id: 14, title: 'استثنائات اوقات پزشکان', itmes: [
        { id: 1, text: 'مشاهده', clicked: false, fieldName: 'timeExceptionView' },
        { id: 2, text: 'ثبت', clicked: false, fieldName: 'timeExceptionCreateAndUpdate' },
        { id: 3, text: 'حذف', clicked: false, fieldName: 'timeExceptionDelete' }
      ]
    }, {
      id: 15, title: ' استثنائات خارج از نوبت ', itmes: [
        { id: 1, text: 'مشاهده', clicked: false, fieldName: 'outOfTurnExceptionView' },
        { id: 2, text: 'ثبت', clicked: false, fieldName: 'outOfTurnExceptionCreateAndUpdate' },
        { id: 3, text: 'حذف', clicked: false, fieldName: 'outOfTurnExceptionCreateAndUpdate' }
      ]
    },
    {
      id: 16, title: ' خدمات ', itmes: [
        { id: 1, text: 'مشاهده', clicked: false, fieldName: 'billableItemView' },
        { id: 2, text: 'ثبت', clicked: false, fieldName: 'billableItemCreateAndUpdate' },
        { id: 3, text: 'حذف', clicked: false, fieldName: 'billableItemDelete' }
      ]
    },
    {
      id: 17, title: ' گروه خدمات ', itmes: [
        { id: 1, text: 'مشاهده', clicked: false, fieldName: 'itemCategoryView' },
        { id: 2, text: 'ثبت', clicked: false, fieldName: 'itemCategoryCreateAndUpdate' },
        { id: 3, text: 'حذف', clicked: false, fieldName: 'itemCategoryDelete' }
      ]
    },
    {
      id: 18, title: 'تعریف پرونده بالینی ', itmes: [
        { id: 1, text: 'مشاهده', clicked: false, fieldName: 'treatmentTemplateView' },
        { id: 2, text: 'ثبت', clicked: false, fieldName: 'treatmentTemplateCreateAndUpdate' },
        { id: 3, text: 'حذف', clicked: false, fieldName: 'treatmentTemplateDelete' }
      ]
    },
    {
      id: 19, title: ' مشاغل ', itmes: [
        { id: 1, text: 'مشاهده', clicked: false, fieldName: 'jobView' },
        { id: 2, text: 'ثبت', clicked: false, fieldName: 'jobCreateAndUpdate' },
        { id: 3, text: 'حذف', clicked: false, fieldName: 'jobDelete' }
      ]
    }
  ]

  roleName: any;
  ngOnInit(): void {
  }

  async saveUserRole() {
    let model = {
      name: this.roleName,
      acceptDiscount: this.itemList[1]['itmes'][1]['clicked'],
      allowPayLater: this.itemList[6]['itmes'][4]['clicked'],
      allowPayOverBalance: this.itemList[8]['itmes'][4]['clicked'],
      allowReceiptOverBalance: this.itemList[7]['itmes'][4]['clicked'],
      appointmentCreateAndUpdate: this.itemList[0]['itmes'][1]['clicked'],
      appointmentDelete: this.itemList[0]['itmes'][2]['clicked'],
      appointmentTypeCreateAndUpdate: this.itemList[12]['itmes'][1]['clicked'],
      appointmentTypeDelete: this.itemList[12]['itmes'][2]['clicked'],
      appointmentTypeView: this.itemList[12]['itmes'][0]['clicked'],
      appointmentView: this.itemList[0]['itmes'][0]['clicked'],
      attachmentCreateAndUpdate: this.itemList[4]['itmes'][1]['clicked'],
      attachmentDelete: this.itemList[4]['itmes'][2]['clicked'],
      attachmentView: this.itemList[4]['itmes'][0]['clicked'],
      billableItemCreateAndUpdate: this.itemList[16]['itmes'][1]['clicked'],
      billableItemDelete: this.itemList[16]['itmes'][2]['clicked'],
      billableItemView: this.itemList[16]['itmes'][0]['clicked'],
      canAcceptItem: this.itemList[1]['itmes'][2]['clicked'],
      changeInvoiceAfterRecieve: this.itemList[6]['itmes'][5]['clicked'],
      changePatientRecordStatus: this.itemList[2]['itmes'][4]['clicked'],
      holidayCreateAndUpdate: this.itemList[13]['itmes'][1]['clicked'],
      holidayDelete: this.itemList[13]['itmes'][2]['clicked'],
      holidayView: this.itemList[13]['itmes'][0]['clicked'],
      invoiceCancel: this.itemList[6]['itmes'][3]['clicked'],
      invoiceCreateAndUpdate: this.itemList[6]['itmes'][1]['clicked'],
      invoiceDelete: this.itemList[6]['itmes'][2]['clicked'],
      invoiceDiscount: this.itemList[6]['itmes'][6]['clicked'],
      invoiceView: this.itemList[6]['itmes'][0]['clicked'],
      itemCategoryCreateAndUpdate: this.itemList[17]['itmes'][1]['clicked'],
      itemCategoryDelete: this.itemList[17]['itmes'][2]['clicked'],
      itemCategoryView: this.itemList[17]['itmes'][0]['clicked'],
      jobCreateAndUpdate: this.itemList[19]['itmes'][1]['clicked'],
      jobDelete: this.itemList[19]['itmes'][2]['clicked'],
      jobView: this.itemList[19]['itmes'][0]['clicked'],
      letterCreateAndUpdate: this.itemList[5]['itmes'][1]['clicked'],
      letterDelete: this.itemList[5]['itmes'][2]['clicked'],
      letterView: this.itemList[5]['itmes'][0]['clicked'],
      medicalAlertCreateAndUpdate: this.itemList[2]['itmes'][6]['clicked'],
      medicalAlertDelete: this.itemList[2]['itmes'][8]['clicked'],
      medicalAlertUpdate: this.itemList[2]['itmes'][7]['clicked'],
      mergePatients: this.itemList[2]['itmes'][5]['clicked'],
      outOfTurnExceptionCreateAndUpdate: this.itemList[15]['itmes'][1]['clicked'],
      outOfTurnExceptionDelete: this.itemList[15]['itmes'][2]['clicked'],
      outOfTurnExceptionView: this.itemList[15]['itmes'][0]['clicked'],
      patientCreateANdUpdate: this.itemList[2]['itmes'][1]['clicked'],
      patientDelete: this.itemList[2]['itmes'][2]['clicked'],
      patientView: this.itemList[2]['itmes'][0]['clicked'],
      paymentAllowEdit: this.itemList[8]['itmes'][3]['clicked'],
      paymentCreateAndUpdate: this.itemList[8]['itmes'][1]['clicked'],
      paymentDelete: this.itemList[8]['itmes'][2]['clicked'],
      paymentView: this.itemList[8]['itmes'][0]['clicked'],
      receiptAllowEdit: this.itemList[7]['itmes'][3]['clicked'],
      receiptCreateAndUpdate: this.itemList[7]['itmes'][1]['clicked'],
      receiptDelete: this.itemList[7]['itmes'][2]['clicked'],
      receiptView: this.itemList[7]['itmes'][0]['clicked'],
      setAppointmentPermission: this.itemList[2]['itmes'][3]['clicked'],
      timeExceptionCreateAndUpdate: this.itemList[14]['itmes'][1]['clicked'],
      timeExceptionDelete: this.itemList[14]['itmes'][2]['clicked'],
      timeExceptionView: this.itemList[14]['itmes'][0]['clicked'],
      totdayAppointmentView: this.itemList[1]['itmes'][0]['clicked'],
      treatmentCreateAndUpdate: this.itemList[3]['itmes'][1]['clicked'],
      treatmentDelete: this.itemList[3]['itmes'][2]['clicked'],
      treatmentTemplateCreateAndUpdate: this.itemList[18]['itmes'][1]['clicked'],
      treatmentTemplateDelete: this.itemList[18]['itmes'][2]['clicked'],
      treatmentTemplateView: this.itemList[18]['itmes'][0]['clicked'],
      treatmentView: this.itemList[3]['itmes'][0]['clicked'],
      userCreateAndUpdate: this.itemList[10]['itmes'][1]['clicked'],
      userDelete: this.itemList[10]['itmes'][2]['clicked'],
      userView: this.itemList[10]['itmes'][0]['clicked'],
      expenseCreateAndUpdate: this.itemList[9]['itmes'][1]['clicked'],
      expenseDelete: this.itemList[9]['itmes'][2]['clicked'],
      expenseView: this.itemList[9]['itmes'][0]['clicked'],
      roleCreateAndUpdate: this.itemList[10]['itmes'][1]['clicked'],
      roleDelete: this.itemList[10]['itmes'][2]['clicked'],
      roleView: this.itemList[10]['itmes'][0]['clicked'],
      editOrNew: -1
    }
    try {
      let res: any = await firstValueFrom(this.userService.saveUserRole(model));
      if (res.status == 0) {
        this.toastR.success('با موفقیت ثبت شد!');
      } else {
        this.toastR.error('خطایی رخ داده است');
      }
    } catch (error) {
      this.toastR.error('خطایی رخ داده است');
    }
  }
}