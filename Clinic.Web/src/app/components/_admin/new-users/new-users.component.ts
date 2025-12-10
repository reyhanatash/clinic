import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from "primeng/selectbutton";
import { DropdownModule } from 'primeng/dropdown';
import { UserService } from '../../../_services/user.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { MultiSelectModule } from 'primeng/multiselect';
import { MainService } from '../../../_services/main.service';
import { TreatmentsService } from '../../../_services/treatments.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-new-users',
  standalone: true,
  imports: [SelectButtonModule, FormsModule, DropdownModule, MultiSelectModule, CommonModule],
  templateUrl: './new-users.component.html',
  styleUrl: './new-users.component.css'
})
export class NewUsersComponent {

  newUser: any = [];
  isActive: any[] = [{ label: 'بله', value: true }, { label: 'خیر', value: false }];
  hasStatus: any[] = [{ label: 'دارد', value: true }, { label: 'ندارد', value: false }];
  userRole: any;
  titleList: any[] = [
    { name: "جناب", code: "1" },
    { name: "دکتر", code: "2" },
    { name: "آقا", code: "3" },
    { name: "خانم", code: "4" },
    { name: "پروفسور", code: "5" },
    { name: "مهندس", code: "6" }
  ]
  accesses: any = [];
  appointmentTypes: any = [];
  selectedEditUserId: any;
  usersList: any;
  selectedEditUser: any;
  roles: any = [];
  userId: any;
  editMode: any;
  constructor(
    private userService: UserService,
    private toastR: ToastrService,
    private router: Router,
    private mainService: MainService,
    private treatmentService: TreatmentsService,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.userId = this.activeRoute.snapshot.paramMap.get('id');
    this.getClinics();
    this.getAppointmentTypes();
    this.getRoles();
    setTimeout(() => {
      if (this.userId) {
        this.editMode = true;
        this.setFromsFields(this.userId);
      }
    }, 500);
  }

  async createUser() {
    if (!this.newUser.userName) {
      this.toastR.error("لطفا نام کاربری را وارد کنید");
      return
    }
    let model = {
      "username": this.newUser.userName,
      "password": this.newUser.password,
      "isDoctor": this.newUser.isDoctor,
      "showTreatmentOnClick": this.newUser.ShowTreatment,
      "canChangeOldTreatment": this.newUser.showOldTreatments,
      "suspendReservationDays": this.newUser.talighDays,
      "outOfRangePatients": this.newUser.outOfRange,
      "doctorSkill": this.newUser.expertise,
      "description": this.newUser.describe,
      "titleId": this.fieldConvert(this.newUser.title.code),
      "email": this.newUser.email,
      "firstName": this.newUser.firstName,
      "lastName": this.newUser.lastName,
      "roleId": this.fieldConvert(this.newUser.role.code),
      "isActive": this.newUser.isActive,
      "showInOnlineBookings": this.newUser.ShowDocInReserve,
      "loadLastDataOnNewTreatment": this.newUser.copyPatientData,
      "smsEnabled": this.newUser.sendSms,
      "canConfirmInvoice": this.newUser.changeStatus,
      "businessIds": this.fieldConvert(this.newUser.access),
      "appointmentTypesIds": this.fieldConvert(this.newUser.appointmentType)
    }
    try {
      let res: any = await this.userService.createUser(model).toPromise();
      if (res['status'] == 0) {
        this.toastR.success("با موفقیت ذخیره شد!");
        this.router.navigate(['/userlist']);
      }
    }
    catch { }
  }

  async updateUser() {
    let model = {
      'id': this.userId,
      "username": this.newUser.userName,
      "password": this.newUser.password,
      "isDoctor": this.newUser.isDoctor,
      "showTreatmentOnClick": this.newUser.ShowTreatment,
      "canChangeOldTreatment": this.newUser.showOldTreatments,
      "suspendReservationDays": this.newUser.talighDays,
      "outOfRangePatients": this.newUser.outOfRange,
      "doctorSkill": this.newUser.expertise,
      "description": this.newUser.describe,
      "titleId": this.fieldConvert(this.newUser.title.code),
      "email": this.newUser.email,
      "firstName": this.newUser.firstName,
      "lastName": this.newUser.lastName,
      "roleId": this.fieldConvert(this.newUser.role.code),
      "isActive": this.newUser.isActive,
      "showInOnlineBookings": this.newUser.ShowDocInReserve,
      "loadLastDataOnNewTreatment": this.newUser.copyPatientData,
      "smsEnabled": this.newUser.sendSms,
      "canConfirmInvoice": this.newUser.changeStatus,
      "businessIds": this.fieldConvert(this.newUser.access),
      "appointmentTypesIds": this.fieldConvert(this.newUser.appointmentType)
    }
    try {
      let res: any = await this.userService.updateUser(model).toPromise();
      if (res['status'] == 0) {
        this.toastR.success("با موفقیت ذخیره شد!");
        this.router.navigate(['/userlist']);
      }
    }
    catch { }
  }

  async getClinics() {
    try {
      let res = await this.mainService.getClinics().toPromise();
      this.accesses = res;
      this.accesses.forEach((clinic: any) => {
        clinic.code = clinic.id;
      });
    }
    catch {
      this.toastR.error('خطا!', 'خطا در دریافت اطلاعات')
    }
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

  fieldConvert(item) {
    if (item) {
      return item.toString();
    }
    else {
      return null;
    }
  }

  async getRoles() {
    try {
      let res: any = await this.userService.getRoles().toPromise();
      if (res.length > 0) {
        this.roles = res;
        this.roles.forEach((type: any) => {
          type.code = type.id;
        });
      }
    }
    catch { }
  }

  async setFromsFields(id) {
    try {
      let res: any = await this.userService.getUserById(id).toPromise();
      if (res.length > 0) {
        let userData = res[0];
        this.newUser.firstName = userData.firstName;
        this.newUser.lastName = userData.lastName;
        this.newUser.userName = userData.email;
        this.newUser.isActive = userData.isActive;
        this.newUser.role = this.roles.filter(role => role.id == userData.roleId)[0];
        this.newUser.title = this.titleList.filter(title => title.code == userData.titleId)[0];
        this.newUser.isDoctor = userData.isPractitioner;
        this.newUser.ShowTreatment = userData.showTreatmentOnClickPatientName;
        this.newUser.showOldTreatments = userData.canChangeOldTreatment;
        this.newUser.talighDays = userData.suspendReservationDays;
        this.newUser.outOfRange = userData.outOfRange;
        this.newUser.expertise = userData.doctorSkill;
        this.newUser.describe = userData.description;
        this.newUser.ShowDocInReserve = userData.showInOnlineBookings;
        this.newUser.copyPatientData = userData.loadLastDataOnNewTreatment;
        this.newUser.sendSms = userData.smsEnabled;
        this.newUser.changeStatus = userData.canConfirmInvoice;
        this.newUser.access = this.accesses.filter((access: any) => userData.businessIds == access.id);
        this.newUser.appointmentType = this.appointmentTypes.filter((type: any) => userData.appointmentTypesIds == type.id);
      }
    }
    catch { }
  }
}