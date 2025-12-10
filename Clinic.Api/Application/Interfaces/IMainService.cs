using Clinic.Api.Application.DTOs;
using Clinic.Api.Application.DTOs.Main;
using Clinic.Api.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.Api.Application.Interfaces
{
    public interface IMainService
    {
        Task<IEnumerable<SectionsContext>> GetSections();
        Task<IEnumerable<BusinessesContext>> GetClinics();
        Task<GlobalResponse> SaveJob(SaveJobDto model);
        Task<IEnumerable<JobsContext>> GetJobs();
        Task<GlobalResponse> DeleteJob(int id);
        Task<IEnumerable<CountriesContext>> GetCountries();
        Task<GlobalResponse> SaveProduct(SaveProductDto model);
        Task<IEnumerable<ProductsContext>> GetProducts();
        Task<GlobalResponse> DeleteProduct(int id);
        Task<GlobalResponse> SaveNote(SaveNoteDto model);
        Task<IEnumerable<GetNotesResponse>> GetNotes(int patientId);
        Task<GlobalResponse> DeleteNote(int noteId);
        Task<GlobalResponse> SaveDoctorSchedule(SaveDoctorScheduleDto model);
        Task<IEnumerable<SchedulesContext>> GetDoctorSchedules(int? userId);
        Task<GlobalResponse> DeleteDoctorSchedule(int scheduleId);
        Task<GlobalResponse> SaveUserAppointmentsSettings(SaveUserAppointmentsSettingsDto model);
        Task<IEnumerable<UserAppointmentsContext>> GetUserAppointmentsSettings(GetUserAppointmentsSettingsDto model);
        Task<GlobalResponse> SaveBusiness(SaveBusinessDto model);
        Task<IEnumerable<GetBusinessResponse>> GetBusinesses();
        Task<GlobalResponse> DeleteBusiness(int businesseId);
        Task<GlobalResponse> SaveTimeException(SaveTimeExceptionModel model);
        Task<IEnumerable<TimeExceptionsContext>> GetTimeExceptions();
        Task<GlobalResponse> DeleteTimeException(int id);
        Task<GlobalResponse> SaveOutOfTurnException(SaveOutOfTurnExceptionDto model);
        Task<IEnumerable<GetOutOfTurnExceptionResponse>> GetOutOfTurnExceptions();
        Task<GlobalResponse> DeleteOutOfTurnException(int id);
        Task<GlobalResponse> UpdateSmsSettings(UpdateSmsSettingsDto model);
    }
}
