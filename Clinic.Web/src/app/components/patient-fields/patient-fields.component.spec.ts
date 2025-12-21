import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientFieldsComponent } from './patient-fields.component';

describe('PatientFieldsComponent', () => {
  let component: PatientFieldsComponent;
  let fixture: ComponentFixture<PatientFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientFieldsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
