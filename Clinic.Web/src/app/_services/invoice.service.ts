import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(
    private http: HttpClient
  ) { }

  url = environment.url;
  token: any = localStorage.getItem("token");

  getInvoices() {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Invoice/getInvoices`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  saveInvoice(data) {
    const uri = this.url + `api/Invoice/saveInvoice`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
        responseType: 'text'
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  saveInvoiceItem(data) {
    const uri = this.url + `api/Invoice/saveInvoiceItem`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
        responseType: 'text'
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  saveReceipt(data) {
    const uri = this.url + `api/Invoice/saveReceipt`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
        responseType: 'text'
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }

  getReceipts() {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Invoice/getReceipts`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  getInvoiceItems(invoiceId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Invoice/getInvoiceItems/${invoiceId}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }
  deleteReceipt(id) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Invoice/deleteReceipt/${id}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }


  deleteInvoiceItem(id) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Invoice/deleteInvoiceItem/${id}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  getExpenses() {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Invoice/getExpenses`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  saveExpenses(data) {
    const uri = this.url + `api/Invoice/saveExpense`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
        responseType: 'text'
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }


  saveInvoiceDiscount(data) {
    const uri = this.url + `api/Invoice/saveInvoiceDiscount`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
        responseType: 'text'
      }),
    };
    return this.http.post(uri, data, httpOptions);
  }


  getInvoiceDetails(appointmentId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Invoice/getInvoiceDetails/${appointmentId}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  cancelInvoice(invoiceId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Invoice/cancelInvoice/${invoiceId}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  approveDiscount(invoiceId) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Invoice/approveDiscount/${invoiceId}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }

  invoiceItemIsDone(invoiceItemId, isDone) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Invoice/invoiceItemIsDone/${invoiceItemId}/${isDone}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }
  
  deleteExpense(id: any) {
    const token: any = localStorage.getItem("token");
    const uri = this.url + `api/Invoice/deleteExpense/${id}`;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    };
    return this.http.get(uri, httpOptions);
  }
}
