namespace Clinic.Api.Application.DTOs.Main
{
    public class UpdateGeneralSettingsDto
    {
        public int Id { get; set; }
        public string? CompanyName { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public bool PractitionerCanOnlyReadLettersTheyAuthoredThemselves { get; set; }
        public bool PractitionerCannotSeeAnyFinancialDetails { get; set; }
        public bool ReceptionistsCanOnlyReadLettersTheyAuthoredThemselves { get; set; }
        public bool ReceptionistsCanViewFileAttachment { get; set; }
        public int TimeSlotHeight { get; set; }
        public bool MultipleAppointments { get; set; }
        public bool ShowCurrentTimeIndicator { get; set; }
        public string? EmailFrom { get; set; }
        public int? ModifierId { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? LastUpdated { get; set; }
        public string? Logo { get; set; }
        public bool EmailOnAppointment { get; set; }
        public bool BirthDateOnAppointment { get; set; }
        public bool Insurer1OnAppointment { get; set; }
        public bool Insurer2OnAppointment { get; set; }
        public bool Referr1OnAppointment { get; set; }
        public bool Referr2OnAppointment { get; set; }
        public string? Address { get; set; }
        public string? Address2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostCode { get; set; }
        public string? WebSiteAddress { get; set; }
        public string? InfoEmail { get; set; }
        public string? ContactInformation { get; set; }
        public string? Location { get; set; }
        public int? Zoom { get; set; }
        public bool SetPayableAmountInNewPaymentCash { get; set; }
        public bool DisallowOutOfTurnWhenHaveTime { get; set; }
        public bool CheckInvoiceDateByPractitionerSchedule { get; set; }
        public int PatientCodeStartFrom { get; set; }
        public bool SetReceivebleAmountInNewReceiptBank { get; set; }
        public int? CreatorId { get; set; }
        public string? HolidayColor { get; set; }
        public string? EmptyDayColor { get; set; }
        public string? FullDayColor { get; set; }
        public string? NotFullDayColor { get; set; }
        public bool? ShowPatientNotes { get; set; }
    }
}
