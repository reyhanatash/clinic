namespace Clinic.Api.Application.DTOs.Main
{
    public class UpdateGeneralSettingsDto
    {
        public int Id { get; set; }
        public string? CompanyName { get; set; }
        public string? LogoName { get; set; }
        public string? LogoBase64 { get; set; }
        public bool EmailOnAppointment { get; set; }
        public bool BirthDateOnAppointment { get; set; }
        public bool Insurer1OnAppointment { get; set; }
        public bool Insurer2OnAppointment { get; set; }
        public bool Referr1OnAppointment { get; set; }
        public bool Referr2OnAppointment { get; set; }
        public string? Address { get; set; }
        public string? Address2 { get; set; }
        public string? City { get; set; }
        public string? PostCode { get; set; }
        public string? WebSiteAddress { get; set; }
        public string? InfoEmail { get; set; }
        public bool SetPayableAmountInNewPaymentCash { get; set; }
        public bool CheckInvoiceDateByPractitionerSchedule { get; set; }
        public int PatientCodeStartFrom { get; set; }
        public bool SetReceivebleAmountInNewReceiptBank { get; set; }
        public string? HolidayColor { get; set; }
        public string? EmptyDayColor { get; set; }
        public string? FullDayColor { get; set; }
        public string? NotFullDayColor { get; set; }
        public bool? ShowPatientNotes { get; set; }
    }
}
