import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';
import { Marker, icon, marker } from 'leaflet';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { SharedModule } from '../../../../share/shared.module';
import { TreatmentsService } from '../../../../_services/treatments.service';
import { MainService } from '../../../../_services/main.service';


@Component({
  selector: 'app-new-business',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './new-business.component.html',
  styleUrl: './new-business.component.css'
})
export class NewBusinessComponent implements AfterViewInit {

  constructor(
    private treatmentsService: TreatmentsService,
    private activeRoute: ActivatedRoute,
    private mainService: MainService,
    private toastR: ToastrService,
    private router: Router

  ) { }

  model: any = [];
  servicesList: any = [];
  editOrNew: number;
  async ngAfterViewInit(): Promise<void> {
    this.editOrNew = +this.activeRoute.snapshot.paramMap.get('id') || -1;
    this.getBillableItems();
    let location = [35.6892, 51.3890];
    if (this.editOrNew != -1) {
      await this.getBusinesses();
      location = this.model.locationString ? this.model.locationString.split(',') : [35.6892, 51.3890];
    } else {
      this.model.locationString = '';
    }
    let customIcon = icon({
      iconUrl: '../../../../assets/images/marker-icon.png',
      shadowUrl: '../../../../assets/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [13, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const map = L.map('map').setView([location[0], location[1]], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: true
    }).addTo(map);
    let markerLayer: L.Marker | null = null;

    if (this.editOrNew != -1) {
      markerLayer = marker([location[0], location[1]], { icon: customIcon }).addTo(map);
    }

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.model.locationString = `${lat.toFixed(6)},${lng.toFixed(6)}`;
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });
      markerLayer = marker([lat, lng], { icon: customIcon }).addTo(map);
    });

    geocoder.on('markgeocode', function (e: any) {
      const center = e.geocode.center;
      L.marker(center, { icon: customIcon }).addTo(map);
      map.setView(center, 15);
    });

  }

  async getBillableItems() {
    try {
      let res = await this.treatmentsService.getBillableItems().toPromise();
      this.servicesList = res;
      this.servicesList.forEach((item: any) => {
        item.code = item.id;
      });
    }
    catch { }
  }


  async saveBusiness() {
    let model =
    {
      name: this.model.name,
      address: this.model.address,
      address2: this.model.address2,
      city: this.model.city,
      "state": null,
      postCode: this.model.postCode,
      "countryId": null,
      contactInformation: this.model.contactInformation,
      displayInOnlineBooking: this.model.displayInOnlineBooking,
      location: this.model.locationString,
      "zoom": null,
      infoEmail: this.model.infoEmail,
      isServiceBase: this.model.isServiceBase,
      showInvoiceInRecord: this.model.showInvoiceInRecord,
      checkScheduleOnInvoice: this.model.checkScheduleOnInvoice,
      isInPatient: this.model.isInPatient,
      smsEnabled: this.model.smsEnabled,
      appointmentByOutOfRange: this.model.appointmentByOutOfRange,
      serviceId: this.model.selectedServices ? (this.model.selectedServices || []).map(opt => opt.id).join(',') : null,
      editOrNew: this.editOrNew
    }
    try {
      let res: any = await firstValueFrom(this.mainService.saveBusiness(model));
      if (res.status == 0) {
        this.toastR.success('با موفقیت ثبت شد!');
        this.router.navigate(['/business-List']);
      } else {
        this.toastR.error('خطایی رخ داده است');
      }
    } catch (error) {
      this.toastR.error('خطایی رخ داده است');
    }
  }

  async getBusinesses() {
    try {
      let res: any = await this.mainService.getBusinesses().toPromise();
      let item = res.filter(x => x.id == this.editOrNew);
      this.model.name = item[0]['name'];
      this.model.address = item[0]['address'];
      this.model.address2 = item[0]['address2'];
      this.model.city = item[0]['city'];
      this.model.postCode = item[0]['postCode'];
      this.model.contactInformation = item[0]['contactInformation'];
      this.model.displayInOnlineBooking = item[0]['displayInOnlineBooking'];
      this.model.locationString = item[0]['location'];
      this.model.infoEmail = item[0]['infoEmail'];
      this.model.isServiceBase = item[0]['isServiceBase'];
      this.model.showInvoiceInRecord = item[0]['showInvoiceInRecord'];
      this.model.checkScheduleOnInvoice = item[0]['checkScheduleOnInvoice'];
      this.model.isInPatient = item[0]['isInPatient'];
      this.model.smsEnabled = item[0]['smsEnabled'];
      this.model.appointmentByOutOfRange = item[0]['appointmentByOutOfRange'];
      if (item[0]['services']?.length > 0) {
        this.model.selectedServices = [];
        item[0]['services'].forEach(element => {
          let temp = this.servicesList.filter(x => x.id == element.billableItemId)[0];
          this.model.selectedServices.push(temp);
        });
      }
    }
    catch { }
  }


}
