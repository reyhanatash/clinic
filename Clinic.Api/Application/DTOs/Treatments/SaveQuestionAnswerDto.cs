namespace Clinic.Api.Application.DTOs.Treatments
{
    public class SaveQuestionAnswerDto
    {
        public string? Title { get; set; }
        public string? Text { get; set; }
        public string? RefTitle { get; set; }
        public int? Order { get; set; }
        public bool IsDeleted { get; set; }
        public int? Question_Id { get; set; }
        public int EditOrNew { get; set; }
    }
}
