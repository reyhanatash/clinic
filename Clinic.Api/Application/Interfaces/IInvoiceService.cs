using Clinic.Api.Application.DTOs;
using Clinic.Api.Application.DTOs.Invoices;
using Clinic.Api.Domain.Entities;

namespace Clinic.Api.Application.Interfaces
{
    public interface IInvoiceService
    {
        Task<GlobalResponse> SaveInvoice(SaveInvoiceDto model);
        Task<IEnumerable<GetInvoicesResponse>> GetInvoices();
        Task<GlobalResponse> SaveInvoiceItem(SaveInvoiceItemDto model);
        Task<IEnumerable<InvoiceItemsContext>> GetInvoiceItems(int invoiceId);
        Task<GlobalResponse> DeleteInvoice(int id);
        Task<GlobalResponse> DeleteInvoiceItem(int id);
        Task<GlobalResponse> SaveReceipt(SaveReceiptDto model);
        Task<IEnumerable<GetReciptsResponse>> GetReceipts(int? patientId);
        Task<GlobalResponse> DeleteReceipt(int patientId);
        Task<IEnumerable<GetReciptsResponse>> GetReceipts();
        Task<GlobalResponse> SaveExpense(SaveExpenseDto model);
        Task<IEnumerable<ExpensesContext>> GetExpenses();
        Task<GlobalResponse> SaveInvoiceDiscount(SaveInvoiceDiscountDto model);
        Task<IEnumerable<GetInvoiceDetailsResponse>> GetInvoiceDetails(int appointmentId);
        Task<GlobalResponse> CancelInvoice(int invoiceId);
        Task<GlobalResponse> ApproveDiscount(int invoiceId);
        Task<GlobalResponse> InvoiceItemIsDone(int invoiceItemId,bool isDone);
        Task<GlobalResponse> DeleteExpense(int id);
        Task<List<GetInvoicesWithoutReceipt>> GetInvoicesWithoutReceipt(int patientId);
    }
}
