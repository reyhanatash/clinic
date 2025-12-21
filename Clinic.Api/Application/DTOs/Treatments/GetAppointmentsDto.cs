namespace Clinic.Api.Application.DTOs.Treatments
{
    public class GetAppointmentsDto
    {
        public int? ClinicId { get; set; }
        public DateTime? Date { get; set; }
        public string? DoctorId { get; set; }
    }
}
