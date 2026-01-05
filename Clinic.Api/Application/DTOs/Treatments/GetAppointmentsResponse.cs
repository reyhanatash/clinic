namespace Clinic.Api.Application.DTOs.Treatments
{
    public class GetAppointmentsResponse
    {
        public int Id { get; set; }
        public int? BusinessId { get; set; }
        public int? PractitionerId { get; set; }
        public int? PatientId { get; set; }
        public int? AppointmentTypeId { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public int? RepeatId { get; set; }
        public int? RepeatEvery { get; set; }
        public int? EndsAfter { get; set; }
        public string? Note { get; set; }
        public int? Arrived { get; set; }
        public int? WaitListId { get; set; }
        public bool? Cancelled { get; set; }
        public int? AppointmentCancelTypeId { get; set; }
        public string? CancelNotes { get; set; }
        public bool? IsUnavailbleBlock { get; set; }
        public int? ModifierId { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? LastUpdated { get; set; }
        public bool? IsAllDay { get; set; }
        public bool? SendReminder { get; set; }
        public DateTime? AppointmentSMS { get; set; }
        public bool? IgnoreDidNotCome { get; set; }
        public int? CreatorId { get; set; }
        public bool? ByInvoice { get; set; }
        public string? DoctorName { get; set; }
        public string? PatientName { get; set; }
        public string? Color { get; set; }
        public int Status { get; set; }
        public bool IsOutOfTurn { get; set; }
    }
}
