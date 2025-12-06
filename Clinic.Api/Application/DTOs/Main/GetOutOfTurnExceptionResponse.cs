namespace Clinic.Api.Application.DTOs.Main
{
    public class GetOutOfTurnExceptionResponse
    {
        public int Id { get; set; }
        public DateTime GrigoryDate { get; set; }
        public string? StartDate { get; set; }
        public int PractitionerId { get; set; }
        public int BusinessId { get; set; }
        public int OutOfTurn { get; set; }
        public int? CreatorId { get; set; }
        public int? ModifierId { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? LastUpdated { get; set; }
        public string? DoctorName { get; set; }
        public string? BusinessName { get; set; }
    }
}
