import { Component } from '@angular/core';
import { PatientService } from '../../_services/patient.service';
import { ToastrService } from 'ngx-toastr';
import { UtilService } from '../../_services/util.service';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from "primeng/table";
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../share/shared.module';
import { environment } from '../../../environments/environment';
import swal from 'sweetalert2';
import { ObjectService } from '../../_services/store.service';

export const ValidFormat = ['pdf', 'jpg', 'jpeg', 'png'];

@Component({
  selector: 'app-patient-attachment',
  standalone: true,
  imports: [TableModule, CommonModule, SharedModule],
  templateUrl: './patient-attachment.component.html',
  styleUrl: './patient-attachment.component.css'
})
export class PatientAttachmentComponent {
  fileToUpload: any;
  base64: any;
  fileName: any;
  fileType: any;
  patientId: string;
  patientAttachmentList: any;
  server: any;
  attachmentAccess: any = [];

  constructor(
    private patientService: PatientService,
    private toastR: ToastrService,
    private utilService: UtilService,
    private activeRoute: ActivatedRoute,
    private objectService: ObjectService
  ) {
    this.server = environment.url;
  }

  ngOnInit() {
    this.patientId = this.activeRoute.snapshot.paramMap.get('id');
    this.getAttachmentAccess();
  }


  handleFileInput(files: any) {
    let size = files[0].size;
    let type = files[0]['name'].split('.').pop();
    if (!ValidFormat.includes(type.toLowerCase())) {
      this.toastR.error("فرمت وارد شده معتبر نمی باشد.", "خطا");
      return;
    }
    if (size > 5000000) {
      this.toastR.error("حداکثر سایز فایل 5 مگابایت می باشد", "خطا");
      return;
    }
    this.fileToUpload = files.item(0);
    this.utilService.getBase64(files.item(0)).then((data) => {
      let base: any = data;
      this.base64 = base.split(',')[1];

      this.fileName = this.fileToUpload['name'];
      this.fileType = this.fileToUpload['name'].split('.').pop();
    });
  }

  async saveAttachment() {
    let model = {
      patientId: this.patientId,
      fileName: this.fileName,
      base64: this.base64,
      editOrNew: -1
    }
    let res: any = await this.patientService.saveAttachment(model).toPromise();
    if (res['status'] == 0) {
      this.toastR.success('با موفقیت ثبت شد');
      this.getAttachment();
      this.fileName = '';
      this.fileType = '';
      this.fileToUpload = null;
      this.base64 = null;
    }
  }

  async getAttachment() {
    try {
      let res: any = await this.patientService.getAttachment(this.patientId).toPromise();
      if (res.length > 0) {
        this.patientAttachmentList = res;
        this.patientAttachmentList.forEach(attachment => {
          attachment.fileName = this.server + attachment.fileName;
          if (attachment.fileName.toLowerCase().endsWith('.jpg')) {
            attachment.fileType = 1;
          }
          else {
            attachment.fileType = 0;
          }
        });
      }
    }
    catch {
      this.toastR.error('خطا!', 'خطا در دریافت اطلاعات')
    }
  }

  async deleteAttachment(id) {
    swal.fire({
      title: "آیا از حذف این پیوست مطمئن هستید ؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      try {
        let res: any = await this.patientService.deleteAttachment(id).toPromise();
        if (res['status'] == 0) {
          this.toastR.success('با موفقیت حذف گردید');
          this.getAttachment();
        }
      }
      catch {
        this.toastR.error('خطایی رخ داد', 'خطا!');
      }
    })
  }

  removeFile(event) {
    event.stopPropagation();
    this.fileName = '';
    this.fileType = '';
    this.fileToUpload = null;
    this.base64 = null;
  }

  getAttachmentAccess() {
    let accessList: any = this.objectService.getItemAccess();
    let item = accessList.filter(x => x.id == 4);
    this.attachmentAccess = item[0]['itmes'];
    if (item[0]['itmes'][0]['clicked']) {
      this.getAttachment();
    }
  }

  checkAttachmentAccess(id) {
    const item = this.attachmentAccess.find(x => x.id === id);
    return item ? item.clicked : false;
  }
}
