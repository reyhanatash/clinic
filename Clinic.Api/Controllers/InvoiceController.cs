using Clinic.Api.Application.DTOs.Invoices;
using Clinic.Api.Application.Interfaces;
using Clinic.Api.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InvoiceController : ControllerBase
    {
        private readonly IInvoiceService _invoicesService;

        public InvoiceController(IInvoiceService invoicesService)
        {
            _invoicesService = invoicesService;
        }

        [HttpPost("saveInvoice")]
        [Authorize]
        public async Task<IActionResult> SaveInvoice(SaveInvoiceDto model)
        {
            var result = await _invoicesService.SaveInvoice(model);
            return Ok(result);
        }

        [HttpGet("deleteInvoice/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteInvoice(int id)
        {
            var result = await _invoicesService.DeleteInvoice(id);
            return Ok(result);
        }

        [HttpGet("getInvoices")]
        [Authorize]
        public async Task<IActionResult> GetInvoices()
        {
            var result = await _invoicesService.GetInvoices();
            return Ok(result);
        }

        [HttpPost("saveInvoiceItem")]
        [Authorize]
        public async Task<IActionResult> SaveInvoiceItem(SaveInvoiceItemDto model)
        {
            var result = await _invoicesService.SaveInvoiceItem(model);
            return Ok(result);
        }

        [HttpGet("deleteInvoiceItem/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteInvoiceItem(int id)
        {
            var result = await _invoicesService.DeleteInvoiceItem(id);
            return Ok(result);
        }

        [HttpGet("getInvoiceItems/{invoiceId}")]
        [Authorize]
        public async Task<IActionResult> GetInvoiceItems(int invoiceId)
        {
            var result = await _invoicesService.GetInvoiceItems(invoiceId);
            return Ok(result);
        }

        [HttpPost("saveReceipt")]
        [Authorize]
        public async Task<IActionResult> SaveReceipt(SaveReceiptDto model)
        {
            var result = await _invoicesService.SaveReceipt(model);
            return Ok(result);
        }

        [HttpGet("getReceipt/{patientId?}")]
        [Authorize]
        public async Task<IActionResult> GetReceipts(int? patientId)
        {
            var result = await _invoicesService.GetReceipts(patientId);
            return Ok(result);
        }

        [HttpGet("getReceipts")]
        [Authorize]
        public async Task<IActionResult> GetReceipts()
        {
            var result = await _invoicesService.GetReceipts();
            return Ok(result);
        }

        [HttpGet("deleteReceipt/{patientId}")]
        [Authorize]
        public async Task<IActionResult> DeleteReceipt(int patientId)
        {
            var result = await _invoicesService.DeleteReceipt(patientId);
            return Ok(result);
        }

        [HttpPost("saveExpense")]
        [Authorize]
        public async Task<IActionResult> SaveExpense(SaveExpenseDto model)
        {
            var result = await _invoicesService.SaveExpense(model);
            return Ok(result);
        }

        [HttpGet("getExpenses")]
        [Authorize]
        public async Task<IActionResult> GetExpenses()
        {
            var result = await _invoicesService.GetExpenses();
            return Ok(result);
        }

        [HttpGet("deleteExpense/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var result = await _invoicesService.DeleteExpense(id);
            return Ok(result);
        }

        [HttpPost("saveInvoiceDiscount")]
        [Authorize]
        public async Task<IActionResult> SaveInvoiceDiscount(SaveInvoiceDiscountDto model)
        {
            var result = await _invoicesService.SaveInvoiceDiscount(model);
            return Ok(result);
        }

        [HttpGet("getInvoiceDetails/{appointmentId}")]
        [Authorize]
        public async Task<IActionResult> GetInvoiceDetails(int appointmentId)
        {
            var result = await _invoicesService.GetInvoiceDetails(appointmentId);
            return Ok(result);
        }

        [HttpGet("cancelInvoice/{invoiceId}")]
        [Authorize]
        public async Task<IActionResult> CancelInvoice(int invoiceId)
        {
            var result = await _invoicesService.CancelInvoice(invoiceId);
            return Ok(result);
        }

        [HttpGet("approveDiscount/{invoiceId}")]
        [Authorize]
        public async Task<IActionResult> ApproveDiscount(int invoiceId)
        {
            var result = await _invoicesService.ApproveDiscount(invoiceId);
            return Ok(result);
        }

        [HttpGet("invoiceItemIsDone/{invoiceItemId}/{isDone}")]
        [Authorize]
        public async Task<IActionResult> InvoiceItemIsDone(int invoiceItemId, bool isDone)
        {
            var result = await _invoicesService.InvoiceItemIsDone(invoiceItemId, isDone);
            return Ok(result);
        }

        [HttpGet("getInvoicesWithoutReceipt/{patientId}")]
        [Authorize]
        public async Task<IActionResult> GetInvoicesWithoutReceipt(int patientId)
        {
            var result = await _invoicesService.GetInvoicesWithoutReceipt(patientId);
            return Ok(result);
        }
    }
}
