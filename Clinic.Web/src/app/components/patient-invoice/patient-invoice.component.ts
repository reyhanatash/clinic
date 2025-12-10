import { Component } from '@angular/core';
import { PatientService } from '../../_services/patient.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TableModule } from "primeng/table";
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../share/shared.module';
import { MainService } from '../../_services/main.service';
import { ToastrService } from 'ngx-toastr';
import { ObjectService } from '../../_services/store.service';

@Component({
  selector: 'app-patient-invoice',
  standalone: true,
  imports: [TableModule, CommonModule, SharedModule, RouterLink],
  templateUrl: './patient-invoice.component.html',
  styleUrl: './patient-invoice.component.css'
})
export class PatientInvoiceComponent {
  patientId: any;
  invoiceList: any = [];
  clinicsList: any = [];
  selectedClinic: any;
  invoiceAccess: any = [];

  constructor(
    private patientService: PatientService,
    private activeRoute: ActivatedRoute,
    private mainService: MainService,
    private toastR: ToastrService,
    private objectService: ObjectService
  ) { }

  ngOnInit() {
    this.patientId = this.activeRoute.snapshot.paramMap.get('id');
    let accessList: any  = this.objectService.getItemAccess();
    let item = accessList.filter(x => x.id == 6);
    this.invoiceAccess = item[0]['itmes'];
    if (item[0]['itmes'][0]['clicked']) {
      this.getClinics();
      this.getPatientInvoices(this.patientId);
    }
  }


  async getPatientInvoices(patientId) {
    try {
      let res: any = await this.patientService.getPatientInvoices(patientId).toPromise();
      if (res.length > 0) {
        this.invoiceList = res;
        this.invoiceList.forEach(invoice => {
          invoice.clinicName = this.clinicsList.filter(clinic => clinic.id == invoice.businessId)[0].name;
        });
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

  checklInvoiceAccess(id) {
    const item = this.invoiceAccess.find(x => x.id === id);
    return item ? item.clicked : false;
  }
}
