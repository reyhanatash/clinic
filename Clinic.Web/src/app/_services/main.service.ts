import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MainService {

  constructor(
    private http: HttpClient
  ) { }

  url = environment.url;
  token: any = localStorage.getItem("token");

  getJobs() {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/main/getJobs`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }



  getCountries() {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Main/getCountries`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  getProducts() {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Main/getProducts`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  saveProduct(data) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Main/saveProduct`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        responseType: 'text'
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }
  deleteProduct(productId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Main/deleteProduct/${productId}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  getClinics() {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/main/getClinics`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  saveNote(data) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Main/saveNote`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        responseType: 'text'
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  getNotes(id) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/main/getNotes/` + id;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  deleteNote(id) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/main/deleteNote/` + id;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  saveDoctorSchedule(data) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Main/saveDoctorSchedule`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  getDoctorSchedules(userId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/main/getDoctorSchedules/` + userId;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  getDoctorSchedulesForDoctor() {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/main/getDoctorSchedules`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  getUserAppointmentsSettings(model) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/main/getUserAppointmentsSettings`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.post(uri, model, httpOptions);
  }


  saveUserAppointmentsSettings(data) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Main/saveUserAppointmentsSettings`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        responseType: 'text'
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  saveBusiness(data) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Main/saveBusiness`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        responseType: 'text'
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  getBusinesses() {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/main/getBusinesses`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  deleteBusiness(businessId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/main/deleteBusiness/${businessId}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  deleteDoctorSchedule(scheduleId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/main/deleteDoctorSchedule/${scheduleId}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  saveTimeException(data) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Main/saveTimeException`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        responseType: 'text'
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  getTimeException(scheduleId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/main/getTimeException`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  getOutOfTurnExceptions() {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/main/getOutOfTurnExceptions`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  deleteOutOfTurnException(id) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/main/deleteOutOfTurnException/${id}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  saveOutOfTurnException(data) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Main/saveOutOfTurnException`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        responseType: 'text'
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }


}
