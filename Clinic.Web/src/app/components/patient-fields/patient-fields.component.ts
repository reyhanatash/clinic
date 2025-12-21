import { Component } from '@angular/core';
import { PatientService } from '../../_services/patient.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-patient-fields',
  standalone: true,
  imports: [FormsModule, CommonModule, DropdownModule],
  templateUrl: './patient-fields.component.html',
  styleUrl: './patient-fields.component.css'
})
export class PatientFieldsComponent {

  patient: any = [];

  fieldStatus: any = [
    { code: 1, name: "غیر اجباری" },
    { code: 2, name: "اجباری" },
    { code: 3, name: "غیر قابل مشاهده" },
  ]

  constructor(
    private patientService: PatientService,
    private toastR: ToastrService
  ) { }

  async savePatientFields() {
    let model: any = {
      "titleId": this.patient.title['code'],
      "gender": this.patient.gender['code'],
      "fatherName": this.patient.fatherName['code'],
      "birthDate": this.patient.birthDate['code'],
      "relatedPatients": this.patient.relatedPatients['code'],
      "patientPhones": this.patient.patientPhones['code'],
      "email": this.patient.email['code'],
      "address1": this.patient.address1['code'],
      "address2": this.patient.address2['code'],
      "address3": this.patient.address3['code'],
      "city": this.patient.city['code'],
      "state": 0,
      "postCode": this.patient.postCode['code'],
      "countryId": 0,
      "reminderTypeId": 0,
      "unsubscribeFromSMSMarketing": 0,
      "receiveBookingConfirmationEmails": 0,
      "invoiceTo": 0,
      "emailInvoiceTo": 0,
      "invoiceExtraInformation": 0,
      "jobId": this.patient.jobId['code'],
      "emergencyContact": this.patient.emergencyContact['code'],
      "referenceNumber": 0,
      "referringDoctorId": 0,
      "notes": this.patient.notes['code'],
      "referringInsurerId": this.patient.referringInsurerId['code'],
      "referringInsurer2Id": this.patient.referringInsurer2Id['code'],
      "referringInpatientInsurerId": this.patient.referringInpatientInsurerId['code'],
      "referringContactId": this.patient.referringContactId['code'],
      "referringContact2Id": this.patient.referringContact2Id['code'],
      "referringPatientId": this.patient.referringPatientId['code'],
      "nationalCode": this.patient.nationalCode['code'],
      "editOrNew": -1
    };
    try {
      let res: any = await this.patientService.savePatientFields(model).toPromise();
      if (res['status'] == 0) {
        this.toastR.success("با موفقیت ثبت شد!");
        this.patient = [];
      }
    }
    catch { }
  }
}
