using AutoMapper;
using Clinic.Api.Application.DTOs;
using Clinic.Api.Application.DTOs.Treatments;
using Clinic.Api.Application.Interfaces;
using Clinic.Api.Domain.Entities;
using Clinic.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;

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

                    model.ByInvoice = true;
                    var appointment = _mapper.Map<AppointmentsContext>(model);
                    appointment.CreatorId = userId;
                    appointment.CreatedOn = DateTime.Now;
                    _context.Appointments.Add(appointment);
                    await _context.SaveChangesAsync();
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
                    doctorIds = new List<int> { _token.GetUserId() };
                }

                var selectedDate = model.Date?.Date ?? DateTime.Today;

                var baseAppointments = await (
                    from a in _context.Appointments
                    where
                        (a.BusinessId == model.ClinicId)
                        && (doctorIds == null || (a.PractitionerId.HasValue && doctorIds.Contains(a.PractitionerId.Value)))
                        && a.Start.Date <= selectedDate
                        && a.End.Date >= selectedDate
                        && a.Cancelled != true
                    join u in _context.Users on a.PractitionerId equals u.Id into uname
                    from u in uname.DefaultIfEmpty()
                    join p in _context.Patients on a.PatientId equals p.Id into patientname
                    from p in patientname.DefaultIfEmpty()
                    join at in _context.AppointmentTypes on a.AppointmentTypeId equals at.Id into appointmenttype
                    from at in appointmenttype.DefaultIfEmpty()
                    select new
                    {
                        Appointment = a,
                        DoctorName = u.FirstName + " " + u.LastName,
                        PatientName = p.FirstName + " " + p.LastName,
                        Color = at.Color
                    }
                ).ToListAsync();

                var appointmentIds = baseAppointments.Select(x => x.Appointment.Id).ToList();

                var invoices = await _context.Invoices
                    .Where(i =>
                        i.AppointmentId.HasValue &&
                        appointmentIds.Contains(i.AppointmentId.Value) &&
                        (i.IsCanceled == false || i.IsCanceled == null))
                    .ToListAsync();

                var treatments = await _context.Treatments
                    .Where(t =>
                        t.AppointmentId.HasValue &&
                        appointmentIds.Contains(t.AppointmentId.Value))
                    .ToListAsync();

                var result = baseAppointments.Select(x =>
                {
                    var appointmentId = x.Appointment.Id;

                    var hasInvoice = invoices.Any(i => i.AppointmentId == appointmentId);
                    var hasTreatment = treatments.Any(t => t.AppointmentId == appointmentId);

                    var status =
                        !hasInvoice && !hasTreatment ? 1 :
                        hasInvoice && !hasTreatment ? 2 :
                        hasInvoice && hasTreatment ? 3 :
                        0;

                    return new GetAppointmentsResponse
                    {
                        Id = x.Appointment.Id,
                        BusinessId = x.Appointment.BusinessId,
                        PractitionerId = x.Appointment.PractitionerId,
                        PatientId = x.Appointment.PatientId,
                        AppointmentTypeId = x.Appointment.AppointmentTypeId,
                        Start = x.Appointment.Start,
                        End = x.Appointment.End,
                        RepeatId = x.Appointment.RepeatId,
                        RepeatEvery = x.Appointment.RepeatEvery,
                        EndsAfter = x.Appointment.EndsAfter,
                        Note = x.Appointment.Note,
                        Arrived = x.Appointment.Arrived,
                        WaitListId = x.Appointment.WaitListId,
                        Cancelled = x.Appointment.Cancelled,
                        AppointmentCancelTypeId = x.Appointment.AppointmentCancelTypeId,
                        CancelNotes = x.Appointment.CancelNotes,
                        IsUnavailbleBlock = x.Appointment.IsUnavailbleBlock,
                        ModifierId = x.Appointment.ModifierId,
                        CreatedOn = x.Appointment.CreatedOn,
                        LastUpdated = x.Appointment.LastUpdated,
                        IsAllDay = x.Appointment.IsAllDay,
                        SendReminder = x.Appointment.SendReminder,
                        AppointmentSMS = x.Appointment.AppointmentSMS,
                        IgnoreDidNotCome = x.Appointment.IgnoreDidNotCome,
                        CreatorId = x.Appointment.CreatorId,
                        ByInvoice = x.Appointment.ByInvoice,
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
                        (from t in _context.Treatments
                         join b in _context.BillableItems on t.TreatmentTemplateId equals b.TreatmentTemplateId
                         where t.AppointmentId == a.Id && b.Id == serviceId
                         select t).Any());
                }

                var baseQuery = await (
                    from a in query
                    join p in _context.Patients on a.PatientId equals p.Id
                    join u in _context.Users on a.PractitionerId equals u.Id
                    join at in _context.AppointmentTypes on a.AppointmentTypeId equals at.Id
                    join ph in _context.PatientPhones on p.Id equals ph.PatientId into phoneGroup
                    from ph in phoneGroup.OrderByDescending(x => x.CreatedOn).Take(1).DefaultIfEmpty()
                    select new
                    {
                        Appointment = a,
                        Patient = p,
                        Practitioner = u,
                        AppointmentType = at,
                        PhoneNumber = ph != null ? ph.Number : null
                    }
                ).ToListAsync();

                if (userRole == "Doctor")
                    baseQuery = baseQuery.Where(x => x.Appointment.PractitionerId == userId).ToList();

                var grouped = baseQuery
                    .GroupBy(r => r.Appointment.Id)
                    .Select(g => g.First())
                    .ToList();

                var appointmentIds = grouped.Select(r => r.Appointment.Id).ToList();

                var invoices = await _context.Invoices
     .Where(i => i.AppointmentId.HasValue &&
                 appointmentIds.Contains(i.AppointmentId.Value))
     .ToListAsync();

                var invoiceIds = invoices.Select(i => i.Id).ToList();

                var invoiceItems = await _context.InvoiceItems
    .Join(_context.Invoices,
        ii => ii.InvoiceId,
        i => i.Id,
        (ii, i) => new { InvoiceItem = ii, Invoice = i })
    .Where(x => x.Invoice.AppointmentId.HasValue &&
                appointmentIds.Contains(x.Invoice.AppointmentId.Value))
    .Select(x => x.InvoiceItem)
    .ToListAsync();

                var billableItems = await _context.BillableItems.ToListAsync();

                var treatments = await _context.Treatments
                    .Where(t => t.AppointmentId.HasValue &&
                                appointmentIds.Contains(t.AppointmentId.Value))
                    .ToListAsync();

                var final = grouped.Select(r =>
                {
                    var appointmentId = r.Appointment.Id;

                    var relatedInvoice = invoices
                        .Where(i => i.AppointmentId == appointmentId && (i.IsCanceled == false || i.IsCanceled == null))
                        .ToList();

                    var relatedInvoiceItems = (
        from ii in _context.InvoiceItems
        join inv in _context.Invoices
            on ii.InvoiceId equals inv.Id
        where inv.AppointmentId == appointmentId
        select ii
    ).ToList();

                    var relatedBillableItems =
                        (from bi in billableItems
                         join ii in relatedInvoiceItems on bi.Id equals ii.ItemId
                         select new BillableItemDoneDto
                         {
                             InvoiceItemId = ii.Id,
                             Name = bi.Name,
                             Done = ii.Done
                         }).ToList();

                    var relatedTreatments = treatments
                        .Where(t => t.AppointmentId == appointmentId)
                        .ToList();

                    var hasInvoice = relatedInvoice.Any();
                    var hasTreatment = relatedTreatments.Any();

                    return new GetTodayAppointmentsInfoDto
                    {
                        Id = appointmentId,
                        Date = r.Appointment.Start.Date,
                        Time = r.Appointment.Start.ToString("HH:mm"),
                        FullDate = r.Appointment.Start,
                        PatientName = (r.Patient.FirstName + " " + r.Patient.LastName).Trim(),
                        PatientId = r.Patient.Id,
                        PractitionerName = (r.Practitioner.FirstName + " " + r.Practitioner.LastName).Trim(),
                        AppointmentTypeName = r.AppointmentType.Name,

                        BillableItems = relatedBillableItems,

                        Status = !hasInvoice && !hasTreatment ? 1 :
                                 hasInvoice && !hasTreatment ? 2 :
                                 hasInvoice && hasTreatment ? 3 : 0,

                        PatientPhone = r.PhoneNumber,
                        Arrived = r.Appointment.Arrived,

                        TotalDiscount = relatedInvoice.Select(i => i.TotalDiscount).FirstOrDefault(),
                        InvoiceId = relatedInvoice.Select(i => i.Id).FirstOrDefault(),
                        Receipt = relatedInvoice.Select(i => i.Receipt).FirstOrDefault()
                    };
                })
                .ToList();

                return final;
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
                var result = await (from a in _context.AppointmentTypes
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
                                    }).ToListAsync();
                return result;
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

                var weekStartUtc = TimeZoneInfo.ConvertTimeToUtc(
                    baseDate,
                    iranTimeZone
                );

                var weekEndUtc = weekStartUtc.AddDays(7);

                List<int>? doctorIds = null;

                if (_token.GetUserRole() == "Doctor")
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


                var query =
                    from a in _context.Appointments
                    where a.Start >= weekStartUtc && a.Start < weekEndUtc
                    select a;

                if (model.ClinicId.HasValue)
                {
                    query = query.Where(a => a.BusinessId == model.ClinicId.Value);
                }

                if (doctorIds != null)
                {
                    query = query.Where(a => doctorIds.Contains(a.PractitionerId.Value));
                }

                var appointments = await (
                    from a in query
                    join p in _context.Patients on a.PatientId equals p.Id into patientJoin
                    from p in patientJoin.DefaultIfEmpty()

                    join at in _context.AppointmentTypes on a.AppointmentTypeId equals at.Id into atJoin
                    from at in atJoin.DefaultIfEmpty()

                    join u in _context.Users on a.PractitionerId equals u.Id into userJoin
                    from u in userJoin.DefaultIfEmpty()

                    join t in _context.Treatments on a.Id equals t.AppointmentId into treatmentJoin
                    from t in treatmentJoin.DefaultIfEmpty()

                    join b in _context.BillableItems
                        on t.TreatmentTemplateId equals b.TreatmentTemplateId into billableJoin
                    from b in billableJoin.DefaultIfEmpty()

                    select new
                    {
                        Appointment = a,
                        PatientName = (p.FirstName + " " + p.LastName) ?? string.Empty,
                        AppointmentTypeName = at.Name ?? string.Empty,
                        PractitionerName = (u.FirstName + " " + u.LastName) ?? string.Empty,
                        BillableItemName = b.Name ?? string.Empty,
                        AppointmentColor = at.Color ?? null,
                    }
                ).ToListAsync();

                var result = new List<GetTodayAppointmentsInfoDto>();

                for (int i = 0; i < 7; i++)
                {
                    var day = weekStartUtc.AddDays(i);

                    if (day.DayOfWeek == DayOfWeek.Friday)
                        continue;

                    int dayNumber = ((int)day.DayOfWeek + 1) % 7;
                    if (dayNumber == 0) dayNumber = 7;

                    var dayAppointments = appointments
                        .Where(a => a.Appointment.Start.Date == day.Date)
                        .Select(a => new GetTodayAppointmentsInfoDto
                        {
                            Id = a.Appointment.Id,
                            Time = a.Appointment.Start.ToString("HH:mm"),
                            PatientName = a.PatientName,
                            AppointmentTypeName = a.AppointmentTypeName,
                            BillableItemName = a.BillableItemName,
                            PractitionerName = a.PractitionerName,
                            Date = a.Appointment.Start.Date,
                            DayNumber = dayNumber,
                            FullDate = a.Appointment.Start,
                            Color = a.AppointmentColor,
                            Note = a.Appointment.Note
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
            var treatments = await _context.Treatments
          .Where(t => t.PatientId == patientId)
          .ToListAsync();

            if (!treatments.Any())
                return Enumerable.Empty<GetPatientTreatmentsResponse>();

            var treatmentIds = treatments.Select(t => (int?)t.Id).ToList();
            var treatmentTemplateIds = treatments.Select(t => t.TreatmentTemplateId).Distinct().ToList();

            var templates = await _context.TreatmentTemplates
                .Where(tt => treatmentTemplateIds.Contains(tt.Id))
                .ToListAsync();

            var billableItems = await _context.BillableItems
                .Where(bi => bi.TreatmentTemplateId != null && treatmentTemplateIds.Contains(bi.TreatmentTemplateId.Value))
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
                .Where(f => f.TreatmentId != null && treatmentIds.Contains(f.TreatmentId))
                .ToListAsync();

            var result = treatments.Select(treatment =>
            {
                var template = templates.FirstOrDefault(tt => tt.Id == treatment.TreatmentTemplateId);
                var billableItem = billableItems.FirstOrDefault(bi => bi.TreatmentTemplateId == treatment.TreatmentTemplateId);

                var sectionDtos = sections
                    .Where(s => s.TreatmentTemplateId == treatment.TreatmentTemplateId)
                    .Select(s =>
                    {
                        var questionDtos = questions
                            .Where(q => q.SectionId == s.Id)
                            .Select(q =>
                            {
                                var qv = questionValues.FirstOrDefault(v => v.QuestionId == q.Id && v.TreatmentId == treatment.Id);

                                var selectedValue = qv?.selectedValue;
                                object? finalSelectedValue = selectedValue;

                                List<int> selectedIds = new();
                                List<object> selectedAnswersJson = new();

                                if (qv != null && qv.AnswerId != null)
                                {
                                    var raw = qv.AnswerId.ToString();
                                    selectedIds = raw
                                        .Split(',', StringSplitOptions.RemoveEmptyEntries)
                                        .Select(x => int.TryParse(x.Trim(), out var id) ? id : -1)
                                        .Where(id => id > 0)
                                        .ToList();

                                    selectedAnswersJson = answers
                                        .Where(a => selectedIds.Contains(a.Id))
                                        .Select(a => new
                                        {
                                            Id = a.Id,
                                            Title = a.title
                                        })
                                        .Cast<object>()
                                        .ToList();

                                    finalSelectedValue = selectedAnswersJson;
                                }

                                var answerDtos = answers
                                    .Where(a => selectedIds.Contains(a.Id))
                                    .Select(a => new AnswerDto
                                    {
                                        Id = a.Id,
                                        Title = a.title,
                                        Text = a.text
                                    })
                                    .ToList();

                                return new QuestionDto
                                {
                                    Id = q.Id,
                                    Title = q.title,
                                    Type = q.type,
                                    SelectedValue = finalSelectedValue,
                                    Answers = answerDtos
                                };
                            })
                            .ToList();

                        return new SectionDto
                        {
                            Id = s.Id,
                            Title = s.title,
                            Questions = questionDtos
                        };
                    })
                    .ToList();

                var attachmentDtos = attachments
                    .Where(f => f.TreatmentId == treatment.Id)
                    .Select(f => new AttachmentDto
                    {
                        Id = f.Id,
                        FileName = f.FileName,
                        Description = f.Description,
                        FileSize = f.FileSize
                    })
                    .ToList();

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
