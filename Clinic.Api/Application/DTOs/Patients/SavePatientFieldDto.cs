namespace Clinic.Api.Application.DTOs.Patients
{
    public class SavePatientFieldDto
    {
        public int? TitleId { get; set; }
        public int? Gender { get; set; }
        public int? FatherName { get; set; }
        public int? BirthDate { get; set; }
        public int? RelatedPatients { get; set; }
        public int? PatientPhones { get; set; }
        public int? Email { get; set; }
        public int? Address1 { get; set; }
        public int? Address2 { get; set; }
        public int? Address3 { get; set; }
        public int? City { get; set; }
        public int? State { get; set; }
        public int? PostCode { get; set; }
        public int? CountryId { get; set; }
        public int? ReminderTypeId { get; set; }
        public int? UnsubscribeFromSMSMarketing { get; set; }
        public int? ReceiveBookingConfirmationEmails { get; set; }
        public int? InvoiceTo { get; set; }
        public int? EmailInvoiceTo { get; set; }
        public int? InvoiceExtraInformation { get; set; }
        public int? JobId { get; set; }
        public int? EmergencyContact { get; set; }
        public int? ReferenceNumber { get; set; }
        public int? ReferringDoctorId { get; set; }
        public int? Notes { get; set; }
        public int? ReferringInsurerId { get; set; }
        public int? ReferringInsurer2Id { get; set; }
        public int? ReferringInpatientInsurerId { get; set; }
        public int? ReferringContactId { get; set; }
        public int? ReferringContact2Id { get; set; }
        public int? ReferringPatientId { get; set; }
        public int? NationalCode { get; set; }
        public int EditOrNew { get; set; }
    }
}
