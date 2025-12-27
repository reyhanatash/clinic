import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TreatmentsService {

  constructor(
    private http: HttpClient
  ) { }

  url = environment.url;
  token: any = localStorage.getItem("token");

  getTodayAppointments(data: any) {
    const uri = this.url + `api/Treatment/getTodayAppointments`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  getBillableItems() {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Treatment/getBillableItems`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  getWeeklyAppointments(data) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Treatment/getWeeklyAppointments`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }


  getAppointments(data: any) {
    const uri = this.url + `api/Treatment/getAppointments`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  createAppointment(data: any) {
    const uri = this.url + `api/Treatment/createAppointment`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }


  getAppointmentTypes() {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/treatment/getAppointmentTypes`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }


  getPatientServices(patientId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/treatment/getPatientServices/${patientId}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  getSectionPerService(serviceId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/treatment/getSectionPerService/${serviceId}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  getQuestionsPerSection(sectionId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/treatment/getQuestionsPerSection/${sectionId}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  getAnswersPerQuestion(questionId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/treatment/getAnswersPerQuestion/${questionId}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }


  getPatientTreatments(patientId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/treatment/getPatientTreatments/${patientId}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  deleteBillableItem(id) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/treatment/deleteBillableItem/${id}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  saveBillableItem(data: any) {
    const uri = this.url + `api/Treatment/saveBillableItem`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  getItemCategory() {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/treatment/getItemCategory`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }
  savePatientArrived(appointmentId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/treatment/savePatientArrived/` + appointmentId;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  getTreatmentTemplates(data) {
    const uri = this.url + `api/Treatment/getTreatmentTemplates`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  deleteItemCategory(id) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/treatment/deleteItemCategory/${id}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }


  saveItemCategory(data: any) {
    const uri = this.url + `api/Treatment/saveItemCategory`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  saveAppointmentType(data) {
    const uri = this.url + `api/Treatment/saveAppointmentType`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  deleteAppointmentType(id) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/treatment/deleteAppointmentType/${id}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  cancelAppointment(appointmentId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/treatment/cancelAppointment/${appointmentId}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

   saveTreatmentTemplate(data) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/treatment/saveTreatmentTemplate`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.post(uri,data , httpOptions);
  }

    deleteTreatmentTemplate(id) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/treatment/deleteTreatmentTemplate/${id}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }
}
