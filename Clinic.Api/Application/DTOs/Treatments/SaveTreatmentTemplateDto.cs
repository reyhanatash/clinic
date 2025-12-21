namespace Clinic.Api.Application.DTOs.Treatments
{
    public class SaveTreatmentTemplateDto
    {
        public string? Name { get; set; }
        public string? TemplateNotes { get; set; }
        public string? Title { get; set; }
        public bool ShowPatientBirthDate { get; set; }
        public bool ShowPatientReferenceNumber { get; set; }
        public string? PrintTemplate { get; set; }
        public int Ordering { get; set; }
        public int EditOrNew { get; set; }
    }
}
