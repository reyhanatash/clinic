namespace Clinic.Api.Application.DTOs.Invoices
{
    public class GetInvoicesResponse
    {
        public int Id { get; set; }
        public string? InvoiceNo { get; set; }
        public int BusinessId { get; set; }
        public string? BusinessName { get; set; }
        public string? IssueDate { get; set; }
        public int PatientId { get; set; }
        public string? PatientName { get; set; }
        public int PractitionerId { get; set; }
        public int? AppointmentId { get; set; }
        public string? InvoiceTo { get; set; }
        public string? ExtraPatientInfo { get; set; }
        public decimal TotalDiscount { get; set; }
        public decimal Amount { get; set; }
        public string? Notes { get; set; }
        public decimal Payment { get; set; }
        public int? ModifierId { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? LastUpdated { get; set; }
        public int? InvoiceBillStatusId { get; set; }
        public bool AllowPayLater { get; set; }
        public int? UserAllowPayLaterId { get; set; }
        public decimal Receipt { get; set; }
        public int BillStatus { get; set; }
        public bool IsCanceled { get; set; }
        public decimal? BusinessDebit { get; set; }
        public int? CreatorId { get; set; }
        public int RecordStateId { get; set; }
        public int? AnesthesiaTechnicianId { get; set; }
        public int? ElectroTechnicianId { get; set; }
        public bool IsFirstInvoice { get; set; }
        public bool Anesthesia { get; set; }
        public decimal? BusinessAmount { get; set; }
        public bool AcceptDiscount { get; set; }
        public int? AssistantId { get; set; }
        public bool HasReceipt { get; set; }
    }
}
