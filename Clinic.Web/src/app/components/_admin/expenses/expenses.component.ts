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

  constructor(
    private invoiceService: InvoiceService,
    private mainService: MainService,
    private toastR: ToastrService,
    private objectService: ObjectService
  ) { }

  async ngOnInit() {
    this.selectedDatefrom = new FormControl(moment().format('jYYYY/jMM/jDD'));
    if(this.checkAccess(1)){
      await this.getClinics();
      this.getExpenses();
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

  editExpense(expense) {
    this.newExpense.selectedclinic = this.clinicsList.filter(clinic => clinic.id == expense.businessId)[0];
    this.newExpense.date
    this.newExpense.seller = expense.vendor;
    this.newExpense.group = expense.category;
    this.newExpense.amount = expense.amount;
    this.newExpense.note = expense.notes;
    this.newExpense.id = expense.id;
    this.showAddExpense = true;

  }
  
  checkAccess(id) {
   return this.objectService.checkAccess(id);
  }

}