import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  url = environment.url;
  token: any = localStorage.getItem("token");
  constructor(
    private http: HttpClient,
  ) { }

  login(data: any) {
    const uri = this.url + "api/user/login";
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  changePassword(data: any) {
    const uri = this.url + "api/user/forgotPassword";
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  getDoctors() {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/User/getUsers/2`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  getAllUsers() {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/User/getAllUsers`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  createUser(data) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + "api/user/createUser";
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  getRoles() {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/User/getRoles`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  deleteUser(id) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/User/deleteUser/` + id;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  saveUserRole(data) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + "api/user/saveUserRole";
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  getUserById(id) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/User/getUserById/` + id;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  updateUser(data) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + "api/user/updateUser";
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.put(uri, data, httpOptions);
  }

  getUserRole() {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/User/getUserRole`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

}
