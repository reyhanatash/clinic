import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./user-registration/login/login.component').then(m => m.LoginComponent),
    },
    {
        path: 'change-password',
        loadComponent: () => import('./user-registration/change-password/change-password.component').then(m => m.ChangePasswordComponent),
        canActivate: [AuthGuard]
    },

    {
        path: 'appointment',
        loadComponent: () => import('./components/appointment/appointment.component').then(m => m.AppointmentComponent),

        canActivate: [AuthGuard]
    },
    {
        path: 'today-appointment',
        loadComponent: () => import('./components/today-appointments/today-appointments.component').then(m => m.TodayAppointmentsComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'patients',
        loadComponent: () => import('./components/patients/patients.component').then(m => m.PatientsComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'invoice-list',
        loadComponent: () => import('./components/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'new-invoice/:invoiceId/:patientId/:clinicId/:appointmentId/:type',
        loadComponent: () => import('./components/invoice-list/new-invoice/new-invoice.component').then(m => m.NewInvoiceComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'new-contact/:id',
        loadComponent: () => import('./components/contacts/new-contact/new-contact.component').then(m => m.NewContactComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'contacts',
        loadComponent: () => import('./components/contacts/contacts.component').then(m => m.ContactsComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'patient/appointments/:id',
        loadComponent: () => import('./components/patient-appointments/patient-appointments.component').then(m => m.PatientAppointmentsComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'patient/info/:id',
        loadComponent: () => import('./components/patient-info/patient-info.component').then(m => m.PatientInfoComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'patient/attachment/:id',
        loadComponent: () => import('./components/patient-attachment/patient-attachment.component').then(m => m.PatientAttachmentComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'product',
        loadComponent: () => import('./components/_admin/product/product.component').then(m => m.ProductComponent),
        canActivate: [AuthGuard],
    },
    {
        path: 'product-list',
        loadComponent: () => import('./components/product-list/product-list.component').then(m => m.ProductListComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'receipt',
        loadComponent: () => import('./components/receipt/receipt.component').then(m => m.ReceiptComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'receipt/:id',
        loadComponent: () => import('./components/receipt/receipt.component').then(m => m.ReceiptComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'receipt-list',
        loadComponent: () => import('./components/receipt-list/receipt-list.component').then(m => m.ReceiptListComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'payment-list',
        loadComponent: () => import('./components/receipt-list/receipt-list.component').then(m => m.ReceiptListComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'patient/treatment/:id',
        loadComponent: () => import('./components/patient-treatment/patient-treatment.component').then(m => m.PatientTreatmentComponent),
        canActivate: [AuthGuard]
    },
    // {
    //     path: 'patient-treatment/:id',
    //     loadComponent: () => import('./components/patient-treatment/patient-treatment.component').then(m => m.PatientTreatmentComponent),
    //     canActivate: [AuthGuard]
    // },
    {
        path: 'payment',
        loadComponent: () => import('./components/receipt/receipt.component').then(m => m.ReceiptComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'patient/invoice/:id',
        loadComponent: () => import('./components/patient-invoice/patient-invoice.component').then(m => m.PatientInvoiceComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'patient/patient-receipts/:id',
        loadComponent: () => import('./components/patient-receipts/patient-receipts.component').then(m => m.PatientReceiptsComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'patient/receipt/:id',
        loadComponent: () => import('./components/receipt/receipt.component').then(m => m.ReceiptComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'patient/payment/:id',
        loadComponent: () => import('./components/patient-payment/patient-payment.component').then(m => m.PatientPaymentComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'report/business-report',
        loadComponent: () => import('./components/reports/business-report/business-report.component').then(m => m.BusinessReportComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'outinvoice-report',
        loadComponent: () => import('./components/reports/outinvoice-report/outinvoice-report.component').then(m => m.OutinvoiceReportComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'user/new',
        loadComponent: () => import('./components/_admin/new-users/new-users.component').then(m => m.NewUsersComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'user/new/:id',
        loadComponent: () => import('./components/_admin/new-users/new-users.component').then(m => m.NewUsersComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'userlist',
        loadComponent: () => import('./components/_admin/user-list/user-list.component').then(m => m.UserListComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'userlist/user-appointment-setting/:uid',
        loadComponent: () => import('./components/_admin/user-list/user-appointment-setting/user-appointment-setting.component').then(m => m.UserAppointmentSettingComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'business-List',
        loadComponent: () => import('./components/_admin/business-list/business-list.component').then(m => m.BusinessListComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'new-business',
        loadComponent: () => import('./components/_admin/business-list/new-business/new-business.component').then(m => m.NewBusinessComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'new-business/:id',
        loadComponent: () => import('./components/_admin/business-list/new-business/new-business.component').then(m => m.NewBusinessComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'service-list',
        loadComponent: () => import('./components/_admin/service-list/service-list.component').then(m => m.ServiceListComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'new-service',
        loadComponent: () => import('./components/_admin/service-list/new-service/new-service.component').then(m => m.NewServiceComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'new-service/:id',
        loadComponent: () => import('./components/_admin/service-list/new-service/new-service.component').then(m => m.NewServiceComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'appointment-types',
        loadComponent: () => import('./components/_admin/appointment-types/appointment-types.component').then(m => m.AppointmentTypesComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'user-roles',
        loadComponent: () => import('./components/_admin/user-roles/user-roles.component').then(m => m.UserRolesComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'user-roles/:id',
        loadComponent: () => import('./components/_admin/user-roles/user-roles.component').then(m => m.UserRolesComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'service-group-list',
        loadComponent: () => import('./components/service-grouplist/service-group-list.component').then(m => m.ServiceGrouplistComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'new-service-group',
        loadComponent: () => import('./components/service-grouplist/new-service-group/new-service-group.component').then(m => m.NewServiceGroupComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'new-service-group/:id',
        loadComponent: () => import('./components/service-grouplist/new-service-group/new-service-group.component').then(m => m.NewServiceGroupComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'time-exception',
        loadComponent: () => import('./components/_admin/time-exception/time-exception.component').then(m => m.TimeExceptionComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'expenses',
        loadComponent: () => import('./components/_admin/expenses/expenses.component').then(m => m.ExpensesComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'outOfturnexceptions',
        loadComponent: () => import('./components/_admin/out-of-turn-exceptions/out-of-turn-exceptions.component').then(m => m.OutOfTurnExceptionsComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'user-role-list',
        loadComponent: () => import('./components/_admin/user-roles/user-role-list/user-role-list.component').then(m => m.UserRoleListComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'job-list',
        loadComponent: () => import('./components/_admin/job-list/job-list.component').then(m => m.JobListComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'sms-setting',
        loadComponent: () => import('./components/_admin/sms-setting/sms-setting.component').then(m => m.SmsSettingComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'general-setting',
        loadComponent: () => import('./components/_admin/general-setting/general-setting.component').then(m => m.GeneralSettingComponent),
        canActivate: [AuthGuard]
    },
    // {
    //     path: 'patient-fields',
    //     loadComponent: () => import('./components/_admin/patient-fields/patient-fields.component').then(m => m.PatientFieldsComponent),
    //     canActivate: [AuthGuard]
    // },
];
