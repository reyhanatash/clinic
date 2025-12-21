namespace Clinic.Api.Application.DTOs.Main
{
    public class GetDoctorSchedulesResponse
    {
        public int Id { get; set; }
        public int BusinessId { get; set; }
        public int Day { get; set; }
        public string? FromTime { get; set; }
        public string? ToTime { get; set; }
        public bool IsBreak { get; set; }
        public bool IsActive { get; set; }
        public int? ModifierId { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? LastUpdated { get; set; }
        public int PractitionerId { get; set; }
        public int? Duration { get; set; }
        public int? CreatorId { get; set; }
        public string? DoctorName { get; set; }
    }
}
