import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../share/shared.module';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { MainService } from '../../../_services/main.service';
import moment from 'moment-jalaali';
import { FormControl } from '@angular/forms';
import { UserService } from '../../../_services/user.service';
import { ObjectService } from '../../../_services/store.service';

@Component({
  selector: 'app-out-of-turn-exceptions',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './out-of-turn-exceptions.component.html',
  styleUrl: './out-of-turn-exceptions.component.css'
})
export class OutOfTurnExceptionsComponent implements OnInit {


  constructor(
    private mainService: MainService,
    private toastR: ToastrService,
    private userService: UserService,
    private objectService: ObjectService
  ) { }

  form: any = [];
  itemList: any = [];
  clinicsList: any = [];
  doctorList: any = [];
  allowedLinks: any = [];

  async ngOnInit(): Promise<void> {
    this.allowedLinks = await this.objectService.getDataAccess();
    if (this.checkAccess(1)) {
      this.getOutOfTurnExceptions();
      this.getUsers();
      this.getClinics();
      this.form.selectedDate = new FormControl(moment().format('jYYYY/jMM/jDD'));
      this.form.editOrNew = -1;
    } else {
      this.toastR.error("شما دسترسی به این صفحه ندارید");
    }
  }

  async getOutOfTurnExceptions() {
    try {
      let res = await this.mainService.getOutOfTurnExceptions().toPromise();
      this.itemList = res;
    }
    catch { }

  }

  async saveOutOfTurnException() {
    if (!this.form.selectedDate || !this.form.selectedDoctor || !this.form.outOfTurn) {
      this.toastR.error("لطفا مقادیر اجباری را وارد نمایید!");
    }
    else {
      let model =
      {
        startDate: moment(this.form.selectedDate.value, 'jYYYY/jMM/jDD').add(3.5, 'hours').toDate(),
        practitionerId: this.form.selectedDoctor?.id,
        businessId: this.form.selectedClinic?.id,
        outOfTurn: this.form.outOfTurn,
        editOrNew: this.form.editOrNew
      }
      try {
        let res: any = await this.mainService.saveOutOfTurnException(model).toPromise();
        this.toastR.success('اطلاعات با موفقیت ثبت شد');
        this.form = [];
        this.form.editOrNew = -1;
        this.getOutOfTurnExceptions();
      }
      catch { }
    }
  }

  edit(item) {
    this.form.editOrNew = item['id'];
    this.form.selectedClinic = this.clinicsList.filter(x => x.id == item['businessId'])[0];
    this.form.selectedDoctor = this.doctorList.filter(x => x.id == item['practitionerId'])[0];
    this.form.outOfTurn = item['outOfTurn'];
    let fromDate = moment(item['startDate']);
    this.form.selectedDate.setValue(fromDate.format('jYYYY/jMM/jDD'));

  }

  async deleteOutOfTurnException(id) {
    Swal.fire({
      title: "آیا از حذف این مورد مطمئن هستید ؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      try {
        if (result.value) {
          let res: any = await this.mainService.deleteOutOfTurnException(id).toPromise();
          if (res.status == 0) {
            this.toastR.success("با موفقیت حذف شد!")
            this.getOutOfTurnExceptions();
          }
        }
      }
      catch {
        this.toastR.error('خطایی رخ داد', 'خطا!')
      }
    })
  }


  async getClinics() {
    try {
      let res = await this.mainService.getClinics().toPromise();
      this.clinicsList = res;
      setTimeout(() => {
        // this.form.selectedClinic = this.clinicsList[0];
      }, 1000);
    }
    catch { }
  }

  async getUsers() {
    let res: any = await this.userService.getAllUsers().toPromise();
    this.doctorList = res.filter(x => x.roleId == 9);
    this.doctorList.forEach(user => {
      user.name = user.firstName + ' ' + user.lastName;
    });
    // this.form.selectedDoctor = this.doctorList[0];
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
