import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NumberSplitPipe, ShamsiFullDatePipe, ShamsiDatePipe, ShamsiFullDateZonePipe,
  ShamsiFullDateZonePipeWithLine, ShamsiFullDateInOneLine, ShamsiFullDateInOneLineZone, JustTimePipe, inputNumberSplitPipe, TextSplit, CourseFilter,
  ShamsiUTCPipe, SafeSRCPipe, NumberSplitPricePipe, JustDatePipe, CustomTimePipe, ShamsiFullDateTicketPipe, ShamsiTimePipe, ConvertTimeSeconds,
  NumberSplitSlashPipe,
  NumberSplitDotPipe,
  ShamsiMonthPipe,
  PriceWithoutTaxPipe,
  JustDateZone
} from './custom.pipe';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { AccordionModule } from 'primeng/accordion';
import { MultiSelectModule } from 'primeng/multiselect';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { DialogModule } from 'primeng/dialog';
import { ImageModule } from 'primeng/image';
import { SelectButtonModule } from 'primeng/selectbutton';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { OnlyNumberDirective } from './only-number.directive';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    NumberSplitPipe,
    PriceWithoutTaxPipe,
    ShamsiFullDatePipe,
    ShamsiFullDateInOneLine,
    ShamsiFullDateInOneLineZone,
    ShamsiFullDateTicketPipe,
    ShamsiDatePipe,
    ShamsiUTCPipe,
    ShamsiFullDateZonePipe,
    ShamsiFullDateZonePipeWithLine,
    ShamsiMonthPipe,
    inputNumberSplitPipe,
    TextSplit,
    CourseFilter,
    JustTimePipe,
    SafeSRCPipe,
    JustDatePipe,
    NumberSplitPricePipe,
    CustomTimePipe,
    ShamsiTimePipe,
    NumberSplitDotPipe,
    NumberSplitSlashPipe,
    ConvertTimeSeconds,
    JustDateZone
  ],
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    DropdownModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMaterialTimepickerModule,
    NgPersianDatepickerModule,
    ReactiveFormsModule,
    AccordionModule,
    MultiSelectModule,
    CKEditorModule,
    DialogModule,
    ImageModule,
    SelectButtonModule,
    LeafletModule,
    OnlyNumberDirective,
    TooltipModule
  ],
  exports: [
    NumberSplitPipe,
    ShamsiFullDatePipe,
    PriceWithoutTaxPipe,
    ShamsiFullDateInOneLine,
    ShamsiFullDateInOneLineZone,
    ShamsiFullDateTicketPipe,
    ShamsiUTCPipe,
    ShamsiDatePipe,
    ShamsiFullDateZonePipe,
    ShamsiFullDateZonePipeWithLine,
    ShamsiMonthPipe,
    CourseFilter,
    SafeSRCPipe,
    JustTimePipe,
    JustDatePipe,
    TextSplit,
    inputNumberSplitPipe,
    NumberSplitPricePipe,
    CustomTimePipe,
    ShamsiTimePipe,
    NumberSplitSlashPipe,
    NumberSplitDotPipe,
    ConvertTimeSeconds,
    JustDateZone,
    TableModule,
    FormsModule,
    DropdownModule,
    MatInputModule,
    MatDatepickerModule,
    NgxMaterialTimepickerModule,
    NgPersianDatepickerModule,
    ReactiveFormsModule,
    CommonModule,
    AccordionModule,
    MultiSelectModule,
    CKEditorModule,
    DialogModule,
    ImageModule,
    SelectButtonModule,
    LeafletModule,
    OnlyNumberDirective,
    TooltipModule
  ]
})
export class SharedModule { }
export { ShamsiUTCPipe };

