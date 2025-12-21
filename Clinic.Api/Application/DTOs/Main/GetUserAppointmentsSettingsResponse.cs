namespace Clinic.Api.Application.DTOs.Main
{
    public class GetUserAppointmentsSettingsResponse
    {
        public int Id { get; set; }
        public int PractitionerId { get; set; }
        public int BusinessId { get; set; }
        public int? OutOfTurn { get; set; }
        public int? DefaultAppointmentTypeId { get; set; }
        public int? ModifierId { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? LastUpdated { get; set; }
        public int? TimeSlotSize { get; set; }
        public int? CalendarTimeFrom { get; set; }
        public int? CalendarTimeTo { get; set; }
        public int? CreatorId { get; set; }
        public int? NewPatientAppointmentTypeId { get; set; }
        public bool MultipleAppointment { get; set; }
        public string? DoctorName { get; set; }
    }
}
