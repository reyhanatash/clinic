import { Component } from '@angular/core';
import { MainService } from '../../../_services/main.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.css'
})
export class JobListComponent {

  newJob: any = [];
  jobsList: any = [];

  constructor(
    private mainService: MainService,
    private toastR: ToastrService
  ) { }

  ngOnInit() {
    this.getJobs();
  }

  async saveJob() {
    let model = {
      "name": this.newJob.title,
      "editOrNew": this.newJob.jobId || -1
    }
    try {
      let res: any = await this.mainService.saveJob(model).toPromise();
      if (res.status == 0) {
        this.toastR.success("با موفقیت ذخیره شد!");
        this.newJob = [];
        this.getJobs();
      }
    }
    catch { }
  }

  async getJobs() {
    try {
      let res: any = await this.mainService.getJobs().toPromise();
      if (res.length > 0) {
        this.jobsList = res;
      }
    }
    catch { }
  }

  async deleteJob(id) {
    Swal.fire({
      title: "آیا از حذف این شغل مطمئن هستید ؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      try {
        if (result.value) {
          let res: any = await this.mainService.deleteJob(id).toPromise();
          if (res.status == 0) {
            this.toastR.success("با موفقیت حذف شد!");
            this.getJobs();
          }
        }
      }
      catch { }
    })
  }

  editJob(job) {
    this.newJob.jobId = job.id;
    this.newJob.title = job.name;

  }
}
