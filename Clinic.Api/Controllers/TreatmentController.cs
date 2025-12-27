using Clinic.Api.Application.DTOs.Treatments;
using Clinic.Api.Application.Interfaces;
using Clinic.Api.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TreatmentController : ControllerBase
    {
        private readonly ITreatmentService _treatmentsService;

        public TreatmentController(ITreatmentService treatmentsService)
        {
            _treatmentsService = treatmentsService;
        }

        [HttpPost("createAppointment")]
        [Authorize]
        public async Task<IActionResult> Create(CreateAppointmentDto model)
        {
            var result = await _treatmentsService.CreateAppointmentAsync(model);
            return Ok(result);
        }

        [HttpGet("deleteAppointment/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var result = await _treatmentsService.DeleteAppointment(id);
            return Ok(result);
        }

        [HttpPost("getAppointments")]
        [Authorize]
        public async Task<IActionResult> GetAppointments(GetAppointmentsDto model)
        {
            var result = await _treatmentsService.GetAppointments(model);
            return Ok(result);
        }

        [HttpGet("getTreatments/{appointmentId}")]
        [Authorize]
        public async Task<IActionResult> GetTreatments(int appointmentId)
        {
            var result = await _treatmentsService.GetTreatments(appointmentId);

            return Ok(result);
        }

        [HttpGet("deleteTreatment/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteTreatment(int id)
        {
            var result = await _treatmentsService.DeleteTreatment(id);
            return Ok(result);
        }

        [HttpPost("getTodayAppointments")]
        [Authorize]
        public async Task<IActionResult> GetTodayAppointments(GetTodayAppointmentsDto model)
        {
            var result = await _treatmentsService.GetTodayAppointments(model);
            return Ok(result);
        }

        [HttpPost("saveAppointmentType")]
        [Authorize]
        public async Task<IActionResult> SaveAppointmentType(SaveAppointmentTypeDto model)
        {
            var result = await _treatmentsService.SaveAppointmentType(model);
            return Ok(result);
        }

        [HttpGet("getAppointmentTypes")]
        [Authorize]
        public async Task<IActionResult> GetAppointmentTypes()
        {
            var result = await _treatmentsService.GetAppointmentTypes();

            return Ok(result);
        }

        [HttpGet("deleteAppointmentType/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteAppointmentType(int id)
        {
            var result = await _treatmentsService.DeleteAppointmentType(id);
            return Ok(result);
        }

        [HttpPost("getWeeklyAppointments")]
        [Authorize]
        public async Task<IActionResult> GetWeekAppointments(GetAppointmentsDto model)
        {
            var result = await _treatmentsService.GetWeekAppointments(model);
            return Ok(result);
        }

        [HttpGet("getBillableItems")]
        [Authorize]
        public async Task<IActionResult> GetBillableItems()
        {
            var result = await _treatmentsService.GetBillableItems();
            return Ok(result);
        }

        [HttpPost("saveBillableItem")]
        [Authorize]
        public async Task<IActionResult> SaveBillableItem(SaveBillableItemsDto model)
        {
            var result = await _treatmentsService.SaveBillableItem(model);
            return Ok(result);
        }

        [HttpGet("deleteBillableItem/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteBillableItem(int id)
        {
            var result = await _treatmentsService.DeleteBillableItem(id);
            return Ok(result);
        }

        [HttpGet("getSectionPerService/{serviceId}")]
        [Authorize]
        public async Task<IActionResult> GetSectionPerService(int serviceId)
        {
            var result = await _treatmentsService.GetSectionPerService(serviceId);
            return Ok(result);
        }

        [HttpGet("getQuestionsPerSection/{sectionId}")]
        [Authorize]
        public async Task<IActionResult> GetQuestionsPerSection(int sectionId)
        {
            var result = await _treatmentsService.GetQuestionsPerSection(sectionId);
            return Ok(result);
        }

        [HttpGet("getAnswersPerQuestion/{questionId}")]
        [Authorize]
        public async Task<IActionResult> GetAnswersPerQuestion(int questionId)
        {
            var result = await _treatmentsService.GetAnswersPerQuestion(questionId);
            return Ok(result);
        }

        [HttpGet("getPatientServices/{patientId}")]
        [Authorize]
        public async Task<IActionResult> GetPatientServices(int patientId)
        {
            var result = await _treatmentsService.GetPatientServices(patientId);
            return Ok(result);
        }

        [HttpGet("getPatientTreatments/{patientId}")]
        [Authorize]
        public async Task<IActionResult> GetPatientTreatments(int patientId)
        {
            var result = await _treatmentsService.GetPatientTreatments(patientId);
            return Ok(result);
        }

        [HttpPost("saveItemCategory")]
        [Authorize]
        public async Task<IActionResult> SaveItemCategory(SaveItemCategoryDto model)
        {
            var result = await _treatmentsService.SaveItemCategory(model);
            return Ok(result);
        }

        [HttpGet("getItemCategory")]
        [Authorize]
        public async Task<IActionResult> GetItemCategory()
        {
            var result = await _treatmentsService.GetItemCategory();
            return Ok(result);
        }

        [HttpGet("deleteItemCategory/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteItemCategory(int id)
        {
            var result = await _treatmentsService.DeleteItemCategory(id);
            return Ok(result);
        }

        [HttpPost("getTreatmentTemplates")]
        [Authorize]
        public async Task<IActionResult> GetTreatmentTemplates(GetTreatmentTemplateDto model)
        {
            var result = await _treatmentsService.GetTreatmentTemplates(model);
            return Ok(result);
        }

        [HttpGet("savePatientArrived/{appointmentId}")]
        [Authorize]
        public async Task<IActionResult> SavePatientArrived(int appointmentId)
        {
            var result = await _treatmentsService.SavePatientArrived(appointmentId);
            return Ok(result);
        }

        [HttpGet("cancelAppointment/{appointmentId}")]
        [Authorize]
        public async Task<IActionResult> CancelAppointment(int appointmentId)
        {
            var result = await _treatmentsService.CancelAppointment(appointmentId);
            return Ok(result);
        }

        [HttpPost("saveTreatmentTemplate")]
        [Authorize]
        public async Task<IActionResult> SaveTreatmentTemplate(SaveTreatmentTemplateDto model)
        {
            var result = await _treatmentsService.SaveTreatmentTemplate(model);
            return Ok(result);
        }

        [HttpGet("deleteTreatmentTemplate/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteTreatmentTemplate(int id)
        {
            var result = await _treatmentsService.DeleteTreatmentTemplate(id);
            return Ok(result);
        }
    }
}
