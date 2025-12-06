import { Component, OnInit } from '@angular/core';
import { InvoiceService } from '../../_services/invoice.service';
import { SharedModule } from '../../share/shared.module';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [SharedModule, RouterLink],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.css'
})
export class InvoiceListComponent implements OnInit {

  constructor(
    private InvoiceService: InvoiceService,
    private router: Router
  ) { }

  InvoiceList: any = [];

  ngOnInit(): void {
    this.getInvoices()
  }

  async getInvoices() {
    try {
      let res: any = await this.InvoiceService.getInvoices().toPromise();
      this.InvoiceList = res;
      this.InvoiceList.sort((a, b) =>
       new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
      )
    }
    catch { }

  }

  goToEditPage(id, type) {
    this.router.navigate(['/new-invoice', id, "n", "n", "n", type]);
  }
}
