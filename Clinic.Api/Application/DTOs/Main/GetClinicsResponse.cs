namespace Clinic.Api.Application.DTOs.Main
{
    public class GetClinicsResponse
    {
        public string? Name { get; set; }
        public int Id { get; set; }
        public List<ClinicsServiceResponse> Services { get; set; }
    }

    public class ClinicsServiceResponse
    {
        public int Id { get; set; }
        public int BusinessId { get; set; }
        public int BillableItemId { get; set; }
        public bool IsActive { get; set; }
        public int? ModifierId { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? LastUpdated { get; set; }
        public int? CreatorId { get; set; }
    }
}
