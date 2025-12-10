namespace Clinic.Api.Application.DTOs.Treatments
{
    public class GetTodayAppointmentsInfoDto
    {
        public int Id { get; set; }
        public string Time { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public int? PatientId { get; set; }
        public string AppointmentTypeName { get; set; } = string.Empty;
        public List<BillableItemDoneDto> BillableItems { get; set; }
        public string PractitionerName { get; set; } = string.Empty;
        public DateTime? Date { get; set; }
        public int DayNumber { get; set; }
        public int Status { get; set; }
        public string? BillableItemName { get; set; }
        public string? PatientPhone { get; set; }
        public decimal? TotalDiscount { get; set; }
        public int? InvoiceId { get; set; }
        public decimal Receipt { get; set; }
        public bool Done { get; set; }
        public int? Arrived { get; set; }
    }

    public class BillableItemDoneDto
    {
        public string Name { get; set; }
        public bool? Done { get; set; }
        public int InvoiceItemId { get; set; }
    }
}
