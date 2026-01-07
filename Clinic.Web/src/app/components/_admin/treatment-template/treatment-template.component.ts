import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../share/shared.module';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { TreatmentsService } from '../../../_services/treatments.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { MainService } from './../../../_services/main.service';
import Swal from 'sweetalert2';
import { QuestionService } from '../../../_services/question.service';

@Component({
  selector: 'app-treatment-template',
  standalone: true,
  imports: [SharedModule, FormsModule],
  templateUrl: './treatment-template.component.html',
  styleUrl: './treatment-template.component.css'
})
export class TreatmentTemplateComponent implements OnInit {

  constructor(
    private treatmentsService: TreatmentsService,
    private toastR: ToastrService,
    private activeRoute: ActivatedRoute,
    private mainService: MainService,
    private router: Router,
    private questionService: QuestionService
  ) { }

  model: any = [];
  showBox = false;
  showNewQuestionBox = false;
  questionType = [
    "Check",
    "Text",
    "Multi select",
    "Paragraph",
    "Combo",
    "Label",
    "Radio",
    "check Text",
    "textCombo",
    "Editor",
  ];
  editOrNewTemplate: any;
  editOrNewSection: any = -1;
  sectionsList: any = [];
  questionsPerSectionList: any = [];
  questionModel: any = [];
  editOrNewQuestion: any = -1;
  questionAnswerModal = false;
  answersPerQuestion: any = [];
  editOrNewQuestionAnswer: any = -1;
  questionId: any;
  titleQuestionAnswer = '';

  ngOnInit() {
    this.editOrNewTemplate = +this.activeRoute.snapshot.paramMap.get('id') || -1;
    if (this.editOrNewTemplate != -1) {
      this.getTreatmentTemplate();
      this.getSections();
    }

  }

  async getTreatmentTemplate() {
    try {
      let model = {
        id: this.editOrNewTemplate
      }
      let res: any = await this.treatmentsService.getTreatmentTemplates(model).toPromise();
      this.model.name = res[0]['name'];
      this.model.printTemplate = res[0]['printTemplate'];
      this.model.ordering = res[0]['ordering'];
    }
    catch { }
  }


  toggleBox() {
    this.showBox = true;
    this.showNewQuestionBox = false;
  }

  closeBox() {
    this.showBox = false;
  }

  addNewQuestion() {
    this.showNewQuestionBox = true;
    this.editOrNewQuestion = -1;
  }


  async saveTreatmentTemplate() {
    let model = {
      name: this.model.name,
      templateNotes: null,
      title: null,
      showPatientBirthDate: false,
      showPatientReferenceNumber: false,
      printTemplate: this.model.printTemplate,
      ordering: this.model.ordering,
      editOrNew: this.editOrNewTemplate
    }
    try {
      let res: any = await firstValueFrom(this.treatmentsService.saveTreatmentTemplate(model));
      if (res.status == 0) {
        this.toastR.success('با موفقیت ثبت شد!');
        if (this.editOrNewTemplate == -1) {
          this.editOrNewTemplate = res.data
          this.router.navigate(['/treatment-template/' + this.editOrNewTemplate]);
          this.getTreatmentTemplate();
          this.getSections();
        }
      } else {
        this.toastR.error('خطایی رخ داده است');
      }
    } catch (error) {
      this.toastR.error('خطایی رخ داده است');
    }
  }

  async getSections() {
    let model = {
      "id": this.editOrNewTemplate
      // "id": null
    }
    let res: any = await firstValueFrom(this.mainService.getSections(model));
    this.sectionsList = res;
  }

  async saveSection() {
    let model = {
      treatmentTemplateId: this.editOrNewTemplate,
      title: this.model.groupTitle,
      defaultClose: this.model.defaultClose,
      order: null,
      isDeleted: false,
      horizontalDirection: this.model.horizontalDisplay,
      editOrNew: this.editOrNewSection
    }
    try {
      let res: any = await firstValueFrom(this.mainService.saveSection(model));
      if (res.status == 0) {
        this.toastR.success('با موفقیت ثبت شد!');
        this.showBox = false;
        this.getSections();
        this.editOrNewSection = res.data;
        this.model = [];
      } else {
        this.toastR.error('خطایی رخ داده است');
      }
    } catch (error) {
      this.toastR.error('خطایی رخ داده است');
    }
  }

  selectedSection(id) {
    this.editOrNewSection = id;
    this.questionModel = [];
    this.showNewQuestionBox = false;
    this.editOrNewQuestion = -1;
    this.getSectionPerService();
  }


