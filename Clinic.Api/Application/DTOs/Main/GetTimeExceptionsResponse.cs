namespace Clinic.Api.Application.DTOs.Main
{
    public class GetTimeExceptionsResponse
    {
        public int Id { get; set; }
        public string? StartDate { get; set; }
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public int PractitionerId { get; set; }
        public int TimeExceptionTypeId { get; set; }
        public int? RepeatId { get; set; }
        public int? RepeatEvery { get; set; }
        public int? EndsAfter { get; set; }
        public int? ModifierId { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? LastUpdated { get; set; }
        public int? Duration { get; set; }
        public DateTime GrigoryDate { get; set; }
        public int BusinessId { get; set; }
        public int? CreatorId { get; set; }
        public int? PractitionerTimeExceptionId { get; set; }
        public int OutOfTurn { get; set; }
        public int? DefaultAppointmentTypeId { get; set; }
        public int? TimeSlotSize { get; set; }
        public string? BusinessName { get; set; }
        public string? DoctorName { get; set; }
    }
}
