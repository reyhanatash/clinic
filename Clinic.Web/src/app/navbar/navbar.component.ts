import { Component } from '@angular/core';
import { NgForOf, NgClass, NgIf } from "@angular/common";
import { NavigationEnd, Router, Event, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { PatientService } from '../_services/patient.service';
import { ToastrService } from 'ngx-toastr';
import swal from 'sweetalert2';
import { PatientMenuComponent } from "../components/patient-menu/patient-menu.component";
import { ObjectService } from '../_services/store.service';
export interface imenu {
  id: number;
  text: string;
  link: string;
  roleAccess: number[];
  icon: string
}

export const Menu: imenu[] = [
  { id: 0, text: "وقت دهی", link: '/appointment', roleAccess: [], icon: 'fa fa-calendar' },
  { id: 1, text: "اوقات امروز", link: '/today-appointment', roleAccess: [], icon: 'fa fa-clock-o' },
  { id: 2, text: "بیماران", link: '/patients', roleAccess: [], icon: 'fa fa-users' },
  { id: 3, text: "صورت حساب ها", link: '/invoice-list', roleAccess: [], icon: 'fa fa-file-text' },
  { id: 4, text: "دریافت ها", link: '/receipt-list', roleAccess: [], icon: 'fa fa-credit-card-alt' },
  { id: 5, text: "پرداخت ها", link: '/payment-list', roleAccess: [], icon: 'fa fa-credit-card-alt' },
  { id: 6, text: "کالاهای مصرفی", link: '/product-list', roleAccess: [], icon: 'fa fa-th-large' },
  { id: 7, text: "هزینه ها", link: '/expenses', roleAccess: [], icon: 'fa fa-money' },
  { id: 8, text: "اشخاص", link: '/contacts', roleAccess: [], icon: 'fa fa-user' },
  { id: 9, text: "گزارشات", link: '/report/business-report', roleAccess: [], icon: 'fa fa-bar-chart' },
];

export const settingMenu: imenu[] = [
  { id: 11, text: "تنظیمات عمومی", link: '/general-setting', roleAccess: [], icon: 'fa fa-caret-left' },
  { id: 12, text: "مکان ها", link: '/business-List', roleAccess: [], icon: 'fa fa-caret-left' },
  { id: 13, text: "کاربران", link: '/userlist', roleAccess: [], icon: 'fa fa-caret-left' },
  { id: 14, text: "نقش ها و دسترسی ها", link: '/user-role-list', roleAccess: [], icon: 'fa fa-caret-left' },
  { id: 21, text: "تنظیمات پیامکی", link: '/sms-setting', roleAccess: [], icon: 'fa fa-caret-left' },
];
export const financialMenu: imenu[] = [
  { id: 15, text: "خدمات", link: '/service-list', roleAccess: [], icon: 'fa fa-caret-left' },
  { id: 16, text: "گروه خدمات", link: '/service-group-list', roleAccess: [], icon: 'fa fa-caret-left' },
];
export const appointmentMenu: imenu[] = [
  { id: 17, text: "انواع وقت دهی", link: '/appointment-types', roleAccess: [], icon: 'fa fa-caret-left' },
  // { id: 18, text: "تعطیلات", link: '', roleAccess: [], icon: 'fa fa-caret-left' },
  { id: 19, text: "استثنائات اوقات پزشکان", link: '/time-exception', roleAccess: [], icon: 'fa fa-caret-left' },
  { id: 20, text: "استثنائات خارج از نوبت", link: '/outOfturnexceptions', roleAccess: [], icon: 'fa fa-caret-left' },
];

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgForOf, NgClass, RouterLink, NgIf, PatientMenuComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  sidebarMenu: any[] = [];
  settingMenu: any[] = [];
  financialMenu: any[] = [];
  appointmentMenu: any[] = [];
  selectedSideBarItem: any;
  selectedPatientSideBarItem: any
  isMobileSize: boolean
  patientMenu: imenu[];
  hasPatientMenu: boolean = false;
  patientId: any;
  patientName: string;
  patientInfo: any;
  openSidebar: boolean;
  showReportMenu: boolean = false;
  reportMenu: imenu[] = [
    { id: 21, text: "گزارش خلاصه عملکرد", link: '/report/business-report', roleAccess: [], icon: 'fa fa-bar-chart' },
    { id: 22, text: " گزارش صورتحسابهای سرپایی ", link: '', roleAccess: [], icon: 'fa fa-bar-chart' },
    { id: 23, text: "گزارش صورتحسابهای تغییر کرده", link: '', roleAccess: [], icon: 'fa fa-bar-chart' },
    { id: 24, text: "گزارش درآمد", link: '', roleAccess: [], icon: 'fa fa-bar-chart' },
    { id: 25, text: " گزارش بیماران مراجعه نکرده", link: '', roleAccess: [], icon: 'fa fa-bar-chart' },
  ];
  selectedSideBarreportMenuItem: any;
  openSettingMenu: boolean = false;
  openFinancialMenu: boolean = false;
  openAppointmentMenu: boolean = false;
  userName: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private patientService: PatientService,
    private toastR: ToastrService,
    private ObjectService: ObjectService
  ) {
    router.events.subscribe((event: Event) => {
      let url = location.pathname.split('?')[0];
      let pageUrl = location.pathname;
      if (event instanceof NavigationEnd) {
        if ((url.startsWith('/patient/'))) {
          this.hasPatientMenu = true;
          if ((url.startsWith('/patient/info'))) {
            pageUrl = this.router.url;
            this.patientId = url.split('/').pop();
            this.getPatientById(this.patientId);
          }
        }
        else {
          this.hasPatientMenu = false;
        }
        this.showReportMenu = (url.startsWith('/report/')) == true ? true : false;
        const matchedItem = this.reportMenu.find(item => item.link === pageUrl);
        this.selectedSideBarreportMenuItem = matchedItem?.id ?? null;

      }
    })

  }
  async ngOnInit() {
    let url = location.pathname;
    this.isMobileSize = window.innerWidth <= 768 && window.innerHeight <= 1024;
    if (this.isMobileSize) {
      this.openSidebar = false;
    }
    else {
      this.openSidebar = true;
    }
    let allowedLinks = await this.ObjectService.getNavbarAccess();
    this.sidebarMenu = this.filterMenu(Menu, allowedLinks);
    this.settingMenu = this.filterMenu(settingMenu, allowedLinks);;
    this.financialMenu = this.filterMenu(financialMenu, allowedLinks);;
    this.appointmentMenu = this.filterMenu(appointmentMenu, allowedLinks);
    if ((url.startsWith('/patient/'))) {
      this.hasPatientMenu = true;
      this.patientId = url.split('/').pop();
      this.getPatientById(this.patientId);
    }
    this.showReportMenu = (url.startsWith('/report/')) == true ? true : false;
    const matchedItem = this.reportMenu.find(item => item.link === url);
    this.selectedSideBarreportMenuItem = matchedItem?.id ?? null;
    this.userName = localStorage.getItem('fullName');

  }

  logOut() {
    this.authService.logout();
  }


  async getPatientById(patientId) {
    try {
      let res: any = await this.patientService.getPatientById(patientId).toPromise();
      if (res.length > 0) {
        this.patientInfo = res[0]
        this.patientName = res[0].firstName + "" + res[0].lastName;
      }
    }
    catch {
      this.toastR.error('خطا!', 'خطا در دریافت اطلاعات');
    }
  }


  async deletePatient(patientId) {
    swal.fire({
      title: "آیا از حذف این بیمار مطمئن هستید ؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      try {
        if (result.value) {
          let res: any = await this.patientService.deletePatient(patientId).toPromise();
          if (res['status'] == 0) {
            this.toastR.success('با موفقیت حذف گردید');
            this.router.navigate(['/patients']);
          }
        }
      }
      catch {
        this.toastR.error('خطایی رخ داد', 'خطا!')
      }
    })
  }


  mobileSideBarClose() {
    if (this.isMobileSize) {
      this.openSidebar = false;
    }
  }

  filterMenu(menu, accessList) {
    const result = [];
    menu.forEach(menuItem => {
      const found = accessList.find(acc => acc.link === menuItem.link);
      if (found) {
        if (found.clicked) {
          result.push(menuItem);
        }
      } else {
        result.push(menuItem);
      }
    });
    return result;
  }
}

