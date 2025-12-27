namespace Clinic.Api.Application.DTOs.Main
{
    public class SaveSectionDto
    {
        public int TreatmentTemplateId { get; set; }
        public string? title { get; set; }
        public bool defaultClose { get; set; }
        public int? order { get; set; }
        public bool isDeleted { get; set; }
        public bool? horizontalDirection { get; set; }
        public int EditOrNew { get; set; }
    }
}
