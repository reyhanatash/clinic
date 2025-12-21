namespace Clinic.Api.Application.DTOs.Treatments
{
    public class GetAppointmentTypesResponse
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Category { get; set; }
        public int Duration { get; set; }
        public int MaximumNumberOfPatients { get; set; }
        public int? RelatedBillableItemId { get; set; }
        public string? BillableItemName { get; set; }
        public int? RelatedBillableItem2Id { get; set; }
        public string? BillableItemName2 { get; set; }
        public int? RelatedBillableItem3Id { get; set; }
        public string? BillableItemName3 { get; set; }
        public int? DefaultTreatmentNoteTemplate { get; set; }
        public int? RelatedProductId { get; set; }
        public string? ProductName { get; set; }
        public int? RelatedProduct2Id { get; set; }
        public string? ProductName2 { get; set; }
        public int? RelatedProduct3Id { get; set; }
        public string? ProductName3 { get; set; }
        public string? Color { get; set; }
        public bool SendBookingConfirmationEmail { get; set; }
        public bool SendReminderEmail { get; set; }
        public bool ShowInOnlineBookings { get; set; }
        public int? ModifierId { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? LastUpdated { get; set; }
        public int? CreatorId { get; set; }
        public bool IsFirstEncounter { get; set; }
    }
}
