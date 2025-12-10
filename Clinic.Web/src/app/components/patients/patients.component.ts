import { Component } from '@angular/core';
import { PatientService } from '../../_services/patient.service';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Router, RouterLink } from "@angular/router";
import { DialogModule } from "primeng/dialog";
import { CommonModule } from '@angular/common';
import { MainService } from '../../_services/main.service';
import { ContactService } from '../../_services/contact.service';
import { InputMaskModule } from 'primeng/inputmask';
import { DropdownModule } from 'primeng/dropdown';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import swal from 'sweetalert2';
import { NewContactComponent } from '../contacts/new-contact/new-contact.component';
import { UtilService } from '../../_services/util.service';
import { ObjectService } from '../../_services/store.service';
@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [TableModule, FormsModule, SelectButtonModule, DialogModule, CommonModule, SelectButtonModule, InputMaskModule, DropdownModule, RouterLink, NewContactComponent],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.css'
})
export class PatientsComponent {
  patientsList: any = [];
  showCreatePatient: boolean = false;
  newPatient: any = [];
  genderList: any[] = [{ label: 'مرد', value: '1' }, { label: 'زن', value: '2' }];
  titleList: any[] = [
    { name: "جناب", code: "1" },
    { name: "دکتر", code: "2" },
    { name: "آقا", code: "3" },
    { name: "خانم", code: "4" },
    { name: "پروفسور", code: "5" },
    { name: "مهندس", code: "6" },
  ];
  jobs: any;
  mainInsurance: any;
  takmiliInsurance: any;
  firstReagent: any;
  secondReagent: any;
  InpatientInsurance: any;
  patientTitle: any;
  jobList: any = [];
  contactsList: any = [];
  showAddPhoneNum: boolean = false;
  phoneTypeList: any = [
    { name: "موبایل", code: 1 },
    { name: "منزل", code: 2 },
    { name: "محل کار", code: 3 },
    { name: "فکس", code: 4 },
    { name: "سایر", code: 5 },
  ]
  phoneNum: any = [];
  editpatientMode: boolean = false;
  selectedPatientAddPhoneId: any;
  patientPhoneEditMode: boolean = false;
  selectedEditPhoneNum: any;
  selectedEditPhonePatientId: any;
  hasPhoneNum: boolean;
  patientPhoneList = [];
  displayDialog: boolean;
  userType: any;
  allowedLinks: any = [];
  
  constructor(
    private patientService: PatientService,
    private mainService: MainService,
    private contactService: ContactService,
    private toastR: ToastrService,
    private router: Router,
    private utilService: UtilService,
    private objectService: ObjectService
  ) {
  }

  async ngOnInit() {
    this.allowedLinks = await this.objectService.getDataAccess();
    this.userType = this.utilService.checkUserType();
    if (this.checkAccess(1)) {
      this.getPatients();
      this.getJobs();
      this.getContacts();
    }
  }
  async getPatients() {
    let res: any = await this.patientService.getPatients().toPromise();
    if (res.length > 0) {
      this.patientsList = res;
    }
    this.patientsList.forEach(async patient => {
      patient.patientPhone = await this.getPatientPhone(patient.id);
      patient.phoneNum = patient.patientPhone?.number;
      patient.fullName = patient.firstName + ' ' + patient.lastName;
    });
  }

  createPatientModal() {
    this.showCreatePatient = true;
    this.getJobs();
    this.getContacts();
  }


  async createPatient(invoiceStatus) {
    if (!this.newPatient.firstName || !this.newPatient.lastName || !this.newPatient.gender || !this.newPatient.birthDate || !this.newPatient.nationalCode || !this.newPatient.fatherName
      || !this.newPatient.mobile || !this.newPatient.referringContactId
    ) {
      this.toastR.error('تمامی موارد خواسته شده رو تکمیل کنید');
      return
    }
    let model = {
      titleId: this.newPatient.title.code,
      firstName: this.newPatient.firstName,
      lastName: this.newPatient.lastName,
      gender: this.newPatient.gender,
      fatherName: this.newPatient.fatherName,
      birthDate: this.newPatient.birthDate,
      city: this.newPatient.city,
      note: this.newPatient.note,
      referringInsurerId: this.newPatient.mainInsurance,
      referringInsurer2Id: this.newPatient.takmiliInsurance,
      referringContactId: this.newPatient.referringContactId.code,
      referringContact2Id: this.newPatient.referringContact2Id,
      nationalCode: this.newPatient.nationalCode,
      jobId: this.newPatient.job.code,
      referringInpatientInsurerId: this.newPatient.referringInpatientInsurerId,
      editOrNew: this.editpatientMode ? this.newPatient.id : -1,
      mobile: this.newPatient.mobile
    }
    try {
      let res: any = await firstValueFrom(this.patientService.savePatient(model));
      if (res) {
        this.toastR.success('با موفقیت ثبت شد!');
        this.getPatients();
        if (invoiceStatus) {
          this.router.navigate(['patient/invoice/' + this.newPatient.id])
        }
        this.closeCreatePatientModal();
      }
    } catch (error) {
      this.toastR.error('خطایی رخ داد', 'خطا!')
    }

  }

