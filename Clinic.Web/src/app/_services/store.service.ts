import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { firstValueFrom, Observable, of } from 'rxjs';
import { setObject, clearObject } from '../store/actions';
import { selectObject } from '../store/selectors';
import { NavigationEnd, Router } from '@angular/router';
import { delay, filter, map, switchMap } from 'rxjs/operators';
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
            id: 0, title: 'وقت دهی', url: '/appointment', itmes: [
                { id: 1, text: 'مشاهده', clicked: false, fieldName: 'appointmentView' },
                { id: 2, text: 'ثبت', clicked: false, fieldName: 'appointmentCreateAndUpdate' },
                { id: 3, text: 'حذف', clicked: false, fieldName: 'appointmentDelete' }
            ]
        },
        {
            id: 1, title: ' اوقات امروز', url: '/today-appointment', itmes: [
                { id: 1, text: 'مشاهده', clicked: false, fieldName: 'totdayAppointmentView' },
                { id: 2, text: 'تایید تخفیف', clicked: false, fieldName: 'acceptDiscount' },
                { id: 3, text: 'تایید انجام خدمت', clicked: false, fieldName: 'canAcceptItem' }
            ]
        },
        {
            id: 2, title: 'بیماران', url: '/patients', itmes: [
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
            id: 6, title: 'صورتحساب ها ', url: '/invoice-list', itmes: [
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
            id: 7, title: ' دریافت ها', url: '/receipt-list', itmes: [
                { id: 1, text: 'مشاهده', clicked: false, fieldName: 'receiptView' },
                { id: 2, text: 'ثبت', clicked: false, fieldName: 'receiptCreateAndUpdate' },
                { id: 3, text: 'حذف', clicked: false, fieldName: 'receiptDelete' },
                { id: 4, text: 'مجوز ویرایش', clicked: false, fieldName: 'receiptAllowEdit' },
                { id: 5, text: 'مجوز دریافت بیشتر از بدهی بیمار', clicked: false, fieldName: 'allowReceiptOverBalance' }
            ]
        },
        {
            id: 8, title: ' پرداخت ها', url: '/payment-list', itmes: [
                { id: 1, text: 'مشاهده', clicked: false, fieldName: 'paymentView' },
                { id: 2, text: 'ثبت', clicked: false, fieldName: 'paymentCreateAndUpdate' },
                { id: 3, text: 'حذف', clicked: false, fieldName: 'paymentDelete' },
                { id: 4, text: 'مجوز ویرایش', clicked: false, fieldName: 'paymentAllowEdit' },
                { id: 5, text: 'مجوز پرداخت بیشتر از طلب بیمار', clicked: false, fieldName: 'allowPayOverBalance' },
            ]
        },
        {
            id: 9, title: 'هزینه ها', url: '/expenses', itmes: [
                { id: 1, text: 'مشاهده', clicked: false, fieldName: 'expenseView' },
                { id: 2, text: 'ثبت', clicked: false, fieldName: 'expenseCreateAndUpdate' },
                { id: 3, text: 'حذف', clicked: false, fieldName: 'expenseDelete' }
            ]
        }, {
            id: 10, title: ' کاربران و پزشکان', url: '/userlist', itmes: [
                { id: 1, text: 'مشاهده', clicked: false, fieldName: 'userView' },
                { id: 2, text: 'ثبت', clicked: false, fieldName: 'userCreateAndUpdate' },
                { id: 3, text: 'حذف', clicked: false, fieldName: 'userDelete' }
            ]
        }, {
            id: 11, title: 'نقش ها ', url: '/user-role-list', itmes: [
                { id: 1, text: 'مشاهده', clicked: false, fieldName: 'roleView' },
                { id: 2, text: 'ثبت', clicked: false, fieldName: 'roleCreateAndUpdate' },
                { id: 3, text: 'حذف', clicked: false, fieldName: 'roleDelete' }
            ]
        }, {
            id: 12, title: 'انواع وقت دهی ', url: '/appointment-types', itmes: [
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
            id: 14, title: 'استثنائات اوقات پزشکان', url: '/time-exception', itmes: [
                { id: 1, text: 'مشاهده', clicked: false, fieldName: 'timeExceptionView' },
                { id: 2, text: 'ثبت', clicked: false, fieldName: 'timeExceptionCreateAndUpdate' },
                { id: 3, text: 'حذف', clicked: false, fieldName: 'timeExceptionDelete' }
            ]
        }, {
            id: 15, title: ' استثنائات خارج از نوبت ', url: '/outOfturnexceptions', itmes: [
                { id: 1, text: 'مشاهده', clicked: false, fieldName: 'outOfTurnExceptionView' },
                { id: 2, text: 'ثبت', clicked: false, fieldName: 'outOfTurnExceptionCreateAndUpdate' },
                { id: 3, text: 'حذف', clicked: false, fieldName: 'outOfTurnExceptionDelete' }
            ]
        },
        {
            id: 16, title: ' خدمات ', url: '/service-list', itmes: [
                { id: 1, text: 'مشاهده', clicked: false, fieldName: 'billableItemView' },
                { id: 2, text: 'ثبت', clicked: false, fieldName: 'billableItemCreateAndUpdate' },
                { id: 3, text: 'حذف', clicked: false, fieldName: 'billableItemDelete' }
            ]
        },
        {
            id: 17, title: ' گروه خدمات ', url: '/service-group-list', itmes: [
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

    navbarAccess: any = [
        { id: 1, link: '/appointment', clicked: false, fieldName: 'appointmentView' },
        { id: 2, link: '/today-appointment', clicked: false, fieldName: 'totdayAppointmentView' },
        { id: 3, link: '/patients', clicked: false, fieldName: 'patientView' },
        { id: 4, text: 'مشاهده', clicked: false, fieldName: 'treatmentView' },
        { id: 5, text: 'مشاهده', clicked: false, fieldName: 'attachmentView' },
        { id: 6, text: 'مشاهده', clicked: false, fieldName: 'letterView' },
        { id: 7, link: '/invoice-list', clicked: false, fieldName: 'invoiceView' },
        { id: 8, link: '/receipt-list', clicked: false, fieldName: 'receiptView' },
        { id: 9, link: '/payment-list', clicked: false, fieldName: 'paymentView' },
        { id: 10, link: '/expenses', clicked: false, fieldName: 'expenseView' },
        { id: 11, link: '/userlist', clicked: false, fieldName: 'userView' },
        { id: 12, link: '/user-role-list', clicked: false, fieldName: 'roleView' },
        { id: 13, link: '/appointment-types', clicked: false, fieldName: 'appointmentTypeView' },
        { id: 14, text: 'مشاهده', clicked: false, fieldName: 'holidayView' },
        { id: 15, link: '/time-exception', clicked: false, fieldName: 'timeExceptionView' },
        { id: 16, link: '/outOfturnexceptions', clicked: false, fieldName: 'outOfTurnExceptionView' },
        { id: 17, link: '/service-list', clicked: false, fieldName: 'billableItemView' },
        { id: 18, link: '/service-group-list', clicked: false, fieldName: 'itemCategoryView' },
        { id: 19, text: 'مشاهده', clicked: false, fieldName: 'treatmentTemplateView' },
        { id: 20, text: 'مشاهده', clicked: false, fieldName: 'jobView' },
        { id: 21, text: 'ثبت', clicked: false, fieldName: 'paymentCreateAndUpdate' },
        { id: 22, text: 'ثبت', clicked: false, fieldName: 'receiptCreateAndUpdate' },


    ]

    setData(obj: any): void {
        this.store.dispatch(setObject({ obj: obj }));
        this.convertData(obj);
    }

    convertData(obj) {
        this.itemList.forEach(section => {
            section.itmes.forEach(item => {
                if (item.fieldName && obj.hasOwnProperty(item.fieldName)) {
                    item.clicked = obj[item.fieldName];
                }
            });
        })
        this.navbarAccess.forEach(element => {
            if (element.fieldName && obj.hasOwnProperty(element.fieldName)) {
                element.clicked = obj[element.fieldName];
            }
        })
    }

    getData(): Observable<any> {
        return this.store.select(selectObject)
    }


    async convertDataWithUrl() {
        const currentPath = this.router.url;
        const result = await firstValueFrom(
            this.getData().pipe(
                switchMap((data) => {
                    if (!data) {
                        this.getUserRole();
                        return of(this.itemList).pipe(
                            delay(1000),
                            map((list) =>
                                list.filter((section) => section.url && section.url === currentPath)
                            )
                        );
                    } else {
                        this.convertData(data);
                        return of(this.itemList).pipe(
                            map((list) =>
                                list.filter((section) => section.url && section.url === currentPath)
                            )
                        );
                    }
                })
            )
        );

        if (result?.length > 0) {
            this.accessData = result[0]['itmes'];
        }
    }

    async getUserRole() {
        let res: any = await this.userService.getUserRole().toPromise();
        // let res = {
        //     "id": 6,
        //     "name": "Admin",
        //     "generalSettingView": true,
        //     "appointmentView": true,
        //     "appointmentCreateAndUpdate": false,
        //     "appointmentDelete": true,
        //     "patientView": true,
        //     "patientCreateAndUpdate": true,
        //     "patientDelete": true,
        //     "invoiceView": true,
        //     "invoiceCreateAndUpdate": true,
        //     "invoiceDelete": true,
        //     "paymentView": false,
        //     "paymentCreateAndUpdate": true,
        //     "paymentDelete": false,
        //     "expenseView": true,
        //     "expenseCreateAndUpdate": true,
        //     "expenseDelete": true,
        //     "productView": true,
        //     "productCreateAndUpdate": true,
        //     "productDelete": true,
        //     "contactView": true,
        //     "contactCreateAndUpdate": true,
        //     "contactDelete": true,
        //     "businessView": true,
        //     "businessCreateAndUpdate": true,
        //     "businessDelete": true,
        //     "userView": true,
        //     "userCreateAndUpdate": true,
        //     "userDelete": true,
        //     "roleView": true,
        //     "roleCreateAndUpdate": true,
        //     "roleDelete": true,
        //     "appointmentTypeView": false,
        //     "appointmentTypeCreateAndUpdate": false,
        //     "appointmentTypeDelete": true,
        //     "holidayView": true,
        //     "holidayCreateAndUpdate": true,
        //     "holidayDelete": true,
        //     "timeExceptionView": true,
        //     "timeExceptionCreateAndUpdate": true,
        //     "timeExceptionDelete": true,
        //     "billableItemView": true,
        //     "billableItemCreateAndUpdate": true,
        //     "billableItemDelete": true,
        //     "treatmentTemplateView": true,
        //     "treatmentTemplateCreateAndUpdate": true,
        //     "treatmentTemplateDelete": true,
        //     "summaryReport": true,
        //     "paymentReport": true,
        //     "expenseReport": true,
        //     "report": true,
        //     "setting": true,
        //     "modifierId": 3,
        //     "createdOn": "1900-01-01T00:00:00",
        //     "lastUpdated": "2021-11-19T20:52:14.3066667",
        //     "allowPayLater": true,
        //     "letterTemplateView": true,
        //     "letterTemplateCreateAndUpdate": true,
        //     "letterTemplateDelete": true,
        //     "letterView": true,
        //     "letterCreateAndUpdate": true,
        //     "letterDelete": true,
        //     "treatmentView": false,
        //     "treatmentCreateAndUpdate": true,
        //     "treatmentDelete": true,
        //     "attachmentView": true,
        //     "attachmentCreateAndUpdate": false,
        //     "attachmentDelete": true,
        //     "smsSettingView": true,
        //     "smsSettingCreateAndUpdate": true,
        //     "generalSettingCreateAndUpdate": true,
        //     "productCardexCreateAndUpdate": true,
        //     "receiptView": true,
        //     "receiptCreateAndUpdate": false,
        //     "receiptDelete": true,
        //     "receiptReport": true,
        //     "totdayAppointmentView": true,
        //     "changeInvoiceAfterReceive": true,
        //     "discountReport": true,
        //     "notArraivedPatientsReport": true,
        //     "invoiceCancel": false,
        //     "receiptAllowEdit": true,
        //     "invoiceDiscount": true,
        //     "paymentAllowEdit": false,
        //     "creatorId": null,
        //     "medicalRecordView": true,
        //     "medicalRecordSend": true,
        //     "patientFieldView": true,
        //     "patientFieldCreateAndUpdate": true,
        //     "jobView": true,
        //     "jobCreateAndUpdate": true,
        //     "jobDelete": true,
        //     "outInvoiceReport": true,
        //     "inInvoiceReport": true,
        //     "outOfTurnExceptionView": false,
        //     "outOfTurnExceptionCreateAndUpdate": false,
        //     "outOfTurnExceptionDelete": true,
        //     "unChangeInvoiceReport": true,
        //     "setAppointmentPermission": true,
        //     "itemCategoryView": true,
        //     "itemCategoryCreateAndUpdate": false,
        //     "itemCategoryDelete": true,
        //     "receiptPaymentReport": true,
        //     "allowReceiptOverBalance": true,
        //     "allowPayOverBalance": true,
        //     "acceptDiscount": false,
        //     "cashierByCashAndETFPosReport": true,
        //     "practitionerReport": true,
        //     "watingReport": true,
        //     "firstEncounterReport": true,
        //     "medicalAlertCreateAndUpdate": true,
        //     "medicalAlertDelete": false,
        //     "changePatientRecordStatus": true,
        //     "canAcceptItem": true,
        //     "visitReport": true,
        //     "invoiceItemChangeReport": true,
        //     "medicalAlertUpdate": true,
        //     "mergePatients": true
        // }
        await this.setData(res[0]);
        // await this.setData(res);
        // this.roleData = this.itemList;
    }

    checkAccess(id: number) {
        if (this.accessData?.length > 0) {
            const item = this.accessData.find(x => x.id === id);
            return item.clicked;
        } else {
            return false
        }
    }

    getDataAccess() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.accessData || []);
            }, 1000);
        });
    }


    getNavbarAccess() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.navbarAccess || []);
            }, 1000);
        });
    }

    getItemAccess() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.itemList || []);
            }, 1000);
        });
    }




}
