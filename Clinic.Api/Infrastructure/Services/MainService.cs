using AutoMapper;
using Clinic.Api.Application.DTOs;
using Clinic.Api.Application.DTOs.Main;
using Clinic.Api.Application.Interfaces;
using Clinic.Api.Domain.Entities;
using Clinic.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Clinic.Api.Infrastructure.Services
{
    public class MainService : IMainService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly IReadTokenClaims _token;

        public MainService(ApplicationDbContext context, IMapper mapper, IReadTokenClaims token)
        {
            _context = context;
            _mapper = mapper;
            _token = token;
        }

        public async Task<IEnumerable<SectionsContext>> GetSections()
        {
            try
            {
                var result = await _context.Sections.ToListAsync();

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<BusinessesContext>> GetClinics()
        {
            try
            {
                var result = await _context.Businesses.Select(b => new BusinessesContext
                {
                    Id = b.Id,
                    Name = b.Name
                }).ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SaveJob(SaveJobDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();

                if (model.EditOrNew == -1)
                {
                    var job = _mapper.Map<JobsContext>(model);
                    job.CreatorId = userId;
                    job.CreatedOn = DateTime.Now;
                    _context.Jobs.Add(job);
                    await _context.SaveChangesAsync();
                    result.Message = "Job Saved Successfully";
                    result.Status = 0;
                    return result;
                }
                else
                {
                    var existingJob = await _context.Jobs.FirstOrDefaultAsync(j => j.Id == model.EditOrNew);
                    if (existingJob == null)
                    {
                        throw new Exception("Job Not Found");
                    }

                    _mapper.Map(model, existingJob);
                    existingJob.ModifierId = userId;
                    existingJob.LastUpdated = DateTime.Now;
                    _context.Jobs.Update(existingJob);
                    await _context.SaveChangesAsync();
                    result.Message = "Job Updated Successfully";
                    result.Status = 0;
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<JobsContext>> GetJobs()
        {
            try
            {
                var jobs = await _context.Jobs.ToListAsync();
                return jobs;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteJob(int id)
        {
            var result = new GlobalResponse();

            try
            {
                var job = await _context.Jobs.FindAsync(id);

                if (job == null)
                    throw new Exception("Job Not Found");

                _context.Jobs.Remove(job);
                await _context.SaveChangesAsync();
                result.Message = "Job Deleted Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<CountriesContext>> GetCountries()
        {
            try
            {
                var result = await _context.Countries.ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SaveProduct(SaveProductDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();

                if (model.EditOrNew == -1)
                {
                    var product = _mapper.Map<ProductsContext>(model);
                    product.CreatorId = userId;
                    product.CreatedOn = DateTime.Now;
                    _context.Products.Add(product);
                    await _context.SaveChangesAsync();
                    result.Message = "Product Saved Successfully";
                    result.Status = 0;
                    return result;
                }
                else
                {
                    var existingProduct = await _context.Products.FirstOrDefaultAsync(j => j.Id == model.EditOrNew);
                    if (existingProduct == null)
                    {
                        throw new Exception("Product Not Found");
                    }

                    _mapper.Map(model, existingProduct);
                    existingProduct.ModifierId = userId;
                    existingProduct.LastUpdated = DateTime.Now;
                    _context.Products.Update(existingProduct);
                    await _context.SaveChangesAsync();
                    result.Message = "Product Updated Successfully";
                    result.Status = 0;
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<ProductsContext>> GetProducts()
        {
            try
            {
                var result = await _context.Products.ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteProduct(int id)
        {
            var result = new GlobalResponse();

            try
            {
                var product = await _context.Products.FindAsync(id);

                if (product == null)
                    throw new Exception("Product Not Found");

                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
                result.Message = "Product Deleted Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SaveNote(SaveNoteDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();

                if (model.EditOrNew == -1)
                {
                    var notes = _mapper.Map<MedicalAlertsContext>(model);
                    notes.CreatorId = userId;
                    notes.CreatedOn = DateTime.Now;
                    _context.MedicalAlerts.Add(notes);
                    await _context.SaveChangesAsync();
                    result.Message = "Medical Note Saved Successfully";
                    result.Status = 0;
                    return result;
                }
                else
                {
                    var existingNote = await _context.MedicalAlerts.FirstOrDefaultAsync(j => j.Id == model.EditOrNew);
                    if (existingNote == null)
                    {
                        throw new Exception("Medical Note Not Found");
                    }

                    _mapper.Map(model, existingNote);
                    existingNote.ModifierId = userId;
                    existingNote.LastUpdated = DateTime.Now;
                    _context.MedicalAlerts.Update(existingNote);
                    await _context.SaveChangesAsync();
                    result.Message = "Medical Note Updated Successfully";
                    result.Status = 0;
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<GetNotesResponse>> GetNotes(int patientId)
        {
            try
            {
                var query = _context.MedicalAlerts.AsQueryable();
                var result = await (from m in query
                                    where m.PatientId == patientId
                                    select new GetNotesResponse
                                    {
                                        NoteId = m.Id,
                                        Note = m.Message
                                    })
                                    .ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteNote(int noteId)
        {
            var result = new GlobalResponse();

            try
            {
                var note = await _context.MedicalAlerts.FindAsync(noteId);

                if (note == null)
                    throw new Exception("Note Not Found");

                _context.MedicalAlerts.Remove(note);
                await _context.SaveChangesAsync();
                result.Message = "Note Deleted Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SaveDoctorSchedule(SaveDoctorScheduleDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();

                if (!model.IsBreak)
                {
                    var existingNonBreak = await _context.Schedules
                        .FirstOrDefaultAsync(s =>
                            s.BusinessId == model.BusinessId &&
                            s.PractitionerId == model.PractitionerId &&
                            s.Day == model.Day &&
                            s.IsBreak == false
                        );

                    if (model.EditOrNew == -1 && existingNonBreak != null)
                    {
                        model.EditOrNew = existingNonBreak.Id;
                    }
                }

                if (model.EditOrNew == -1)
                {
                    var schedule = _mapper.Map<SchedulesContext>(model);
                    schedule.CreatorId = userId;
                    schedule.CreatedOn = DateTime.Now;

                    _context.Schedules.Add(schedule);
                    await _context.SaveChangesAsync();

                    result.Message = "Schedule Saved Successfully";
                    result.Status = 0;
                    return result;
                }
                else
                {
                    var existingSchedule = await _context.Schedules
                        .FirstOrDefaultAsync(j => j.Id == model.EditOrNew);

                    if (existingSchedule == null)
                        throw new Exception("Schedule Not Found");

                    _mapper.Map(model, existingSchedule);

                    existingSchedule.ModifierId = userId;
                    existingSchedule.LastUpdated = DateTime.Now;

                    _context.Schedules.Update(existingSchedule);
                    await _context.SaveChangesAsync();

                    result.Message = "Schedule Updated Successfully";
                    result.Status = 0;
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Error while creating schedule: {ex.Message}");
            }
        }

        public async Task<IEnumerable<SchedulesContext>> GetDoctorSchedules(int? userId)
        {
            try
            {
                var userRole = _token.GetUserRole();

                if (userRole == "Doctor")
                {
                    userId = _token.GetUserId();
                }
                var result = await _context.Schedules.Where(s => s.PractitionerId == userId).ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SaveUserAppointmentsSettings(SaveUserAppointmentsSettingsDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();

                var existingRecord = await _context.UserAppointment
                    .FirstOrDefaultAsync(u =>
                        u.PractitionerId == model.PractitionerId &&
                        u.BusinessId == model.BusinessId);

                if (existingRecord == null)
                {
                    var userAppointment = _mapper.Map<UserAppointmentsContext>(model);
                    userAppointment.CreatorId = userId;
                    userAppointment.CreatedOn = DateTime.Now;

                    _context.UserAppointment.Add(userAppointment);
                    await _context.SaveChangesAsync();

                    result.Message = "User appointment settings created successfully";
                    result.Status = 0;
                    return result;
                }
                else
                {
                    _mapper.Map(model, existingRecord);
                    existingRecord.ModifierId = userId;
                    existingRecord.LastUpdated = DateTime.Now;

                    _context.UserAppointment.Update(existingRecord);
                    await _context.SaveChangesAsync();

                    result.Message = "User appointment settings updated successfully";
                    result.Status = 0;
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<UserAppointmentsContext>> GetUserAppointmentsSettings(GetUserAppointmentsSettingsDto model)
        {
            try
            {
                if (model.UserId == -1)
                {
                    model.UserId = _token.GetUserId();
                }

                var query = _context.UserAppointment.AsQueryable();

                if (model.UserId.HasValue)
                    query = query.Where(s => s.PractitionerId == model.UserId.Value);

                if (model.BusinessId.HasValue)
                    query = query.Where(s => s.BusinessId == model.BusinessId.Value);

                var result = await query.ToListAsync();

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteDoctorSchedule(int scheduleId)
        {
            var result = new GlobalResponse();

            try
            {
                var schedule = await _context.Schedules.FindAsync(scheduleId);

                if (schedule == null)
                    throw new Exception("Schedule Not Found");

                _context.Schedules.Remove(schedule);
                await _context.SaveChangesAsync();
                result.Message = "Schedule Deleted Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SaveBusiness(SaveBusinessDto model)
        {
            var result = new GlobalResponse();
            try
            {
                var userId = _token.GetUserId();

                if (model.EditOrNew == -1)
                {
                    var business = _mapper.Map<BusinessesContext>(model);
                    business.CreatorId = userId;
                    business.CreatedOn = DateTime.Now;
                    _context.Businesses.Add(business);
                    await _context.SaveChangesAsync();
                    var creatorId = _token.GetUserId();

                    if (!string.IsNullOrEmpty(model.ServiceId))
                    {
                        var serviceIds = model.ServiceId
                            .Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(id => int.Parse(id.Trim()))
                            .ToList();

                        foreach (var serviceId in serviceIds)
                        {
                            var businessService = new BusinessServicesContext
                            {
                                BusinessId = business.Id,
                                BillableItemId = serviceId,
                                CreatorId = creatorId,
                                CreatedOn = DateTime.Now,
                                IsActive = true
                            };
                            await _context.BusinessServices.AddAsync(businessService);
                        }
                    }
                    await _context.SaveChangesAsync();
                    result.Message = "Business Saved Successfully";
                    result.Status = 0;
                    return result;
                }
                else
                {
                    var existingBusiness = await _context.Businesses.FirstOrDefaultAsync(j => j.Id == model.EditOrNew);
                    if (existingBusiness == null)
                    {
                        throw new Exception("Business Not Found");
                    }
                    if (!string.IsNullOrEmpty(model.ServiceId))
                    {
                        var serviceIds = model.ServiceId
                            .Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(id => int.Parse(id.Trim()))
                            .ToList();

                        foreach (var serviceId in serviceIds)
                        {
                            var businessService = new BusinessServicesContext
                            {
                                BusinessId = existingBusiness.Id,
                                BillableItemId = serviceId,
                                ModifierId = userId,
                                LastUpdated = DateTime.Now,
                                IsActive = true
                            };
                            await _context.BusinessServices.AddAsync(businessService);
                        }
                    }
                    _mapper.Map(model, existingBusiness);
                    existingBusiness.ModifierId = userId;
                    existingBusiness.LastUpdated = DateTime.Now;
                    _context.Businesses.Update(existingBusiness);
                    await _context.SaveChangesAsync();
                    result.Message = "Business Updated Successfully";
                    result.Status = 0;
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<GetBusinessResponse>> GetBusinesses()
        {
            try
            {
                var data =
            from b in _context.Businesses
            join bs in _context.BusinessServices
                on b.Id equals bs.BusinessId into servicesGroup
            select new GetBusinessResponse
            {
                Id = b.Id,
                Name = b.Name,
                Address = b.Address,
                Address2 = b.Address2,
                City = b.City,
                State = b.State,
                PostCode = b.PostCode,
                CountryId = b.CountryId,
                ContactInformation = b.ContactInformation,
                DisplayInOnlineBooking = b.DisplayInOnlineBooking,
                ModifierId = b.ModifierId,
                CreatedOn = b.CreatedOn,
                LastUpdated = b.LastUpdated,
                Location = b.Location,
                Zoom = b.Zoom,
                InfoEmail = b.InfoEmail,
                IsServiceBase = b.IsServiceBase,
                CreatorId = b.CreatorId,
                ShowInvoiceInRecord = b.ShowInvoiceInRecord,
                CheckScheduleOnInvoice = b.CheckScheduleOnInvoice,
                IsInPatient = b.IsInPatient,
                SMSEnabled = b.SMSEnabled,
                AppointmentByOutOfRange = b.AppointmentByOutOfRange,

                Services = servicesGroup.Select(s => new BusinessServiceItemDto
                {
                    Id = s.Id,
                    BusinessId = s.BusinessId,
                    BillableItemId = s.BillableItemId,
                    IsActive = s.IsActive,
                    ModifierId = s.ModifierId,
                    CreatedOn = s.CreatedOn,
                    LastUpdated = s.LastUpdated,
                    CreatorId = s.CreatorId
                }).ToList()
            };

                return await data.ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteBusiness(int businessId)
        {
            var result = new GlobalResponse();

            try
            {
                var business = await _context.Businesses.FindAsync(businessId);

                if (business == null)
                    throw new Exception("Business Not Found");

                _context.Businesses.Remove(business);
                await _context.SaveChangesAsync();
                result.Message = "Business Deleted Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SaveTimeException(SaveTimeExceptionModel model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();

                if (model.EditOrNew == -1)
                {
                    var timeException = _mapper.Map<TimeExceptionsContext>(model);
                    timeException.CreatorId = userId;
                    timeException.CreatedOn = DateTime.Now;
                    _context.TimeExceptions.Add(timeException);
                    await _context.SaveChangesAsync();
                    result.Message = "Time Exception Saved Successfully";
                    result.Status = 0;
                    return result;
                }
                else
                {
                    var existingTimeException = await _context.TimeExceptions.FirstOrDefaultAsync(j => j.Id == model.EditOrNew);
                    if (existingTimeException == null)
                    {
                        throw new Exception("Time Exception Not Found");
                    }

                    _mapper.Map(model, existingTimeException);
                    existingTimeException.ModifierId = userId;
                    existingTimeException.LastUpdated = DateTime.Now;
                    _context.TimeExceptions.Update(existingTimeException);
                    await _context.SaveChangesAsync();
                    result.Message = "Time Exception Updated Successfully";
                    result.Status = 0;
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<TimeExceptionsContext>> GetTimeExceptions()
        {
            try
            {
                var timeExceptions = await _context.TimeExceptions.ToListAsync();
                return timeExceptions;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteTimeException(int id)
        {
            var result = new GlobalResponse();
            try
            {
                var timeException = await _context.TimeExceptions.FindAsync(id);

                if (timeException == null)
                    throw new Exception("Time Exception Not Found");

                _context.TimeExceptions.Remove(timeException);
                await _context.SaveChangesAsync();
                result.Message = "Time Exception Deleted Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SaveOutOfTurnException(SaveOutOfTurnExceptionDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();

                if (model.EditOrNew == -1)
                {
                    var outOfTurnException = _mapper.Map<OutOfTurnExceptionsContext>(model);
                    outOfTurnException.CreatorId = userId;
                    outOfTurnException.CreatedOn = DateTime.Now;
                    _context.OutOfTurnExceptions.Add(outOfTurnException);
                    await _context.SaveChangesAsync();
                    result.Message = "Out Of Turn Exception Saved Successfully";
                    result.Status = 0;
                    return result;
                }
                else
                {
                    var existingOutOfTurnException = await _context.OutOfTurnExceptions.FirstOrDefaultAsync(j => j.Id == model.EditOrNew);
                    if (existingOutOfTurnException == null)
                    {
                        throw new Exception("Out Of Turn Exception Not Found");
                    }

                    _mapper.Map(model, existingOutOfTurnException);
                    existingOutOfTurnException.ModifierId = userId;
                    existingOutOfTurnException.LastUpdated = DateTime.Now;
                    _context.OutOfTurnExceptions.Update(existingOutOfTurnException);
                    await _context.SaveChangesAsync();
                    result.Message = "Out Of Turn Exception Updated Successfully";
                    result.Status = 0;
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<GetOutOfTurnExceptionResponse>> GetOutOfTurnExceptions()
        {
            try
            {
                var query = _context.OutOfTurnExceptions.AsQueryable();
                var result = await (
                    from o in query
                    join d in _context.Users on o.PractitionerId equals d.Id
                    join b in _context.Businesses on o.BusinessId equals b.Id
                    select new GetOutOfTurnExceptionResponse
                    {
                        Id = o.Id,
                        GrigoryDate = o.GrigoryDate,
                        StartDate = o.StartDate,
                        PractitionerId = o.PractitionerId,
                        BusinessId = o.BusinessId,
                        OutOfTurn = o.OutOfTurn,
                        CreatorId = o.CreatorId,
                        ModifierId = o.ModifierId,
                        CreatedOn = o.CreatedOn,
                        LastUpdated = o.LastUpdated,
                        DoctorName = d.FirstName + " " + d.LastName,
                        BusinessName = b.Name
                    }
                    ).ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteOutOfTurnException(int id)
        {
            var result = new GlobalResponse();

            try
            {
                var outOfTurnException = await _context.OutOfTurnExceptions.FindAsync(id);

                if (outOfTurnException == null)
                    throw new Exception("Out Of Turn Exception Not Found");

                _context.OutOfTurnExceptions.Remove(outOfTurnException);
                await _context.SaveChangesAsync();
                result.Message = "Out Of Turn Exception Deleted Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
