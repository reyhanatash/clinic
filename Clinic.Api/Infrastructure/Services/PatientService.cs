using AutoMapper;
using Clinic.Api.Application.DTOs;
using Clinic.Api.Application.DTOs.Patients;
using Clinic.Api.Application.Interfaces;
using Clinic.Api.Domain.Entities;
using Clinic.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Api.Infrastructure.Services
{
    public class PatientService : IPatientService
    {
        private readonly ApplicationDbContext _context;
        private readonly IReadTokenClaims _token;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _environment;
        private readonly IFileService _fileService;

        public PatientService(ApplicationDbContext context, IReadTokenClaims token, IMapper mapper, IWebHostEnvironment environment,
            IFileService fileService)
        {
            _context = context;
            _token = token;
            _mapper = mapper;
            _environment = environment;
            _fileService = fileService;
        }

        public async Task<GlobalResponse> SavePatient(SavePatientDto model)
        {
            var result = new GlobalResponse();
            try
            {
                var userId = _token.GetUserId();

                if (!string.IsNullOrWhiteSpace(model.NationalCode) && model.NationalCode != "0000000000")
                {
                    bool nationalCodeExists;

                    if (model.EditOrNew == -1)
                    {
                        nationalCodeExists = await _context.Patients
                            .AnyAsync(p => p.NationalCode == model.NationalCode);
                    }
                    else
                    {
                        nationalCodeExists = await _context.Patients
                            .AnyAsync(p => p.NationalCode == model.NationalCode && p.Id != model.EditOrNew);
                    }

                    if (nationalCodeExists)
                        throw new Exception("National Code Exists");
                }

                if (model.EditOrNew == -1)
                {
                    int? lastId = await _context.Patients.MaxAsync(r => r.PatientCode);
                    model.PatientCode = lastId + 1;
                    var patient = _mapper.Map<PatientsContext>(model);
                    patient.CreatorId = userId;
                    patient.ReferringDoctorId = userId;
                    patient.CreatedOn = DateTime.Now;
                    patient.PatientCode = lastId + 1;
                    _context.Patients.Add(patient);
                    await _context.SaveChangesAsync();
                    result.Message = "Patient Saved Successfully";
                    result.Status = 0;
                    result.Data = patient.Id;
                    return result;
                }
                else
                {
                    var existingPatient = await _context.Patients.FirstOrDefaultAsync(p => p.Id == model.EditOrNew);

                    if (existingPatient == null)
                    {
                        throw new Exception("Patient Not Found");
                    }

                    _mapper.Map(model, existingPatient);
                    existingPatient.ModifierId = userId;
                    existingPatient.ReferringDoctorId = userId;
                    existingPatient.LastUpdated = DateTime.Now;
                    _context.Patients.Update(existingPatient);
                    await _context.SaveChangesAsync();
                    result.Message = "Patient Updated Successfully";
                    result.Status = 0;
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeletePatient(int id)
        {
            var result = new GlobalResponse();

            try
            {
                var patient = await _context.Patients.FindAsync(id);
                if (patient == null)
                    throw new Exception("Patient Not Found");

                _context.Patients.Remove(patient);
                await _context.SaveChangesAsync();
                result.Message = "Patient Deleted Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<PatientsContext>> GetPatients()
        {
            try
            {
                var userId = _token.GetUserId();

                var patients = await _context.Patients.Where(p => p.CreatorId == userId
                && p.CreatorId != p.Id).OrderBy(p => p.CreatedOn).ToListAsync();

                return patients;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<GetPatientInfoResponse>> GetPatientById(int patientId)
        {
            try
            {
                var query = _context.Patients.AsQueryable();
                var result = await (from n in query
                                    where n.Id == patientId
                                    // join j in _context.Jobs on n.JobId equals j.Id
                                    join u in _context.Users on n.CreatorId equals u.Id
                                    select new GetPatientInfoResponse
                                    {
                                        PhoneNumber = _context.PatientPhones
                                     .Where(p => p.PatientId == patientId)
                                     .Select(p => p.Number)
                                     .FirstOrDefault() ?? string.Empty,
                                        FirstName = n.FirstName,
                                        LastName = n.LastName,
                                        Gender = n.Gender,
                                        BirthDate = n.BirthDate,
                                        FatherName = n.FatherName,
                                        NationalCode = n.NationalCode,
                                        PatientCode = n.PatientCode.ToString(),
                                        // JobName = j.Name,
                                        DoctorName = u.FirstName + " " + u.LastName,
                                        Mobile = n.Mobile
                                    }).ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SavePatientPhone(SavePatientPhoneDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();
                if (model.EditOrNew == -1)
                {
                    var patient = await _context.PatientPhones.FindAsync(model.PatientId);

                    if (patient == null)
                    {
                        var mappPatient = _mapper.Map<PatientPhonesContext>(model);
                        mappPatient.CreatorId = userId;
                        _context.PatientPhones.Add(mappPatient);
                        await _context.SaveChangesAsync();
                        result.Message = "Patient Phone Saved Successfully";
                        result.Status = 0;
                        return result;
                    }
                    else
                    {
                        throw new Exception("Patient Phone Already Exists");
                    }
                }
                else
                {
                    var existingPatientPhone = await _context.PatientPhones.FirstOrDefaultAsync(p => p.Id == model.EditOrNew);

                    if (existingPatientPhone == null)
                    {
                        throw new Exception("Patient Not Found");
                    }

                    _mapper.Map(model, existingPatientPhone);
                    existingPatientPhone.ModifierId = userId;
                    existingPatientPhone.LastUpdated = DateTime.Now;
                    _context.PatientPhones.Update(existingPatientPhone);
                    await _context.SaveChangesAsync();
                    result.Message = "Patient Phone Updated Successfully";
                    result.Status = 0;
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeletePatientPhone(int id)
        {
            var result = new GlobalResponse();

            try
            {
                var patientPhone = await _context.PatientPhones.FindAsync(id);
                if (patientPhone == null)
                    throw new Exception("Patient Phone Not Found");

                _context.PatientPhones.Remove(patientPhone);
                await _context.SaveChangesAsync();
                result.Message = "Patient Phone Deleted Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<PatientPhonesContext>> GetPatientPhones(int patientId)
        {
            try
            {
                var patientPhone = await _context.PatientPhones.Where(p => p.PatientId == patientId).ToListAsync();
                return patientPhone;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<GetPatientAppointmentsResponse>> GetPatientAppointments(int patientId)
        {
            try
            {
                var result = await (
                            from a in _context.Appointments
                            join t in _context.AppointmentTypes on a.AppointmentTypeId equals t.Id into typeJoin
                            from t in typeJoin.DefaultIfEmpty()
                            where a.PatientId == patientId
                            select new GetPatientAppointmentsResponse
                            {
                                Id = a.Id,
                                Start = a.Start,
                                End = a.End,
                                PatientId = a.PatientId,
                                AppointmentTypeId = a.AppointmentTypeId,
                                AppointmentTypeName = t != null ? t.Name : null
                            }
                        ).ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<InvoicesContext>> GetPatientInvoices(int patientId)
        {
            try
            {
                var result = await _context.Invoices.Where(i => i.PatientId == patientId).ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<ReceiptsContext>> GetPatientReceipts(int patientId)
        {
            try
            {
                var result = await _context.Receipts.Where(r => r.PatientId == patientId).ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<PaymentsContext>> GetPatientPayments(int patientId)
        {
            try
            {
                var result = await _context.Payments.Where(p => p.PatientId == patientId).ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SaveAttachment(SaveAttachmentsDto model)
        {
            var result = new GlobalResponse();
            try
            {
                var userId = _token.GetUserId();

                var allowedExtensions = new List<string> { ".png", ".jpg", ".jpeg", ".pdf" };
                var fileExtension = Path.GetExtension(model.FileName)?.ToLower();

                if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension))
                {
                    result.Status = 1;
                    result.Message = "Invalid file type. Only images and PDF are allowed.";
                    return result;
                }

                var relativePath = await _fileService.SaveFileAsync(model.Base64, model.FileName, "assets/patient", _environment);

                relativePath = relativePath.Replace("\\", "/");

                var treatment = await _context.Treatments.FirstOrDefaultAsync(t => t.InvoiceItemId == model.InvoiceItemId);

                if (model.EditOrNew == -1)
                {
                    var entity = new FileAttachmentsContext
                    {
                        PatientId = model.PatientId,
                        FileName = relativePath,
                        FileSize = Convert.FromBase64String(model.Base64).LongLength,
                        CreatedOn = DateTime.Now,
                        LastUpdated = null,
                        ModifierId = null,
                        CreatorId = userId,
                        TreatmentId = treatment.Id
                    };

                    _context.FileAttachments.Add(entity);
                    await _context.SaveChangesAsync();

                    result.Message = "File Saved Successfully";
                    result.Status = 0;
                }
                else
                {
                    var entity = await _context.FileAttachments
                        .FirstOrDefaultAsync(f => f.Id == model.EditOrNew);

                    if (entity == null)
                    {
                        result.Status = 1;
                        result.Message = $"Attachment with Id {model.EditOrNew} not found.";
                        return result;
                    }

                    entity.PatientId = model.PatientId;
                    entity.FileName = relativePath;
                    entity.FileSize = Convert.FromBase64String(model.Base64).LongLength;
                    entity.LastUpdated = DateTime.Now;
                    entity.ModifierId = userId;
                    entity.TreatmentId = treatment.Id;

                    _context.FileAttachments.Update(entity);
                    await _context.SaveChangesAsync();

                    result.Message = "File Updated Successfully";
                    result.Status = 0;
                }

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<FileAttachmentsContext>> GetAttachment(int patientId)
        {
            try
            {
                var attachments = await _context.FileAttachments
              .Where(f => f.PatientId == patientId)
              .ToListAsync();

                return attachments;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteAttachment(int id)
        {
            var result = new GlobalResponse();

            try
            {
                var attachment = await _context.FileAttachments.FindAsync(id);
                if (attachment == null)
                    throw new Exception("Attachment Not Found");

                _context.FileAttachments.Remove(attachment);
                await _context.SaveChangesAsync();
                result.Message = "Attachment Deleted Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> GetFilteredPatients(GetFilteredPatientsDto model)
        {
            var result = new GlobalResponse();

            try
            {
                if (string.IsNullOrWhiteSpace(model.Value))
                {
                    result.Status = 0;
                    result.Message = "No Input";
                    result.Data = null;
                    return result;
                }

                string value = model.Value.Trim();

                var query =
                    _context.Patients.Where(p =>
                        p.FirstName == value ||
                        p.LastName == value ||
                        p.PatientCode.ToString() == value
                    );

                var list = await query.ToListAsync();

                if (list == null || !list.Any())
                {
                    result.Status = 1;
                    result.Message = "No Data Was Found";
                    result.Data = null;
                    return result;
                }

                result.Status = 2;
                result.Message = "Success";
                result.Data = list;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SavePatientField(SavePatientFieldDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();
                if (model.EditOrNew == -1)
                {
                    var patientField = _mapper.Map<PatientFieldsContext>(model);
                    patientField.CreatorId = userId;
                    patientField.CreatedOn = DateTime.Now;
                    _context.PatientFields.Add(patientField);
                    await _context.SaveChangesAsync();
                    result.Message = "Patient Field Saved Successfully";
                    result.Status = 0;
                    return result;
                }
                else
                {
                    var existingPatientField = await _context.PatientFields.FirstOrDefaultAsync(p => p.Id == model.EditOrNew);

                    if (existingPatientField == null)
                    {
                        throw new Exception("Patient Field Not Found");
                    }

                    _mapper.Map(model, existingPatientField);
                    existingPatientField.ModifierId = userId;
                    existingPatientField.LastUpdated = DateTime.Now;
                    _context.PatientFields.Update(existingPatientField);
                    await _context.SaveChangesAsync();
                    result.Message = "Patient Field Updated Successfully";
                    result.Status = 0;
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<PatientFieldsContext>> GetPatientField(int patientId)
        {
            try
            {
                var res = await _context.PatientFields.Where(p => p.ReferringPatientId == patientId).ToListAsync();
                return res;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<PatientFieldsContext>> GetPatientFields()
        {
            try
            {
                var res = await _context.PatientFields.ToListAsync();
                return res;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
