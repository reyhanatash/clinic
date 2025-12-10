import { Component } from '@angular/core';
import { TableModule } from "primeng/table";
import { InvoiceService } from '../../../_services/invoice.service';
import { CommonModule } from '@angular/common';
import { DropdownModule } from "primeng/dropdown";
import { MainService } from '../../../_services/main.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SharedModule } from '../../../share/shared.module';
import { DialogModule } from 'primeng/dialog';
import moment from 'moment-jalaali';
import { FormControl } from '@angular/forms';
import { InputMaskModule } from 'primeng/inputmask';
import { ObjectService } from '../../../_services/store.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [TableModule, CommonModule, DropdownModule, FormsModule, SelectButtonModule, SharedModule, DialogModule, InputMaskModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css'
})
export class ExpensesComponent {
  expensesList: any;
  showAddExpense: any;
  clinicsList: any;
  selectedClinic: any;
  newExpense: any = [];
  expenseStatus: any[] = [{ label: 'بله', value: '1' }, { label: 'خیر', value: '0' }];
  selectedDatefrom: any;
  allowedLinks: any = [];

  constructor(
    private invoiceService: InvoiceService,
    private mainService: MainService,
    private toastR: ToastrService,
    private objectService: ObjectService
  ) { }

  async ngOnInit() {
    this.selectedDatefrom = new FormControl(moment().format('jYYYY/jMM/jDD'));
    this.allowedLinks = await this.objectService.getDataAccess();
    if (this.checkAccess(1)) {
      await this.getClinics();
      this.getExpenses();
    } else {
      this.toastR.error("شما دسترسی به این صفحه ندارید");
    }
  }


  async getExpenses() {
    let res: any = await this.invoiceService.getExpenses().toPromise();
    if (res.length > 0) {
      this.expensesList = res;
    }
  }

  async saveExpense() {
    let model = {
      "expenseNo": "string",
      "businessId": this.newExpense.selectedclinic.id,
      "expenseDate": this.newExpense.date,
      "vendor": this.newExpense.seller,
      "category": this.newExpense.group,
      "amount": this.newExpense.amount,
      "tax": 0,
      "notes": this.newExpense.note,
      "editOrNew": this.newExpense.id
    }
    try {
      let res: any = await this.invoiceService.saveExpenses(model).toPromise();
      if (res.status == 0) {
        this.toastR.success('با موفقیت ثبت شد');
        this.showAddExpense = false;
        this.newExpense = [];
        this.getExpenses()
      }
    }
    catch { }
  }

  async getClinics() {
    try {
      let res = await this.mainService.getClinics().toPromise();
      this.clinicsList = res;
      this.clinicsList.forEach((clinic: any) => {
        clinic.code = clinic.id;
      });
      this.selectedClinic = this.clinicsList[0];
    }
    catch {
      this.toastR.error('خطا!', 'خطا در دریافت اطلاعات')
    }
  }

  showNewExpense() {
    this.newExpense = [];
    this.showAddExpense = true;
    this.newExpense.id = -1;
  }

  editExpense(expense: any) {
    this.newExpense.selectedclinic = this.clinicsList.filter((clinic: any) => clinic.id == expense.businessId)[0];
    this.newExpense.date
    this.newExpense.seller = expense.vendor;
    this.newExpense.group = expense.category;
    this.newExpense.amount = expense.amount;
    this.newExpense.note = expense.notes;
    this.newExpense.id = expense.id;
    this.showAddExpense = true;

  }

  checkAccess(id) {
    if (this.allowedLinks?.length > 0) {
      const item = this.allowedLinks.find(x => x.id === id);
      return item.clicked;
    } else {
      return false
    }
  }

  async deleteExpense(expense: any) {
    Swal.fire({
      title: "آیا از حذف این هزینه مطمئن هستید ؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      try {
        let res: any = await this.invoiceService.deleteExpense(expense.id).toPromise();
        if (res.status == 0) {
          this.toastR.success('با موفقیت حذف شد');
          this.getExpenses();
        }
      }
      catch { }
    })
  }

}
