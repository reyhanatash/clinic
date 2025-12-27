import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../share/shared.module';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-treatment-template',
  standalone: true,
  imports: [SharedModule,FormsModule],
  templateUrl: './treatment-template.component.html',
  styleUrl: './treatment-template.component.css'
})
export class TreatmentTemplateComponent implements OnInit {

  constructor() { }

  model: any = [];
  showBox = false;
  defaultClosed = false;
  horizontalDisplay = false;
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


  ngOnInit() {

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
  }

}
