import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  url = environment.url;
  token: any = localStorage.getItem("token");

  constructor(
    private http: HttpClient,

  ) { }


  getPatients() {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Patient/getPatients`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  savePatient(data) {
    const uri = this.url + `api/Patient/savePatient`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
        responseType: 'text'
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  savePatientPhone(data) {
    const uri = this.url + `api/Patient/savePatientPhone`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
        responseType: 'text'
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  getPatientPhone(patientId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Patient/getPatientPhone/${patientId}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  deletePatient(patientId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Patient/deletePatient/` + patientId;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  deletePatientPhone(patientId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Patient/deletePatientPhone/` + patientId;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  getPatientAppointments(patientId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Patient/getPatientAppointments/` + patientId;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  getPatientById(patientId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Patient/getPatientById/` + patientId;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }


  saveAttachment(data) {
    const uri = this.url + `api/Patient/saveAttachment`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
        responseType: 'text'
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  getAttachment(patientId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Patient/getAttachment/` + patientId;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }


  getPatientReceipts(patientId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Patient/getPatientReceipts/` + patientId;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }
  deleteAttachment(patientId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Patient/deleteAttachment/` + patientId;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  getPatientPayments(patientId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Patient/getPatientPayments/` + patientId;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  getPatientInvoices(patientId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Patient/getPatientInvoices/` + patientId;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  getFilteredPatient(data) {
    const uri = this.url + `api/Patient/getFilteredPatient`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
        responseType: 'text'
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  savePatientFields(data: any) {
    const uri = this.url + `api/Patient/savePatientField`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
        responseType: 'text'
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  getPatientFields() {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Patient/getPatientFields/`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

}
