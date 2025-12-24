namespace Clinic.Api.Application.DTOs.Treatments
{
    public class CreateAppointmentDto
    {
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
        public bool? IsAllDay { get; set; }
        public bool? SendReminder { get; set; }
        public DateTime? AppointmentSMS { get; set; }
        public bool? IgnoreDidNotCome { get; set; }
        public bool? ByInvoice { get; set; }
        public string? Services { get; set; }
        public int EditOrNew { get; set; }
    }
}
