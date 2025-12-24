using AutoMapper;
using Clinic.Api.Application.DTOs;
using Clinic.Api.Application.DTOs.Treatments;
using Clinic.Api.Application.Interfaces;
using Clinic.Api.Domain.Entities;
using Clinic.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Api.Infrastructure.Services
{
    public class TreatmentService : ITreatmentService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly IReadTokenClaims _token;

        public TreatmentService(ApplicationDbContext context, IMapper mapper, IReadTokenClaims token)
        {
            _context = context;
            _mapper = mapper;
            _token = token;
        }

        public async Task<GlobalResponse> CreateAppointmentAsync(CreateAppointmentDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userRole = _token.GetUserRole();
                if (userRole == "Doctor")
                {
                    model.PractitionerId = _token.GetUserId();
                }
                var userId = _token.GetUserId();

                if (model.EditOrNew == -1)
                {
                    if (model.Start >= model.End)
                        throw new Exception("Start date must be earlier than End date.");

                    if (model.PatientId == null)
                        throw new Exception("Patient Id can't be null!");

                    bool hasOverlap = await _context.Appointments
                   .AnyAsync(a =>
                     a.PractitionerId == model.PractitionerId &&
                     a.BusinessId == model.BusinessId &&
                      a.Start.Date == model.Start.Date &&
                    (
                        (model.Start.TimeOfDay >= a.Start.TimeOfDay && model.Start.TimeOfDay < a.End.TimeOfDay) ||
                        (model.End.TimeOfDay > a.Start.TimeOfDay && model.End.TimeOfDay <= a.End.TimeOfDay) ||
                        (model.Start.TimeOfDay <= a.Start.TimeOfDay && model.End.TimeOfDay >= a.End.TimeOfDay)
                    ));

                    if (hasOverlap)
                        throw new Exception("Doctor already has an appointment in this Clinic during this time.");

                    var business = await _context.Businesses
             .FirstOrDefaultAsync(b => b.Id == model.BusinessId.Value);

                    if (business == null)
                        throw new Exception("Business not found.");

                    model.ByInvoice = true;
                    var appointment = _mapper.Map<AppointmentsContext>(model);
                    appointment.CreatorId = userId;
                    appointment.CreatedOn = DateTime.Now;
                    _context.Appointments.Add(appointment);
                    await _context.SaveChangesAsync();

                    if (business.IsServiceBase == true &&
              !string.IsNullOrWhiteSpace(model.Services))
                    {
                        var serviceIds = model.Services
                            .Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(x => x.Trim())
                            .Where(x => int.TryParse(x, out _))
                            .Select(int.Parse)
                            .Distinct()
                            .ToList();

                        foreach (var serviceId in serviceIds)
                        {
                            var businessService = new BusinessServicesContext
                            {
                                BusinessId = business.Id,
                                BillableItemId = serviceId,
                                CreatorId = userId,
                                CreatedOn = DateTime.Now,
                                IsActive = true
                            };

                            await _context.BusinessServices.AddAsync(businessService);
                        }

                        await _context.SaveChangesAsync();
                    }

                    result.Data = appointment.Id;
                    result.Status = 0;
                    return result;
                }
                else
                {
                    var existingAppointment = await _context.Appointments.FirstOrDefaultAsync(a => a.Id == model.EditOrNew);

                    if (existingAppointment == null)
                    {
                        throw new Exception("Appointment Not Found");
                    }

                    _mapper.Map(model, existingAppointment);
                    existingAppointment.ModifierId = userId;
                    existingAppointment.LastUpdated = DateTime.Now;
                    _context.Appointments.Update(existingAppointment);
                    await _context.SaveChangesAsync();

                    if (model.BusinessId.HasValue)
                    {
                        var business = await _context.Businesses
                            .FirstOrDefaultAsync(b => b.Id == model.BusinessId.Value);

                        if (business != null &&
                            business.IsServiceBase == true &&
                            !string.IsNullOrWhiteSpace(model.Services))
                        {
                            var newServiceIds = model.Services
                                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                                .Select(x => x.Trim())
                                .Where(x => int.TryParse(x, out _))
                                .Select(int.Parse)
                                .Distinct()
                                .ToList();

                            var existingServices = await _context.BusinessServices
                                .Where(bs => bs.BusinessId == business.Id)
                                .ToListAsync();

                            foreach (var oldService in existingServices)
                            {
                                if (!newServiceIds.Contains(oldService.BillableItemId))
                                {
                                    oldService.IsActive = false;
                                    oldService.ModifierId = userId;
                                    oldService.LastUpdated = DateTime.Now;
                                }
                            }

                            foreach (var serviceId in newServiceIds)
                            {
                                var existingService = existingServices
                                    .FirstOrDefault(x => x.BillableItemId == serviceId);

                                if (existingService == null)
                                {
                                    var newService = new BusinessServicesContext
                                    {
                                        BusinessId = business.Id,
                                        BillableItemId = serviceId,
                                        CreatorId = userId,
                                        CreatedOn = DateTime.Now,
                                        IsActive = true
                                    };

                                    await _context.BusinessServices.AddAsync(newService);
                                }
                                else if (existingService.IsActive == false)
                                {
                                    existingService.IsActive = true;
                                    existingService.ModifierId = userId;
                                    existingService.LastUpdated = DateTime.Now;
                                }
                            }

                            await _context.SaveChangesAsync();
                        }
                    }

                    result.Data = existingAppointment.Id;
                    result.Message = "Appointment Updated Successfully";
                    result.Status = 0;
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteAppointment(int id)
        {
            var result = new GlobalResponse();

            try
            {
                var appointment = await _context.Appointments.FindAsync(id);
                if (appointment == null)
                    throw new Exception("Appointment Not Found");

                _context.Appointments.Remove(appointment);
                await _context.SaveChangesAsync();
                result.Message = "Appointment Deleted Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<GetAppointmentsResponse>> GetAppointments(GetAppointmentsDto model)
        {
            try
            {
                var userRole = _token.GetUserRole();
                var userId = _token.GetUserId();

                List<int>? doctorIds = null;

                if (!string.IsNullOrWhiteSpace(model.DoctorId))
                {
                    doctorIds = model.DoctorId
                        .Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(x => int.Parse(x.Trim()))
                        .ToList();
                }

                if (userRole == "Doctor")
                {
                    doctorIds = new List<int> { userId };
                }

                var selectedDate = model.Date?.Date ?? DateTime.Today;

                var baseAppointments = await (
                    from a in _context.Appointments
                    where a.BusinessId == model.ClinicId
                          && (doctorIds == null ||
                              (a.PractitionerId.HasValue && doctorIds.Contains(a.PractitionerId.Value)))
                          && a.Start.Date <= selectedDate
                          && a.End.Date >= selectedDate
                          && a.Cancelled != true
                    join u in _context.Users on a.PractitionerId equals u.Id into uj
                    from u in uj.DefaultIfEmpty()
                    join p in _context.Patients on a.PatientId equals p.Id into pj
                    from p in pj.DefaultIfEmpty()
                    join at in _context.AppointmentTypes on a.AppointmentTypeId equals at.Id into atj
                    from at in atj.DefaultIfEmpty()
                    select new
                    {
                        a.Id,
                        a.BusinessId,
                        a.PractitionerId,
                        a.PatientId,
                        a.AppointmentTypeId,
                        a.Start,
                        a.End,
                        a.RepeatId,
                        a.RepeatEvery,
                        a.EndsAfter,
                        a.Note,
                        a.Arrived,
                        a.WaitListId,
                        a.Cancelled,
                        a.AppointmentCancelTypeId,
                        a.CancelNotes,
                        a.IsUnavailbleBlock,
                        a.ModifierId,
                        a.CreatedOn,
                        a.LastUpdated,
                        a.IsAllDay,
                        a.SendReminder,
                        a.AppointmentSMS,
                        a.IgnoreDidNotCome,
                        a.CreatorId,
                        a.ByInvoice,
                        DoctorName = (u.FirstName + " " + u.LastName).Trim(),
                        PatientName = (p.FirstName + " " + p.LastName).Trim(),
                        Color = at.Color
                    }
                ).ToListAsync();

                var appointmentIds = baseAppointments.Select(x => x.Id).ToList();

                var invoiceAppointmentIds = await _context.Invoices
                    .Where(i =>
                        i.AppointmentId.HasValue &&
                        appointmentIds.Contains(i.AppointmentId.Value) &&
                        (i.IsCanceled == false || i.IsCanceled == null))
                    .Select(i => i.AppointmentId!.Value)
                    .Distinct()
                    .ToListAsync();

                var treatmentAppointmentIds = await _context.Treatments
                    .Where(t =>
                        t.AppointmentId.HasValue &&
                        appointmentIds.Contains(t.AppointmentId.Value))
                    .Select(t => t.AppointmentId!.Value)
                    .Distinct()
                    .ToListAsync();

                var invoiceSet = invoiceAppointmentIds.ToHashSet();
                var treatmentSet = treatmentAppointmentIds.ToHashSet();

                var result = baseAppointments.Select(x =>
                {
                    var hasInvoice = invoiceSet.Contains(x.Id);
                    var hasTreatment = treatmentSet.Contains(x.Id);

                    var status =
                        !hasInvoice && !hasTreatment ? 1 :
                        hasInvoice && !hasTreatment ? 2 :
                        hasInvoice && hasTreatment ? 3 :
                        0;

                    return new GetAppointmentsResponse
                    {
                        Id = x.Id,
                        BusinessId = x.BusinessId,
                        PractitionerId = x.PractitionerId,
                        PatientId = x.PatientId,
                        AppointmentTypeId = x.AppointmentTypeId,
                        Start = x.Start,
                        End = x.End,
                        RepeatId = x.RepeatId,
                        RepeatEvery = x.RepeatEvery,
                        EndsAfter = x.EndsAfter,
                        Note = x.Note,
                        Arrived = x.Arrived,
                        WaitListId = x.WaitListId,
                        Cancelled = x.Cancelled,
                        AppointmentCancelTypeId = x.AppointmentCancelTypeId,
                        CancelNotes = x.CancelNotes,
                        IsUnavailbleBlock = x.IsUnavailbleBlock,
                        ModifierId = x.ModifierId,
                        CreatedOn = x.CreatedOn,
                        LastUpdated = x.LastUpdated,
                        IsAllDay = x.IsAllDay,
                        SendReminder = x.SendReminder,
                        AppointmentSMS = x.AppointmentSMS,
                        IgnoreDidNotCome = x.IgnoreDidNotCome,
                        CreatorId = x.CreatorId,
                        ByInvoice = x.ByInvoice,
                        DoctorName = x.DoctorName,
                        PatientName = x.PatientName,
                        Color = x.Color,
                        Status = status
                    };
                }).ToList();

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<TreatmentsContext>> GetTreatments(int appointmentId)
        {
            try
            {
                var result = await _context.Treatments.Where(t => t.AppointmentId == appointmentId).ToListAsync();

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteTreatment(int id)
        {
            var result = new GlobalResponse();

            try
            {
                var treatment = await _context.Treatments.FindAsync(id);
                if (treatment == null)
                    throw new Exception("Treatment Not Found");

                _context.Treatments.Remove(treatment);
                await _context.SaveChangesAsync();
                result.Message = "Treatment Deleted Successfully";
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<GetTodayAppointmentsInfoDto>> GetTodayAppointments(GetTodayAppointmentsDto model)
        {
            try
            {
                var userId = _token.GetUserId();
                var userRole = _token.GetUserRole();

                var today = DateTime.Today;

                var query = _context.Appointments.AsQueryable();

                if (!model.FromDate.HasValue && !model.ToDate.HasValue)
                {
                    query = query.Where(a => a.Start.Date <= today && a.End.Date >= today);
                }
                else
                {
                    var fromDate = model.FromDate.Value.Date;
                    var toDate = model.ToDate.Value.Date;
                    query = query.Where(a => a.Start.Date >= fromDate && a.End.Date <= toDate);
                }

                if (model.Clinic.HasValue)
                    query = query.Where(a => a.BusinessId == model.Clinic.Value);

                if (model.From.HasValue && model.To.HasValue)
                {
                    var from = model.From.Value;
                    var to = model.To.Value;

                    query = query.Where(a =>
                        (a.Start.Hour > from.Hour || (a.Start.Hour == from.Hour && a.Start.Minute >= from.Minute)) &&
                        (a.Start.Hour < to.Hour || (a.Start.Hour == to.Hour && a.Start.Minute <= to.Minute)));
                }

                if (model.Service.HasValue)
                {
                    int serviceId = model.Service.Value;

                    query = query.Where(a =>
                        _context.Treatments.Any(t =>
                            t.AppointmentId == a.Id &&
                            _context.BillableItems.Any(b =>
                                b.TreatmentTemplateId == t.TreatmentTemplateId &&
                                b.Id == serviceId)));
                }

                var baseAppointments = await (
                    from a in query
                    join p in _context.Patients on a.PatientId equals p.Id
                    join u in _context.Users on a.PractitionerId equals u.Id
                    join at in _context.AppointmentTypes on a.AppointmentTypeId equals at.Id
                    join ph in _context.PatientPhones on p.Id equals ph.PatientId into phg
                    from ph in phg.OrderByDescending(x => x.CreatedOn).Take(1).DefaultIfEmpty()
                    select new
                    {
                        a.Id,
                        a.Start,
                        a.Arrived,
                        PatientId = p.Id,
                        PatientName = (p.FirstName + " " + p.LastName).Trim(),
                        PractitionerId = u.Id,
                        PractitionerName = (u.FirstName + " " + u.LastName).Trim(),
                        AppointmentTypeName = at.Name,
                        PhoneNumber = ph != null ? ph.Number : null
                    }
                ).ToListAsync();

                if (userRole == "Doctor")
                {
                    baseAppointments = baseAppointments
                        .Where(x => x.PractitionerId == userId)
                        .ToList();
                }

                var appointmentIds = baseAppointments.Select(x => x.Id).ToList();

                var invoices = await _context.Invoices
                    .Where(i =>
                        i.AppointmentId.HasValue &&
                        appointmentIds.Contains(i.AppointmentId.Value) &&
                        (i.IsCanceled == false || i.IsCanceled == null))
                    .Select(i => new
                    {
                        i.Id,
                        i.AppointmentId,
                        i.TotalDiscount,
                        i.Receipt
                    })
                    .ToListAsync();

                var invoiceLookup = invoices
                    .GroupBy(i => i.AppointmentId!.Value)
                    .ToDictionary(g => g.Key, g => g.First());

                var invoiceItemLookup = await (
                    from ii in _context.InvoiceItems
                    join inv in _context.Invoices on ii.InvoiceId equals inv.Id
                    where inv.AppointmentId.HasValue &&
                          appointmentIds.Contains(inv.AppointmentId.Value)
                    join bi in _context.BillableItems on ii.ItemId equals bi.Id
                    select new
                    {
                        AppointmentId = inv.AppointmentId!.Value,
                        ii.Id,
                        bi.Name,
                        ii.Done
                    }
                ).ToListAsync();

                var billableLookup = invoiceItemLookup
                    .GroupBy(x => x.AppointmentId)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(x => new BillableItemDoneDto
                        {
                            InvoiceItemId = x.Id,
                            Name = x.Name,
                            Done = x.Done
                        }).ToList()
                    );

                var treatmentSet = await _context.Treatments
                    .Where(t =>
                        t.AppointmentId.HasValue &&
                        appointmentIds.Contains(t.AppointmentId.Value))
                    .Select(t => t.AppointmentId!.Value)
                    .Distinct()
                    .ToHashSetAsync();

                var result = baseAppointments.Select(x =>
                {
                    invoiceLookup.TryGetValue(x.Id, out var invoice);
                    billableLookup.TryGetValue(x.Id, out var billables);

                    var hasInvoice = invoice != null;
                    var hasTreatment = treatmentSet.Contains(x.Id);

                    return new GetTodayAppointmentsInfoDto
                    {
                        Id = x.Id,
                        Date = x.Start.Date,
                        Time = x.Start.ToString("HH:mm"),
                        FullDate = x.Start,
                        PatientName = x.PatientName,
                        PatientId = x.PatientId,
                        PractitionerName = x.PractitionerName,
                        AppointmentTypeName = x.AppointmentTypeName,
                        BillableItems = billables ?? new List<BillableItemDoneDto>(),
                        Status =
                            !hasInvoice && !hasTreatment ? 1 :
                            hasInvoice && !hasTreatment ? 2 :
                            hasInvoice && hasTreatment ? 3 : 0,
                        PatientPhone = x.PhoneNumber,
                        Arrived = x.Arrived,
                        TotalDiscount = invoice?.TotalDiscount,
                        InvoiceId = invoice?.Id,
                        Receipt = invoice.Receipt
                    };
                }).ToList();

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SaveAppointmentType(SaveAppointmentTypeDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();

                if (model.EditOrNew == -1)
                {
                    var appointmentType = _mapper.Map<AppointmentTypesContext>(model);
                    appointmentType.CreatorId = userId;
                    appointmentType.CreatedOn = DateTime.Now;
                    _context.AppointmentTypes.Add(appointmentType);
                    await _context.SaveChangesAsync();
                    result.Message = "Appointment Type Saved Successfully";
                    return result;
                }
                else
                {
                    var existingAppointmentType = await _context.AppointmentTypes.FirstOrDefaultAsync(b => b.Id == model.EditOrNew);

                    if (existingAppointmentType == null)
                    {
                        throw new Exception("Appointment Type Not Found");
                    }

                    _mapper.Map(model, existingAppointmentType);
                    existingAppointmentType.ModifierId = userId;
                    existingAppointmentType.LastUpdated = DateTime.Now;
                    _context.AppointmentTypes.Update(existingAppointmentType);
                    await _context.SaveChangesAsync();
                    result.Message = "Appointment Type Updated Successfully";
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<GetAppointmentTypesResponse>> GetAppointmentTypes()
        {
            try
            {
                var query =
               from a in _context.AppointmentTypes

               join b1 in _context.BillableItems
                   on a.RelatedBillableItemId equals b1.Id into b1g
               from b1 in b1g.DefaultIfEmpty()

               join b2 in _context.BillableItems
                   on a.RelatedBillableItem2Id equals b2.Id into b2g
               from b2 in b2g.DefaultIfEmpty()

               join b3 in _context.BillableItems
                   on a.RelatedBillableItem3Id equals b3.Id into b3g
               from b3 in b3g.DefaultIfEmpty()

               join p1 in _context.Products
                   on a.RelatedProductId equals p1.Id into p1g
               from p1 in p1g.DefaultIfEmpty()

               join p2 in _context.Products
                   on a.RelatedProduct2Id equals p2.Id into p2g
               from p2 in p2g.DefaultIfEmpty()

               join p3 in _context.Products
                   on a.RelatedProduct3Id equals p3.Id into p3g
               from p3 in p3g.DefaultIfEmpty()

               select new GetAppointmentTypesResponse
               {
                   Id = a.Id,
                   Name = a.Name,
                   Description = a.Description,
                   Category = a.Category,
                   Duration = a.Duration,
                   MaximumNumberOfPatients = a.MaximumNumberOfPatients,

                   RelatedBillableItemId = a.RelatedBillableItemId,
                   BillableItemName = b1 != null ? b1.Name : null,

                   RelatedBillableItem2Id = a.RelatedBillableItem2Id,
                   BillableItemName2 = b2 != null ? b2.Name : null,

                   RelatedBillableItem3Id = a.RelatedBillableItem3Id,
                   BillableItemName3 = b3 != null ? b3.Name : null,

                   DefaultTreatmentNoteTemplate = a.DefaultTreatmentNoteTemplate,

                   RelatedProductId = a.RelatedProductId,
                   ProductName = p1 != null ? p1.Name : null,

                   RelatedProduct2Id = a.RelatedProduct2Id,
                   ProductName2 = p2 != null ? p2.Name : null,

                   RelatedProduct3Id = a.RelatedProduct3Id,
                   ProductName3 = p3 != null ? p3.Name : null,

                   Color = a.Color,
                   SendBookingConfirmationEmail = a.SendBookingConfirmationEmail,
                   SendReminderEmail = a.SendReminderEmail,
                   ShowInOnlineBookings = a.ShowInOnlineBookings,
                   ModifierId = a.ModifierId,
                   CreatedOn = a.CreatedOn,
                   LastUpdated = a.LastUpdated,
                   CreatorId = a.CreatorId,
                   IsFirstEncounter = a.IsFirstEncounter
               };

                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteAppointmentType(int id)
        {
            var result = new GlobalResponse();

            try
            {
                var appointmentType = await _context.AppointmentTypes.FindAsync(id);
                if (appointmentType == null)
                    throw new Exception("Appointment Type Not Found");

                _context.AppointmentTypes.Remove(appointmentType);
                await _context.SaveChangesAsync();
                result.Message = "Appointment Type Deleted Successfully";
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<List<GetTodayAppointmentsInfoDto>> GetWeekAppointments(GetAppointmentsDto model)
        {
            try
            {
                var iranTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Iran Standard Time");
                var iranNow = TimeZoneInfo.ConvertTime(DateTime.Now, iranTimeZone);

                var baseDate = model.Date?.Date ?? iranNow.Date;

                var weekStartUtc = TimeZoneInfo.ConvertTimeToUtc(baseDate, iranTimeZone);
                var weekEndUtc = weekStartUtc.AddDays(7);

                List<int>? doctorIds = null;

                var userRole = _token.GetUserRole();

                if (userRole == "Doctor")
                {
                    doctorIds = new List<int> { _token.GetUserId() };
                }
                else if (!string.IsNullOrWhiteSpace(model.DoctorId))
                {
                    doctorIds = model.DoctorId
                        .Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(x => x.Trim())
                        .Where(x => int.TryParse(x, out _))
                        .Select(int.Parse)
                        .ToList();
                }

                IQueryable<AppointmentsContext> baseQuery = _context.Appointments
                    .Where(a => a.Start >= weekStartUtc && a.Start < weekEndUtc);

                if (model.ClinicId.HasValue)
                {
                    baseQuery = baseQuery.Where(a => a.BusinessId == model.ClinicId.Value);
                }

                if (doctorIds != null)
                {
                    baseQuery = baseQuery.Where(a =>
                        a.PractitionerId.HasValue &&
                        doctorIds.Contains(a.PractitionerId.Value));
                }

                var appointments = await (
                    from a in baseQuery

                    join p in _context.Patients
                        on a.PatientId equals p.Id into pJoin
                    from p in pJoin.DefaultIfEmpty()

                    join at in _context.AppointmentTypes
                        on a.AppointmentTypeId equals at.Id into atJoin
                    from at in atJoin.DefaultIfEmpty()

                    join u in _context.Users
                        on a.PractitionerId equals u.Id into uJoin
                    from u in uJoin.DefaultIfEmpty()

                    join t in _context.Treatments
                        on a.Id equals t.AppointmentId into tJoin
                    from t in tJoin.DefaultIfEmpty()

                    join b in _context.BillableItems
                        on t.TreatmentTemplateId equals b.TreatmentTemplateId into bJoin
                    from b in bJoin.DefaultIfEmpty()

                    select new
                    {
                        Appointment = a,
                        PatientName = p != null ? p.FirstName + " " + p.LastName : string.Empty,
                        AppointmentTypeName = at != null ? at.Name : string.Empty,
                        PractitionerName = u != null ? u.FirstName + " " + u.LastName : string.Empty,
                        BillableItemName = b != null ? b.Name : string.Empty,
                        AppointmentColor = at != null ? at.Color : null
                    }
                )
                .AsNoTracking()
                .ToListAsync();

                var result = new List<GetTodayAppointmentsInfoDto>();

                for (int i = 0; i < 7; i++)
                {
                    var dayUtc = weekStartUtc.AddDays(i);

                    if (dayUtc.DayOfWeek == DayOfWeek.Friday)
                        continue;

                    int dayNumber = ((int)dayUtc.DayOfWeek + 1) % 7;
                    if (dayNumber == 0) dayNumber = 7;

                    var dayDate = dayUtc.Date;

                    var dayAppointments = appointments
                        .Where(x => x.Appointment.Start.Date == dayDate)
                        .Select(x => new GetTodayAppointmentsInfoDto
                        {
                            Id = x.Appointment.Id,
                            Time = x.Appointment.Start.ToString("HH:mm"),
                            PatientName = x.PatientName,
                            AppointmentTypeName = x.AppointmentTypeName,
                            BillableItemName = x.BillableItemName,
                            PractitionerName = x.PractitionerName,
                            Date = x.Appointment.Start.Date,
                            DayNumber = dayNumber,
                            FullDate = x.Appointment.Start,
                            Color = x.AppointmentColor,
                            Note = x.Appointment.Note
                        })
                        .ToList();

                    result.AddRange(dayAppointments);
                }

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        #region Services
        public async Task<IEnumerable<GetBillableItemsResponse>> GetBillableItems()
        {
            try
            {
                var result = await (from b in _context.BillableItems
                                    join t in _context.TreatmentTemplates on b.TreatmentTemplateId equals t.Id
                                    select new GetBillableItemsResponse
                                    {
                                        Id = b.Id,
                                        Code = b.Code,
                                        Name = b.Name,
                                        Price = b.Price,
                                        IsOther = b.IsOther,
                                        ItemTypeId = b.ItemTypeId,
                                        ModifierId = b.ModifierId,
                                        CreatedOn = b.CreatedOn,
                                        LastUpdated = b.LastUpdated,
                                        Duration = b.Duration,
                                        AllowEditPrice = b.AllowEditPrice,
                                        CreatorId = b.CreatorId,
                                        TreatmentTemplateId = b.TreatmentTemplateId,
                                        ForceOneInvoice = b.ForceOneInvoice,
                                        IsTreatmentDataRequired = b.IsTreatmentDataRequired,
                                        Group = b.Group,
                                        ParentId = b.ParentId,
                                        ItemCategoryId = b.ItemCategoryId,
                                        OrderInItemCategory = b.OrderInItemCategory,
                                        AutoCopyTreatment = b.AutoCopyTreatment,
                                        DiscountPercent = b.DiscountPercent,
                                        NeedAccept = b.NeedAccept,
                                        LastTimeColor = b.LastTimeColor,
                                        TemplateName = t.Name
                                    }).ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SaveBillableItem(SaveBillableItemsDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();

                if (model.EditOrNew == -1)
                {
                    var billableItems = _mapper.Map<BillableItemsContext>(model);
                    billableItems.CreatorId = userId;
                    billableItems.CreatedOn = DateTime.Now;
                    _context.BillableItems.Add(billableItems);
                    await _context.SaveChangesAsync();
                    result.Message = "BillableItem Saved Successfully";
                    return result;
                }
                else
                {
                    var existingBillable = await _context.BillableItems.FirstOrDefaultAsync(b => b.Id == model.EditOrNew);

                    if (existingBillable == null)
                    {
                        throw new Exception("BillableItem Not Found");
                    }

                    _mapper.Map(model, existingBillable);
                    existingBillable.ModifierId = userId;
                    existingBillable.LastUpdated = DateTime.Now;
                    _context.BillableItems.Update(existingBillable);
                    await _context.SaveChangesAsync();
                    result.Message = "BillableItem Updated Successfully";
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteBillableItem(int id)
        {
            var result = new GlobalResponse();

            try
            {
                var billableItem = await _context.BillableItems.FindAsync(id);

                if (billableItem == null)
                {
                    throw new Exception("BillableItem Not Found");
                }

                _context.BillableItems.Remove(billableItem);
                await _context.SaveChangesAsync();
                result.Message = "BillableItem Deleted Successfully";
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SaveItemCategory(SaveItemCategoryDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();

                if (model.EditOrNew == -1)
                {
                    var itemCategory = _mapper.Map<ItemCategoriesContext>(model);
                    itemCategory.CreatorId = userId;
                    itemCategory.CreatedOn = DateTime.Now;
                    _context.ItemCategories.Add(itemCategory);
                    await _context.SaveChangesAsync();
                    result.Message = "ItemCategory Saved Successfully";
                    return result;
                }
                else
                {
                    var eItemCategory = await _context.ItemCategories.FirstOrDefaultAsync(i => i.Id == model.EditOrNew);
                    if (eItemCategory == null)
                    {
                        throw new Exception("ItemCategory Not Found");
                    }

                    _mapper.Map(model, eItemCategory);
                    eItemCategory.ModifierId = userId;
                    eItemCategory.LastUpdated = DateTime.Now;
                    _context.ItemCategories.Update(eItemCategory);
                    await _context.SaveChangesAsync();
                    result.Message = "ItemCategory Updated Successfully";
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<ItemCategoriesContext>> GetItemCategory()
        {
            try
            {
                var result = await _context.ItemCategories.ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteItemCategory(int id)
        {
            var result = new GlobalResponse();

            try
            {
                var item = await _context.ItemCategories.FindAsync(id);

                if (item == null)
                {
                    throw new Exception("ItemCategory Not Found");
                }

                _context.ItemCategories.Remove(item);
                await _context.SaveChangesAsync();
                result.Message = "ItemCategory Deleted Successfully";
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        #endregion

        public async Task<IEnumerable<SectionsContext>> GetSectionPerService(int serviceId)
        {
            try
            {
                var res = await _context.Sections.Where(s => s.TreatmentTemplateId == serviceId).ToListAsync();
                return res;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<QuestionsContext>> GetQuestionsPerSection(int sectionId)
        {
            try
            {
                var res = await _context.Questions.Where(q => q.SectionId == sectionId).ToListAsync();
                return res;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<AnswersContext>> GetAnswersPerQuestion(int questionId)
        {
            try
            {
                var res = await _context.Answers.Where(a => a.Question_Id == questionId).ToListAsync();
                return res;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<GetServicesPerPatientResponse>> GetPatientServices(int patientId)
        {
            try
            {
                var result = await (
                    from inv in _context.Invoices
                    join item in _context.InvoiceItems on inv.Id equals item.InvoiceId
                    join bill in _context.BillableItems on item.ItemId equals bill.Id
                    join ic in _context.ItemCategories on bill.ItemCategoryId equals ic.Id
                    join doc in _context.Users on inv.PractitionerId equals doc.Id
                    where inv.PatientId == patientId
                    select new GetServicesPerPatientResponse
                    {
                        InvoiceId = inv.Id,
                        InvoiceItemId = item.Id,
                        TreatmentTemplateId = bill.TreatmentTemplateId,
                        BillableItemName = bill.Name,
                        BillableItemPrice = bill.Price,
                        ItemCategoryId = bill.ItemCategoryId,
                        ItemCategoryName = ic.Name,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        DoctorName = doc.FirstName + " " + doc.LastName,
                        CreatedDate = inv.CreatedOn,
                        Amount = item.Amount
                    }
                ).ToListAsync();

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<GetPatientTreatmentsResponse>> GetPatientTreatments(int patientId)
        {
            try
            {
                var treatments = await _context.Treatments
        .Where(t => t.PatientId == patientId)
        .ToListAsync();

                if (!treatments.Any())
                    return Enumerable.Empty<GetPatientTreatmentsResponse>();

                var treatmentIds = treatments.Select(t => t.Id).ToList();
                var treatmentTemplateIds = treatments
                    .Select(t => t.TreatmentTemplateId)
                    .Distinct()
                    .ToList();

                var templates = await _context.TreatmentTemplates
                    .Where(tt => treatmentTemplateIds.Contains(tt.Id))
                    .ToListAsync();

                var billableItems = await _context.BillableItems
                    .Where(bi => bi.TreatmentTemplateId != null &&
                                 treatmentTemplateIds.Contains(bi.TreatmentTemplateId.Value))
                    .ToListAsync();

                var sections = await _context.Sections
                    .Where(s => treatmentTemplateIds.Contains(s.TreatmentTemplateId))
                    .ToListAsync();

                var sectionIds = sections.Select(s => s.Id).ToList();

                var questions = await _context.Questions
                    .Where(q => q.SectionId != null && sectionIds.Contains(q.SectionId))
                    .ToListAsync();

                var questionIds = questions.Select(q => q.Id).ToList();

                var answers = await _context.Answers
                    .Where(a => a.Question_Id != null && questionIds.Contains(a.Question_Id.Value))
                    .ToListAsync();

                var questionValues = await _context.QuestionValues
                    .Where(qv => qv.TreatmentId != null && treatmentIds.Contains(qv.TreatmentId))
                    .ToListAsync();

                var attachments = await _context.FileAttachments
                    .Where(f => f.TreatmentId != null && treatmentIds.Contains(f.TreatmentId.Value))
                    .ToListAsync();

                var templatesById = templates.ToDictionary(x => x.Id);

                var billableByTemplateId = billableItems
                    .Where(x => x.TreatmentTemplateId.HasValue)
                    .GroupBy(x => x.TreatmentTemplateId!.Value)
                    .ToDictionary(x => x.Key, x => x.First());

                var sectionsByTemplateId = sections
                    .GroupBy(x => x.TreatmentTemplateId)
                    .ToDictionary(x => x.Key, x => x.ToList());

                var questionsBySectionId = questions
                    .GroupBy(x => x.SectionId!)
                    .ToDictionary(x => x.Key, x => x.ToList());

                var answersById = answers.ToDictionary(x => x.Id);

                var questionValuesByTreatment = questionValues
                    .GroupBy(x => x.TreatmentId!)
                    .ToDictionary(x => x.Key, x => x.ToList());

                var attachmentsByTreatment = attachments
                    .GroupBy(x => x.TreatmentId!.Value)
                    .ToDictionary(x => x.Key, x => x.ToList());

                var result = treatments.Select(treatment =>
                {
                    templatesById.TryGetValue(treatment.TreatmentTemplateId, out var template);
                    billableByTemplateId.TryGetValue(treatment.TreatmentTemplateId, out var billableItem);

                    sectionsByTemplateId.TryGetValue(treatment.TreatmentTemplateId, out var sectionList);
                    sectionList ??= new List<SectionsContext>();

                    questionValuesByTreatment.TryGetValue(treatment.Id, out var treatmentQuestionValues);
                    treatmentQuestionValues ??= new List<QuestionValuesContext>();

                    var sectionDtos = sectionList.Select(section =>
                    {
                        questionsBySectionId.TryGetValue(section.Id, out var questionList);
                        questionList ??= new List<QuestionsContext>();

                        var questionDtos = questionList.Select(question =>
                        {
                            var qv = treatmentQuestionValues
                                .FirstOrDefault(v => v.QuestionId == question.Id);

                            object? finalSelectedValue = qv?.selectedValue;
                            var selectedIds = new List<int>();

                            if (!string.IsNullOrWhiteSpace(qv?.AnswerId))
                            {
                                selectedIds = qv.AnswerId
                                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                                    .Select(x => int.TryParse(x.Trim(), out var id) ? id : -1)
                                    .Where(id => id > 0)
                                    .ToList();

                                finalSelectedValue = selectedIds
                                    .Where(id => answersById.ContainsKey(id))
                                    .Select(id => new
                                    {
                                        Id = id,
                                        Title = answersById[id].title
                                    })
                                    .Cast<object>()
                                    .ToList();
                            }

                            var answerDtos = selectedIds
                                .Where(id => answersById.ContainsKey(id))
                                .Select(id => new AnswerDto
                                {
                                    Id = id,
                                    Title = answersById[id].title,
                                    Text = answersById[id].text
                                })
                                .ToList();

                            return new QuestionDto
                            {
                                Id = question.Id,
                                Title = question.title,
                                Type = question.type,
                                SelectedValue = finalSelectedValue,
                                Answers = answerDtos
                            };
                        }).ToList();

                        return new SectionDto
                        {
                            Id = section.Id,
                            Title = section.title,
                            Questions = questionDtos
                        };
                    }).ToList();

                    attachmentsByTreatment.TryGetValue(treatment.Id, out var attachmentList);
                    attachmentList ??= new List<FileAttachmentsContext>();

                    var attachmentDtos = attachmentList.Select(f => new AttachmentDto
                    {
                        Id = f.Id,
                        FileName = f.FileName,
                        Description = f.Description,
                        FileSize = f.FileSize
                    }).ToList();

                    return new GetPatientTreatmentsResponse
                    {
                        TreatmentId = treatment.Id,
                        AppointmentId = treatment.AppointmentId,
                        TemplateTitle = template?.Title,
                        BillableItemId = billableItem?.Id,
                        TreatmentTemplateId = template?.Id,
                        InvoiceItemId = treatment.InvoiceItemId,
                        Sections = sectionDtos,
                        Attachments = attachmentDtos
                    };
                }).ToList();

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<TreatmentTemplatesContext>> GetTreatmentTemplates(GetTreatmentTemplateDto model)
        {
            try
            {
                if (model.Id == null)
                {
                    var result = await _context.TreatmentTemplates.ToListAsync();
                    return result;
                }
                else
                {
                    var result = await _context.TreatmentTemplates.Where(t => t.Id == model.Id).ToListAsync();
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SavePatientArrived(int appointmentId)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();
                var res = await _context.Appointments.FirstOrDefaultAsync(a => a.Id == appointmentId);
                if (res == null)
                {
                    throw new Exception("Appointment Not Found");
                }

                res.Arrived = 1;
                res.ModifierId = userId;
                res.LastUpdated = DateTime.Now;
                _context.Appointments.Update(res);
                await _context.SaveChangesAsync();
                result.Message = "Appointment Updated Successfully";
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> CancelAppointment(int appointmentId)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();

                var existingAppointment = await _context.Appointments.FirstOrDefaultAsync(e => e.Id == appointmentId);
                if (existingAppointment == null)
                {
                    throw new Exception("Appointment Not Found");
                }

                existingAppointment.ModifierId = userId;
                existingAppointment.LastUpdated = DateTime.Now;
                existingAppointment.Cancelled = true;
                _context.Appointments.Update(existingAppointment);
                await _context.SaveChangesAsync();
                result.Message = "Appointment Canceled Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SaveTreatmentTemplate(SaveTreatmentTemplateDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();

                if (model.EditOrNew == -1)
                {
                    var treatmentTemplate = _mapper.Map<TreatmentTemplatesContext>(model);
                    treatmentTemplate.CreatorId = userId;
                    treatmentTemplate.CreatedOn = DateTime.Now;
                    _context.TreatmentTemplates.Add(treatmentTemplate);
                    await _context.SaveChangesAsync();
                    result.Message = "Treatment Template Saved Successfully";
                    return result;
                }
                else
                {
                    var existingTreatmentTemplate = await _context.TreatmentTemplates.FirstOrDefaultAsync(b => b.Id == model.EditOrNew);

                    if (existingTreatmentTemplate == null)
                    {
                        throw new Exception("Treatment Template Not Found");
                    }

                    _mapper.Map(model, existingTreatmentTemplate);
                    existingTreatmentTemplate.ModifierId = userId;
                    existingTreatmentTemplate.LastUpdated = DateTime.Now;
                    _context.TreatmentTemplates.Update(existingTreatmentTemplate);
                    await _context.SaveChangesAsync();
                    result.Message = "Treatment Template Updated Successfully";
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<TreatmentTemplatesContext>> GetTreatmentTemplates()
        {
            try
            {
                var treatmentTemplate = await _context.TreatmentTemplates.ToListAsync();
                return treatmentTemplate;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteTreatmentTemplate(int id)
        {
            var result = new GlobalResponse();

            try
            {
                var treatmentTemplate = await _context.TreatmentTemplates.FindAsync(id);
                if (treatmentTemplate == null)
                    throw new Exception("Treatment Template Not Found");

                _context.TreatmentTemplates.Remove(treatmentTemplate);
                await _context.SaveChangesAsync();
                result.Message = "Treatment Template Deleted Successfully";
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