  async deleteSection(id) {
    Swal.fire({
      title: "آیا از حذف این گروه مطمئن هستید ؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      try {
        if (result.value) {
          let res: any = await this.mainService.deleteSection(id).toPromise();
          if (res.status == 0) {
            this.toastR.success("با موفقیت حذف شد!");
            this.getSections();
          }
        }
      }
      catch { }
    })
  }

  editSection(item) {
    this.editOrNewSection = item.id;
    this.model.groupTitle = item.title;
    this.model.defaultClose = item.defaultClose;
    this.model.horizontalDisplay = item.horizontalDirection;
    this.showBox = true;
  }


  async getSectionPerService() {
    this.questionsPerSectionList = [];
    this.treatmentsService.getQuestionsPerSection(this.editOrNewSection).subscribe((res: any) => {
      this.questionsPerSectionList = res;
    });
  }

  async saveQuestion() {
    let model = {
      title: this.questionModel.title,
      type: this.questionModel.type,
      normalAnswer: this.questionModel.normalAnswer,
      "defaultAnswer": null,
      "masterId": null,
      "refId": null,
      "order": null,
      isDeleted: false,
      sectionId: this.editOrNewSection,
      canCopy: this.questionModel.canCopy,
      canFocusEnd: this.questionModel.canFocusEnd,
      editOrNew: this.editOrNewQuestion
    }
    try {
      await this.questionService.saveQuestion(model).toPromise();
      this.questionModel = [];
      this.showNewQuestionBox = false;
      this.editOrNewQuestion = -1;
      this.getSectionPerService();
    } catch (error) {
      this.toastR.error('خطا!', 'خطا در ثبت ')
    }
  }

  editQuestion(item) {
    this.editOrNewQuestion = item.id;
    this.questionModel.title = item.title;
    this.questionModel.type = item.type;
    this.questionModel.normalAnswer = item.normalAnswer;
    this.questionModel.canCopy = item.canCopy;
    this.questionModel.canFocusEnd = item.canFocusEnd;
    this.showNewQuestionBox = true;
  }

  async deleteQuestion(id) {
    Swal.fire({
      title: "آیا از حذف این سوال مطمئن هستید ؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      try {
        if (result.value) {
          let res: any = await this.questionService.deleteQuestion(id).toPromise();
          if (res.status == 0) {
            this.toastR.success("با موفقیت حذف شد!");
            this.getSectionPerService();
          }
        }
      }
      catch { }
    })
  }

  showQuestionAnswerModal(id) {
    this.treatmentsService.getAnswersPerQuestion(id).subscribe((data: any) => {
      this.answersPerQuestion = data;
    });
    this.questionId = id;
    this.titleQuestionAnswer = '';
    this.questionAnswerModal = true;
  }

  async saveQuestionAnswer() {
    let model = {
      "title": this.titleQuestionAnswer,
      "text": null,
      "refTitle": null,
      "order": null,
      "isDeleted": false,
      "question_Id": this.questionId,
      "editOrNew": this.editOrNewQuestionAnswer
    }
    try {
      let res: any = await firstValueFrom(this.treatmentsService.saveQuestionAnswer(model));
      if (res.status == 0) {
        this.editOrNewQuestionAnswer = -1;
        this.titleQuestionAnswer = '';
        this.toastR.success('با موفقیت ثبت شد!');
        this.treatmentsService.getAnswersPerQuestion(this.questionId).subscribe((data: any) => {
          this.answersPerQuestion = data;
        });
      } else {
        this.toastR.error('خطایی رخ داده است');
      }
    } catch (error) {
      this.toastR.error('خطایی رخ داده است');
    }
  }

  editQuestionAnswer(item) {
    this.titleQuestionAnswer = item.title;
    this.editOrNewQuestionAnswer = item.id;
  }

  async deleteQuestionAnswer(id) {
    Swal.fire({
      title: "آیا از حذف این جواب سوال مطمئن هستید ؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله انجام بده",
      cancelButtonText: "منصرف شدم",
      reverseButtons: false,
    }).then(async (result) => {
      try {
        if (result.value) {
          let res: any = await this.treatmentsService.deleteQuestionAnswer(id).toPromise();
          if (res.status == 0) {
            this.toastR.success("با موفقیت حذف شد!");
            this.treatmentsService.getAnswersPerQuestion(this.questionId).subscribe((data: any) => {
              this.answersPerQuestion = data;
            });
          }
        }
      }
      catch { }
    })
  }

}
