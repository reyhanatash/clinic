import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { firstValueFrom, Observable } from 'rxjs';
import { setObject, clearObject } from '../store/actions';
import { selectObject } from '../store/selectors';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class ObjectService {
    accessData: any = [];
    constructor(
        private store: Store,
        private router: Router,
        private userService: UserService
    ) {
        this.convertDataWithUrl();
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                this.convertDataWithUrl();
            });

    }
    roleData: any;
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
                { id: 1, text: 'مشاهده', clicked: false, fieldName: 'expenseView' },
                { id: 2, text: 'ثبت', clicked: false, fieldName: 'expenseCreateAndUpdate' },
                { id: 3, text: 'حذف', clicked: false, fieldName: 'expenseDelete' }
            ]
        }, {
            id: 10, title: ' کاربران و پزشکان', itmes: [
                { id: 1, text: 'مشاهده', clicked: false, fieldName: 'userView' },
                { id: 2, text: 'ثبت', clicked: false, fieldName: 'userCreateAndUpdate' },
                { id: 3, text: 'حذف', clicked: false, fieldName: 'userDelete' }
            ]
        }, {
            id: 11, title: 'نقش ها ', itmes: [
                { id: 1, text: 'مشاهده', clicked: false, fieldName: 'roleView' },
                { id: 2, text: 'ثبت', clicked: false, fieldName: 'roleCreateAndUpdate' },
                { id: 3, text: 'حذف', clicked: false, fieldName: 'roleDelete' }
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
            id: 15, title: ' استثنائات خارج از نوبت ', url: 'outOfturnexceptions', itmes: [
                { id: 1, text: 'مشاهده', clicked: false, fieldName: 'outOfTurnExceptionView' },
                { id: 2, text: 'ثبت', clicked: false, fieldName: 'outOfTurnExceptionCreateAndUpdate' },
                { id: 3, text: 'حذف', clicked: false, fieldName: 'outOfTurnExceptionDelete' }
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

    setData(obj: any): void {
        this.itemList.forEach(section => {
            section.itmes.forEach(item => {
                if (item.fieldName && obj.hasOwnProperty(item.fieldName)) {
                    item.clicked = obj[item.fieldName];
                }
            });
        })
        let role = this.itemList;
        this.store.dispatch(setObject({ obj: role }));
    }

    getData(): Observable<any> {
        return this.store.select(selectObject)
    }

    async convertDataWithUrl() {
        const currentPath = this.router.url;
        const result = await firstValueFrom(
            this.getData().pipe(
                map((data: any[]) => {
                    if (!data) {
                        this.getUserRole();
                        setTimeout(() => {
                            data = this.roleData;
                            return data.filter(section =>
                                (section.url && currentPath.includes(section.url))
                            );
                        }, 1000);
                    }
                    return data.filter(section =>
                        section.url && currentPath.includes(section.url)
                    );
                })
            )
        );
        if (result) {
            this.accessData = result[0]['itmes'];
        }
    }


    async getUserRole() {
        // let res: any = await this.userService.getUserRole().toPromise();
        let res = {
            "id": 6,
            "name": "Admin",
            "generalSettingView": true,
            "appointmentView": true,
            "appointmentCreateAndUpdate": true,
            "appointmentDelete": true,
            "patientView": true,
            "patientCreateAndUpdate": true,
            "patientDelete": true,
            "invoiceView": true,
            "invoiceCreateAndUpdate": true,
            "invoiceDelete": true,
            "paymentView": true,
            "paymentCreateAndUpdate": true,
            "paymentDelete": true,
            "expenseView": true,
            "expenseCreateAndUpdate": true,
            "expenseDelete": true,
            "productView": true,
            "productCreateAndUpdate": true,
            "productDelete": true,
            "contactView": true,
            "contactCreateAndUpdate": true,
            "contactDelete": true,
            "businessView": true,
            "businessCreateAndUpdate": true,
            "businessDelete": true,
            "userView": true,
            "userCreateAndUpdate": true,
            "userDelete": true,
            "roleView": true,
            "roleCreateAndUpdate": true,
            "roleDelete": true,
            "appointmentTypeView": true,
            "appointmentTypeCreateAndUpdate": true,
            "appointmentTypeDelete": true,
            "holidayView": true,
            "holidayCreateAndUpdate": true,
            "holidayDelete": true,
            "timeExceptionView": true,
            "timeExceptionCreateAndUpdate": true,
            "timeExceptionDelete": true,
            "billableItemView": true,
            "billableItemCreateAndUpdate": true,
            "billableItemDelete": true,
            "treatmentTemplateView": true,
            "treatmentTemplateCreateAndUpdate": true,
            "treatmentTemplateDelete": true,
            "summaryReport": true,
            "paymentReport": true,
            "expenseReport": true,
            "report": true,
            "setting": true,
            "modifierId": 3,
            "createdOn": "1900-01-01T00:00:00",
            "lastUpdated": "2021-11-19T20:52:14.3066667",
            "allowPayLater": true,
            "letterTemplateView": true,
            "letterTemplateCreateAndUpdate": true,
            "letterTemplateDelete": true,
            "letterView": true,
            "letterCreateAndUpdate": true,
            "letterDelete": true,
            "treatmentView": true,
            "treatmentCreateAndUpdate": true,
            "treatmentDelete": true,
            "attachmentView": true,
            "attachmentCreateAndUpdate": true,
            "attachmentDelete": true,
            "smsSettingView": true,
            "smsSettingCreateAndUpdate": true,
            "generalSettingCreateAndUpdate": true,
            "productCardexCreateAndUpdate": true,
            "receiptView": true,
            "receiptCreateAndUpdate": true,
            "receiptDelete": true,
            "receiptReport": true,
            "totdayAppointmentView": true,
            "changeInvoiceAfterReceive": true,
            "discountReport": true,
            "notArraivedPatientsReport": true,
            "invoiceCancel": true,
            "receiptAllowEdit": true,
            "invoiceDiscount": true,
            "paymentAllowEdit": true,
            "creatorId": null,
            "medicalRecordView": true,
            "medicalRecordSend": true,
            "patientFieldView": true,
            "patientFieldCreateAndUpdate": true,
            "jobView": true,
            "jobCreateAndUpdate": true,
            "jobDelete": true,
            "outInvoiceReport": true,
            "inInvoiceReport": true,
            "outOfTurnExceptionView": true,
            "outOfTurnExceptionCreateAndUpdate": true,
            "outOfTurnExceptionDelete": false,
            "unChangeInvoiceReport": true,
            "setAppointmentPermission": true,
            "itemCategoryView": true,
            "itemCategoryCreateAndUpdate": true,
            "itemCategoryDelete": true,
            "receiptPaymentReport": true,
            "allowReceiptOverBalance": true,
            "allowPayOverBalance": true,
            "acceptDiscount": true,
            "cashierByCashAndETFPosReport": true,
            "practitionerReport": true,
            "watingReport": true,
            "firstEncounterReport": true,
            "medicalAlertCreateAndUpdate": true,
            "medicalAlertDelete": true,
            "changePatientRecordStatus": true,
            "canAcceptItem": true,
            "visitReport": true,
            "invoiceItemChangeReport": true,
            "medicalAlertUpdate": true,
            "mergePatients": true
        }
        // await this.setData(res[0]);
        await this.setData(res);
        this.roleData = this.itemList;
    }

    checkAccess(id: number) {
        const item = this.accessData.find(x => x.id === id);
        return item ? item.clicked : false;
    }


}
