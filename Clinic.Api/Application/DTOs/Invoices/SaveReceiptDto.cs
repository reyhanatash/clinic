namespace Clinic.Api.Application.DTOs.Invoices
{
    public class SaveReceiptDto
    {
        public int? ReceiptNo { get; set; }
        public int PatientId { get; set; }
        public decimal? Cash { get; set; }
        public decimal? EFTPos { get; set; }
        public decimal? Other { get; set; }
        public string? Notes { get; set; }
        public bool AllowEdit { get; set; }
        public int ReceiptTypeId { get; set; }
        public List<SaveInvoices>? Invoices { get; set; }
    }

    public class SaveInvoices
    {
        public int? InvoiceId { get; set; }
        public decimal? Amount { get; set; }
    }
}
