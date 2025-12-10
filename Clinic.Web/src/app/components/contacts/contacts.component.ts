import { Component } from '@angular/core';
import { ContactService } from '../../_services/contact.service';
import { ToastrService } from 'ngx-toastr';
import { TableModule } from "primeng/table";
import swal from 'sweetalert2';
import { Router, RouterLink } from "@angular/router";
import { MainService } from '../../_services/main.service';
import { DropdownModule } from "primeng/dropdown";
import { FormsModule } from '@angular/forms';
import { DialogModule } from "primeng/dialog";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [TableModule, RouterLink, DropdownModule, FormsModule, DialogModule, CommonModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.css'
})
export class ContactsComponent {
  contactList: any = [];
  jobsList: any;
  phoneTypeList: any = [
    { name: "موبایل", code: 1 },
    { name: "منزل", code: 2 },
    { name: "محل کار", code: 3 },
    { name: "فکس", code: 4 },
    { name: "سایر", code: 5 },
  ]
  phoneNum: any = [];
  showAddPhoneNum: boolean = false;
  hasPhoneNum: any;
  contactPhoneEditMode: any;
  selectedPatientAddPhoneId: any;
  selectedContactAddPhoneId: any;
  selectedEditPhoneNum: any;
  constructor(
    private contactService: ContactService,
    private toastR: ToastrService,
    private router: Router,
    private mainService: MainService
  ) { }

  async ngOnInit() {
   await this.getJobs();
    this.getContacts();
  }

  async getJobs() {
    let res: any = await this.mainService.getJobs().toPromise();
    if (res.length > 0) {
      this.jobsList = res;
    }
  }

  async getContacts() {
    try {
      let res: any = await this.contactService.getContacts().toPromise();
      if (res.length > 0) {
        this.contactList = res;
        this.contactList.forEach(async contact => {
          contact.jobTitle = this.jobsList.filter(job => job.id == contact.jobId)[0].name;
          contact.phone = await this.getContactPhone(contact.id);
          contact.phoneNum = contact.phone?.number
        });
      }
      else {
        this.toastR.error('خطا در دریافت اطلاعات', 'خطا!');
      }
    }
    catch {
      this.toastR.error('خطا در دریافت اطلاعات', 'خطا!');
    }
  }

  async deleteContact(id) {
    swal.fire({
      title: "آیا از حذف این شخص مطمئن هستید ؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      try {
        let res: any = await this.contactService.deleteContact(id).toPromise();
        if (res['status'] == 0) {
          this.toastR.success('با موفقیت حذف گردید');
          this.getContacts();
        }
      }
      catch {
        this.toastR.error('خطایی رخ داد', 'خطا!');
      }
    })
  }

  editContact(contact) {
    this.contactService.selectedEditContact.next(contact);
    this.router.navigate(['/new-contact/' + contact.id])
  }

  async getContactPhone(contactId: any) {
    try {
      let res: any = await this.contactService.getContactPhone(contactId).toPromise();
      if (res.length > 0) {
        return res[0];

      }
      else {
        return null
      }
    }
    catch {
      this.toastR.error('خطا در دریافت اطلاعات', 'خطا!')
    }
  }

  async savePatientPhone() {
    try {
      let model = {
        contactId: this.selectedContactAddPhoneId,
        phoneNoTypeId: this.phoneNum.phoneType.code,
        number: this.phoneNum.phoneNumber,
        editOrNew: this.contactPhoneEditMode ? this.selectedEditPhoneNum : -1
      }
      let res: any = await this.contactService.savePatientPhone(model).toPromise();
      if (res['status'] == 0) {
        this.toastR.success('با موفقیت ثبت شد');
        this.closeAddPhoneNum();
        this.getContacts();
      }
    }
    catch {
      this.toastR.error('خطا در دریافت اطلاعات', 'خطا!')
    }
  }

  openAddPhoneNumModal(contactId) {
    if (this.contactPhoneEditMode) {
      this.hasPhoneNum = true;
    }
    else {
      this.hasPhoneNum = false;
    }
    this.showAddPhoneNum = true;
    this.selectedContactAddPhoneId = contactId;
  }

  closeAddPhoneNum() {
    this.showAddPhoneNum = false;
    this.phoneNum = [];
    this.selectedPatientAddPhoneId = '';
    this.selectedEditPhoneNum = '';
    this.contactPhoneEditMode = false;
  }

  editPhoneNum(contactPhone) {
    this.selectedEditPhoneNum = contactPhone.id;
    this.contactPhoneEditMode = true;
    this.phoneNum.phoneNumber = contactPhone.number;
    this.phoneNum.phoneType = this.phoneTypeList.filter(type => type.code == contactPhone.phoneNoTypeId)[0];
    this.openAddPhoneNumModal(contactPhone.patientId);
  }

  async deleteContactPhone(contactId) {
    try {
      let res: any = await this.contactService.deleteContactPhone(contactId).toPromise();
      if (res['status'] == 0) {
        this.toastR.success('با موفقیت حذف گردید');
        this.getContacts();
        this.closeAddPhoneNum();
      }
    }
    catch {
      this.toastR.error('خطا در دریافت اطلاعات', 'خطا!')
    }

  }
}
