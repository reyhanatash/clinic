using Clinic.Api.Application.DTOs.Invoices;
using Clinic.Api.Application.Interfaces;
using Clinic.Api.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost("savePayment")]
        [Authorize]
        public async Task<IActionResult> SavePayment(SavePaymentDto model)
        {
            var result = await _paymentService.SavePayment(model);
            return Ok(result);
        }

        [HttpGet("getAllPayments")]
        [Authorize]
        public async Task<IActionResult> GetAllPayments()
        {
            var result = await _paymentService.GetAllPayments();
            return Ok(result);
        }

        [HttpGet("getPayment/{patientId}")]
        [Authorize]
        public async Task<IActionResult> GetPayment(int patientId)
        {
            var result = await _paymentService.GetPayment(patientId);
            return Ok(result);
        }

        [HttpGet("deletePayment/{id}")]
        [Authorize]
        public async Task<IActionResult> DeletePayment(int id)
        {
            var result = await _paymentService.DeletePayment(id);
            return Ok(result);
        }
    }
}
