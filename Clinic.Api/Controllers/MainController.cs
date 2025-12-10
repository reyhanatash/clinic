using Clinic.Api.Application.DTOs.Main;
using Clinic.Api.Application.Interfaces;
using Clinic.Api.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MainController : ControllerBase
    {
        private readonly IMainService _mainService;

        public MainController(IMainService mainService)
        {
            _mainService = mainService;
        }

        [HttpGet("getSections")]
        [Authorize]
        public async Task<IActionResult> GetSections()
        {
            var result = await _mainService.GetSections();
            return Ok(result);
        }

        [HttpGet("getClinics")]
        [Authorize]
        public async Task<IActionResult> GetClinics()
        {
            var result = await _mainService.GetClinics();
            return Ok(result);
        }

        [HttpPost("saveJob")]
        [Authorize]
        public async Task<IActionResult> SaveJob(SaveJobDto model)
        {
            var result = await _mainService.SaveJob(model);
            return Ok(result);
        }

        [HttpGet("getJobs")]
        [Authorize]
        public async Task<IActionResult> GetJobs()
        {
            var result = await _mainService.GetJobs();
            return Ok(result);
        }

        [HttpGet("deleteJob/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteJob(int id)
        {
            var result = await _mainService.DeleteJob(id);
            return Ok(result);
        }

        [HttpGet("getCountries")]
        [Authorize]
        public async Task<IActionResult> GetCountries()
        {
            var result = await _mainService.GetCountries();
            return Ok(result);
        }

        [HttpPost("saveProduct")]
        [Authorize]
        public async Task<IActionResult> SaveProduct(SaveProductDto model)
        {
            var result = await _mainService.SaveProduct(model);
            return Ok(result);
        }

        [HttpGet("getProducts")]
        [Authorize]
        public async Task<IActionResult> GetProducts()
        {
            var result = await _mainService.GetProducts();
            return Ok(result);
        }

        [HttpGet("deleteProduct/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var result = await _mainService.DeleteProduct(id);
            return Ok(result);
        }

        [HttpPost("saveNote")]
        [Authorize]
        public async Task<IActionResult> SaveNote(SaveNoteDto model)
        {
            var result = await _mainService.SaveNote(model);
            return Ok(result);
        }

        [HttpGet("getNotes/{patientId}")]
        [Authorize]
        public async Task<IActionResult> GetNotes(int patientId)
        {
            var result = await _mainService.GetNotes(patientId);
            return Ok(result);
        }

        [HttpGet("deleteNote/{noteId}")]
        [Authorize]
        public async Task<IActionResult> DeleteNote(int noteId)
        {
            var result = await _mainService.DeleteNote(noteId);
            return Ok(result);
        }

        [HttpPost("saveDoctorSchedule")]
        [Authorize]
        public async Task<IActionResult> SaveDoctorSchedule(SaveDoctorScheduleDto model)
        {
            var result = await _mainService.SaveDoctorSchedule(model);
            return Ok(result);
        }

        [HttpGet("getDoctorSchedules/{userId?}")]
        [Authorize]
        public async Task<IActionResult> GetDoctorSchedules(int? userId)
        {
            var result = await _mainService.GetDoctorSchedules(userId);
            return Ok(result);
        }

        [HttpGet("deleteDoctorSchedule/{scheduleId}")]
        [Authorize]
        public async Task<IActionResult> DeleteDoctorSchedule(int scheduleId)
        {
            var result = await _mainService.DeleteDoctorSchedule(scheduleId);
            return Ok(result);
        }

        [HttpPost("saveUserAppointmentsSettings")]
        [Authorize]
        public async Task<IActionResult> SaveUserAppointmentsSettings(SaveUserAppointmentsSettingsDto model)
        {
            var result = await _mainService.SaveUserAppointmentsSettings(model);
            return Ok(result);
        }

        [HttpPost("getUserAppointmentsSettings")]
        [Authorize]
        public async Task<IActionResult> GetUserAppointmentsSettings(GetUserAppointmentsSettingsDto model)
        {
            var result = await _mainService.GetUserAppointmentsSettings(model);
            return Ok(result);
        }

        [HttpPost("saveBusiness")]
        [Authorize]
        public async Task<IActionResult> SaveBusiness(SaveBusinessDto model)
        {
            var result = await _mainService.SaveBusiness(model);
            return Ok(result);
        }

        [HttpGet("getBusinesses")]
        [Authorize]
        public async Task<IActionResult> GetBusinesses()
        {
            var result = await _mainService.GetBusinesses();
            return Ok(result);
        }

        [HttpGet("deleteBusiness/{businessId}")]
        [Authorize]
        public async Task<IActionResult> DeleteBusiness(int businessId)
        {
            var result = await _mainService.DeleteBusiness(businessId);
            return Ok(result);
        }

        [HttpPost("saveTimeException")]
        [Authorize]
        public async Task<IActionResult> SaveTimeException(SaveTimeExceptionModel model)
        {
            var result = await _mainService.SaveTimeException(model);
            return Ok(result);
        }

        [HttpGet("getTimeExceptions")]
        [Authorize]
        public async Task<IActionResult> GetTimeExceptions()
        {
            var result = await _mainService.GetTimeExceptions();
            return Ok(result);
        }

        [HttpGet("deleteTimeException/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteTimeException(int id)
        {
            var result = await _mainService.DeleteTimeException(id);
            return Ok(result);
        }

        [HttpPost("saveOutOfTurnException")]
        [Authorize]
        public async Task<IActionResult> SaveOutOfTurnException(SaveOutOfTurnExceptionDto model)
        {
            var result = await _mainService.SaveOutOfTurnException(model);
            return Ok(result);
        }

        [HttpGet("getOutOfTurnExceptions")]
        [Authorize]
        public async Task<IActionResult> GetOutOfTurnExceptions()
        {
            var result = await _mainService.GetOutOfTurnExceptions();
            return Ok(result);
        }

        [HttpGet("deleteOutOfTurnException/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteOutOfTurnException(int id)
        {
            var result = await _mainService.DeleteOutOfTurnException(id);
            return Ok(result);
        }

        [HttpPost("updateSmsSettings")]
        [Authorize]
        public async Task<IActionResult> UpdateSmsSettings(UpdateSmsSettingsDto model)
        {
            var result = await _mainService.UpdateSmsSettings(model);
            return Ok(result);
        }
    }
}