  async getJobs() {
    let res: any = await this.mainService.getJobs().toPromise();
    if (res.length > 0) {
      this.jobList = res;
      this.jobList.forEach(job => {
        job.code = job.id
      });
    }
  }

  async getContacts() {
    let res: any = await this.contactService.getContacts().toPromise();
    if (res.length > 0) {
      this.contactsList = res;
      this.contactsList.forEach(contact => {
        contact.code = contact.id,
          contact.name = contact.firstName
      });
    }
  }

  closeCreatePatientModal() {
    this.showCreatePatient = false;
    this.newPatient = [];
  }
  async savePhone() {
    let model = {
      patientId: this.selectedPatientAddPhoneId,
      phoneNoTypeId: this.phoneNum.phoneType.code,
      number: this.phoneNum.phoneNumber,
      editOrNew: this.patientPhoneEditMode ? this.selectedEditPhoneNum : -1
    }
    let res = await this.patientService.savePatientPhone(model).toPromise();
    if (res['status'] == 0) {
      this.toastR.success("با موفقیت ثبت شد!")
      this.patientPhoneEditMode = false;
      this.getPatients();
      this.closeAddPhoneNum();
    }
  }

  closeAddPhoneNum() {
    this.showAddPhoneNum = false;
    this.phoneNum = [];
    this.selectedPatientAddPhoneId = '';
    this.selectedEditPhoneNum = '';
    this.patientPhoneEditMode = false;
    this.patientPhoneList = [];
    this.getPatients();
  }


  async openAddPhoneNumModal(patientId) {
    this.selectedPatientAddPhoneId = patientId;
    this.showAddPhoneNum = true;
    await this.getPatientPhone(patientId);
    await this.creatPatientPhone();
  }

  async getPatientPhone(patientId) {
    try {
      const res: any = await this.patientService.getPatientPhone(patientId).toPromise();
      if (res.length > 0) {
        this.patientPhoneList = res;
        return res[0];
      }
      else {
        return null;
      }
    }
    catch { }
  }

  editPatient(patient) {
    this.editpatientMode = true;
    this.createPatientModal();
    this.newPatient.title = this.titleList.filter(title => title.code == patient.titleId)[0];
    this.newPatient.firstName = patient.firstName;
    this.newPatient.lastName = patient.lastName;
    this.newPatient.gender = this.genderList.filter(gender => gender.value == patient.gender)[0].value;
    this.newPatient.fatherName = patient.fatherName;
    this.newPatient.birthDate = patient.birthDate;
    this.newPatient.city = patient.city;
    this.newPatient.note = patient.notes;
    this.newPatient.mainInsurance = patient.referringInsurerId;
    this.newPatient.takmiliInsurance = patient.referringInsurer2Id;
    this.newPatient.referringContactId = patient.referringContactId;
    this.newPatient.referringContact2Id = patient.referringContact2Id;
    this.newPatient.nationalCode = patient.nationalCode;
    this.newPatient.job = this.jobList.filter(job => job.code == patient.jobId)[0];
    this.newPatient.referringInpatientInsurerId = patient.referringInpatientInsurerId;
    this.newPatient.mobile = patient.mobile;
    this.newPatient.id = patient.id;
  }

  editPhoneNum(patientPhone) {
    this.selectedEditPhoneNum = patientPhone.id;
    this.patientPhoneEditMode = true;
    this.phoneNum.phoneNumber = patientPhone.number;
    this.phoneNum.phoneType = this.phoneTypeList.filter(type => type.code == patientPhone.phoneNoTypeId)[0];
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
            this.getPatients();
          }
        }
      }
      catch {
        this.toastR.error('خطایی رخ داد', 'خطا!')
      }
    })
  }

  async deletePatientPhone(phoneId) {
    swal.fire({
      title: "آیا از حذف شماره تلفن بیمار مطمئن هستید ؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      try {
        let res: any = await this.patientService.deletePatientPhone(phoneId).toPromise();
        if (res['status'] == 0) {
          this.getPatients();
          this.toastR.success('با موفقیت حذف گردید');
          this.closeAddPhoneNum();
        }
      }
      catch {
        this.toastR.error('خطایی رخ داد', 'خطا!')
      }
    })
  }
  creatPatientPhone() {
    if (this.patientPhoneList.length > 0) {
      this.patientPhoneList.forEach(element => {
        element.typeText = this.phoneTypeList.filter(type => type.code == element.phoneNoTypeId)[0].name;
      });
    }
  }

  async closeModal(data) {
    this.displayDialog = false;
    await this.getContacts();
    this.newPatient.referringContactId = this.contactsList.filter(x => x.firstName == data.firstName)[0];
  }

  checkAccess(id) {
    if (this.allowedLinks?.length > 0) {
      const item = this.allowedLinks.find(x => x.id === id);
      return item.clicked;
    } else {
      return false
    }
  }

}
