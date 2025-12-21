import { Component, OnInit } from '@angular/core';
import { InvoiceService } from '../../_services/invoice.service';
import { SharedModule } from '../../share/shared.module';
import { Router, RouterLink } from "@angular/router";
import { ObjectService } from '../../_services/store.service';

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
    private router: Router,
    private objectService: ObjectService
  ) { }

  InvoiceList: any = [];
  allowedLinks: any = [];

  async ngOnInit() {

    this.allowedLinks = await this.objectService.getDataAccess();
    if (this.checkAccess(1)) {
      this.getInvoices()
    }
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

  goToEditPage(item, type) {
    this.router.navigate(['/new-invoice', item.id, item.patientId, "n", "n", type]);
  }


  checkAccess(id) {
    if (this.allowedLinks?.length > 0) {
      const item = this.allowedLinks.find(x => x.id === id);
      return item.clicked;
    } else {
      return false
    }
  }
}
