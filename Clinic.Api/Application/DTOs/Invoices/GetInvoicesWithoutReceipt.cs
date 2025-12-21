namespace Clinic.Api.Application.DTOs.Invoices
{
    public class GetInvoicesWithoutReceipt
    {
        public int Id { get; set; }
        public string? InvoiceNo { get; set; }
        public string? IssueDate { get; set; }
        public decimal Amount { get; set; }
        public int PatientId { get; set; }
        public int BillStatus { get; set; }
        public string? DoctorName { get; set; }
    }
}
