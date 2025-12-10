using Clinic.Api.Application.DTOs.Report;
using Clinic.Api.Application.Interfaces;
using Clinic.Api.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpPost("getInvoicesByClinic")]
        [Authorize]
        public async Task<IActionResult> GetInvoicesByClinic(InvoiceFilterDto model)
        {
            var result = await _reportService.GetInvoicesByClinic(model);
            return Ok(result);
        }

        [HttpPost("getInvoicesByService")]
        [Authorize]
        public async Task<IActionResult> GetInvoicesByService(InvoiceFilterDto model)
        {
            var result = await _reportService.GetInvoicesByService(model);
            return Ok(result);
        }

        [HttpPost("getSubmitedAppointments")]
        [Authorize("Doctor", "Admin", "Secretary-Reception")]
        public async Task<IActionResult> GetSubmitedAppointments(InvoiceFilterDto model)
        {
            var result = await _reportService.GetSubmitedAppointments(model);
            return Ok(result);
        }

        [HttpPost("getSubmitedInvoices")]
        [Authorize]
        public async Task<IActionResult> GetSubmitedInvoices(InvoiceFilterDto model)
        {
            var result = await _reportService.GetSubmitedInvoices(model);
            return Ok(result);
        }

        [HttpPost("getUnpaidInvoices")]
        [Authorize]
        public async Task<IActionResult> GetUnpaidInvoices(InvoiceFilterDto model)
        {
            var result = await _reportService.GetUnpaidInvoices(model);
            return Ok(result);
        }

        [HttpPost("getPractitionerIncome")]
        [Authorize]
        public async Task<IActionResult> GetPractitionerIncome(IncomeReportFilterDto model)
        {
            var result = await _reportService.GetPractitionerIncome(model);
            return Ok(result);
        }

        [HttpPost("getBusinessIncome")]
        [Authorize]
        public async Task<IActionResult> GetBusinessIncome(IncomeReportFilterDto model)
        {
            var result = await _reportService.GetBusinessIncome(model);
            return Ok(result);
        }

        [HttpPost("getIncomeReportDetails")]
        [Authorize]
        public async Task<IActionResult> GetIncomeReportDetails(IncomeReportFilterDto model)
        {
            var result = await _reportService.GetIncomeReportDetails(model);
            return Ok(result);
        }

        [HttpPost("getOutPatientSummaryReport")]
        [Authorize]
        public async Task<IActionResult> GetOutPatientSummaryReport(OutPatientReportFilterDto model)
        {
            var result = await _reportService.GetOutPatientSummaryReport(model);
            return Ok(result);
        }

        [HttpPost("getOutPatientReportBasedOnCreator")]
        [Authorize]
        public async Task<IActionResult> GetOutPatientReportBasedOnCreator(OutPatientReportFilterDto model)
        {
            var result = await _reportService.GetOutPatientReportBasedOnCreator(model);
            return Ok(result);
        }

        [HttpPost("getUnvisitedSummary")]
        [Authorize]
        public async Task<IActionResult> GetUnvisitedSummary(GetUnvisitedPatientsDto model)
        {
            var result = await _reportService.GetUnvisitedSummary(model);
            return Ok(result);
        }

        [HttpPost("getUnvisitedDetails")]
        [Authorize]
        public async Task<IActionResult> GetUnvisitedDetails(GetUnvisitedPatientsDto model)
        {
            var result = await _reportService.GetUnvisitedDetails(model);
            return Ok(result);
        }
    }
}
