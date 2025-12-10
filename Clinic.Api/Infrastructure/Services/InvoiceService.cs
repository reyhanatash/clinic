using AutoMapper;
using Clinic.Api.Application.DTOs;
using Clinic.Api.Application.DTOs.Invoices;
using Clinic.Api.Application.Interfaces;
using Clinic.Api.Domain.Entities;
using Clinic.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Api.Infrastructure.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly IReadTokenClaims _token;

        public InvoiceService(ApplicationDbContext context, IMapper mapper, IReadTokenClaims token)
        {
            _context = context;
            _mapper = mapper;
            _token = token;
        }

        public async Task<GlobalResponse> SaveInvoice(SaveInvoiceDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();

                if (model.EditOrNew == -1)
                {
                    string? lastId = await _context.Invoices.MaxAsync(r => r.InvoiceNo);
                    var Id = Convert.ToInt32(lastId);
                    model.InvoiceNo = (Id + 1).ToString();
                    var invoice = _mapper.Map<InvoicesContext>(model);
                    invoice.CreatorId = userId;
                    invoice.CreatedOn = DateTime.Now;
                    invoice.PractitionerId = userId;
                    invoice.InvoiceNo = (Id + 1).ToString();
                    _context.Invoices.Add(invoice);
                    await _context.SaveChangesAsync();
                    result.Message = $"Invoice Saved Successfully , Id : {invoice.Id}";
                    result.Status = 0;
                    return result;
                }
                else
                {
                    var existingInvoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == model.EditOrNew);

                    if (existingInvoice == null)
                    {
                        throw new Exception("Invoice Not Found");
                    }

                    _mapper.Map(model, existingInvoice);
                    existingInvoice.ModifierId = userId;
                    existingInvoice.LastUpdated = DateTime.Now;
                    existingInvoice.PractitionerId = userId;
                    _context.Invoices.Update(existingInvoice);
                    await _context.SaveChangesAsync();
                    result.Message = $"Invoice Updated Successfully , Id : {existingInvoice.Id}";
                    result.Status = 0;
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<GetInvoicesResponse>> GetInvoices()
        {
            try
            {
                var invoices = await (from i in _context.Invoices
                                      join p in _context.Patients on i.PatientId equals p.Id
                                      join b in _context.Businesses on i.BusinessId equals b.Id
                                      select new GetInvoicesResponse
                                      {
                                          Id = i.Id,
                                          InvoiceNo = i.InvoiceNo,
                                          BusinessId = i.BusinessId,
                                          IssueDate = i.IssueDate,
                                          PatientId = i.PatientId,
                                          PractitionerId = i.PractitionerId,
                                          AppointmentId = i.AppointmentId,
                                          InvoiceTo = i.InvoiceTo,
                                          ExtraPatientInfo = i.ExtraPatientInfo,
                                          TotalDiscount = i.TotalDiscount,
                                          Amount = i.Amount,
                                          Notes = i.Notes,
                                          Payment = i.Payment,
                                          ModifierId = i.ModifierId,
                                          CreatedOn = i.CreatedOn,
                                          LastUpdated = i.LastUpdated,
                                          InvoiceBillStatusId = i.InvoiceBillStatusId,
                                          AllowPayLater = i.AllowPayLater,
                                          UserAllowPayLaterId = i.UserAllowPayLaterId,
                                          Receipt = i.Receipt,
                                          BillStatus = i.BillStatus,
                                          IsCanceled = i.IsCanceled,
                                          BusinessDebit = i.BusinessDebit,
                                          CreatorId = i.CreatorId,
                                          RecordStateId = i.RecordStateId,
                                          AnesthesiaTechnicianId = i.AnesthesiaTechnicianId,
                                          ElectroTechnicianId = i.ElectroTechnicianId,
                                          IsFirstInvoice = i.IsFirstInvoice,
                                          Anesthesia = i.Anesthesia,
                                          BusinessAmount = i.BusinessAmount,
                                          AcceptDiscount = i.AcceptDiscount,
                                          AssistantId = i.AssistantId,
                                          PatientName = p.FirstName + " " + p.LastName,
                                          BusinessName = b.Name
                                      })
                                 .ToListAsync();

                return invoices;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SaveInvoiceItem(SaveInvoiceItemDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();
                InvoiceItemsContext invoiceItem;
                bool itemChanged = false;

                if (model.EditOrNew == -1)
                {
                    invoiceItem = _mapper.Map<InvoiceItemsContext>(model);
                    invoiceItem.CreatorId = userId;
                    invoiceItem.CreatedOn = DateTime.Now;
                    _context.InvoiceItems.Add(invoiceItem);
                }
                else
                {
                    invoiceItem = await _context.InvoiceItems.FirstOrDefaultAsync(i => i.Id == model.EditOrNew);
                    if (invoiceItem == null)
                        throw new Exception("Invoice Item Not Found");

                    itemChanged = invoiceItem.ItemId != model.ItemId;

                    _mapper.Map(model, invoiceItem);
                    invoiceItem.ModifierId = userId;
                    invoiceItem.LastUpdated = DateTime.Now;
                    _context.InvoiceItems.Update(invoiceItem);
                }

                await _context.SaveChangesAsync();

                var invoiceInfo = await _context.Invoices
                    .Where(inv => inv.Id == model.InvoiceId)
                    .Select(inv => new { inv.AppointmentId, inv.PatientId })
                    .FirstOrDefaultAsync();

                if (invoiceInfo == null)
                    throw new Exception("Invoice Not Found");

                var existingTreatment = await _context.Treatments
                    .FirstOrDefaultAsync(t => t.InvoiceItemId == invoiceItem.Id);

                if (existingTreatment == null)
                {
                    var treatmentTemplateId = await _context.BillableItems
                        .Where(i => i.Id == model.ItemId)
                        .Select(i => i.TreatmentTemplateId)
                        .FirstOrDefaultAsync();

                    var newTreatment = new TreatmentsContext
                    {
                        AppointmentId = invoiceInfo.AppointmentId,
                        PatientId = invoiceInfo.PatientId,
                        TreatmentTemplateId = treatmentTemplateId ?? 0,
                        IsFinal = false,
                        VisitTime = DateTime.Now,
                        CreatedOn = DateTime.Now,
                        CreatorId = userId,
                        InvoiceItemId = invoiceItem.Id
                    };

                    _context.Treatments.Add(newTreatment);
                }
                else
                {
                    existingTreatment.AppointmentId = invoiceInfo.AppointmentId;
                    existingTreatment.PatientId = invoiceInfo.PatientId;
                    existingTreatment.VisitTime = DateTime.Now;
                    existingTreatment.LastUpdated = DateTime.Now;
                    existingTreatment.ModifierId = userId;

                    if (itemChanged)
                    {
                        var newTemplateId = await _context.BillableItems
                            .Where(i => i.Id == model.ItemId)
                            .Select(i => i.TreatmentTemplateId)
                            .FirstOrDefaultAsync();

                        existingTreatment.TreatmentTemplateId = newTemplateId ?? 0;
                    }

                    _context.Treatments.Update(existingTreatment);
                }

                await _context.SaveChangesAsync();

                result.Status = 0;
                result.Message = model.EditOrNew == -1
                    ? "Invoice Item and Treatment Saved Successfully"
                    : "Invoice Item and Treatment Updated Successfully";

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<InvoiceItemsContext>> GetInvoiceItems(int invoiceId)
        {
            try
            {
                var invoiceItems = await _context.InvoiceItems.Where(i => i.InvoiceId == invoiceId).ToListAsync();
                return invoiceItems;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteInvoice(int id)
        {
            var result = new GlobalResponse();

            try
            {
                var invoice = await _context.Invoices.FindAsync(id);

                if (invoice == null)
                    throw new Exception("Invoice Not Found");

                _context.Invoices.Remove(invoice);
                await _context.SaveChangesAsync();
                result.Message = "Invoice Deleted Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteInvoiceItem(int id)
        {
            var result = new GlobalResponse();

            try
            {
                var invoiceItems = await _context.InvoiceItems.FindAsync(id);
                if (invoiceItems == null)
                    throw new Exception("Invoice Items Not Found");

                _context.InvoiceItems.Remove(invoiceItems);
                await _context.SaveChangesAsync();
                result.Message = "Invoice Item Deleted Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SaveReceipt(SaveReceiptDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();

                var receipt = await _context.Receipts.FirstOrDefaultAsync(r => r.PatientId == model.PatientId);

                if (receipt == null)
                {
                    int? lastId = await _context.Receipts.MaxAsync(r => r.ReceiptNo);
                    model.ReceiptNo = lastId + 1;
                    var mappReceipt = _mapper.Map<ReceiptsContext>(model);
                    mappReceipt.CreatorId = userId;
                    mappReceipt.CreatedOn = DateTime.Now;
                    mappReceipt.ReceiptNo = lastId + 1;
                    _context.Receipts.Add(mappReceipt);
                    await _context.SaveChangesAsync();
                    result.Message = "Receipt Saved Successfully";
                    result.Status = 0;
                    return result;
                }

                _mapper.Map(model, receipt);
                receipt.ModifierId = userId;
                receipt.LastUpdated = DateTime.Now;
                _context.Receipts.Update(receipt);
                await _context.SaveChangesAsync();
                result.Message = "Receipt Updated Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<GetReciptsResponse>> GetReceipts(int? patientId)
        {
            try
            {
                var query = _context.Receipts.AsQueryable();

                if (patientId.HasValue)
                {
                    query = query.Where(r => r.PatientId == patientId.Value);
                }

                var result = await (from a in query
                                    join p in _context.Patients on a.PatientId equals p.Id

                                    select new GetReciptsResponse
                                    {
                                        Id = a.Id,
                                        ReceiptNo = a.ReceiptNo,
                                        PatientId = a.PatientId,
                                        Cash = a.Cash,
                                        EFTPos = a.EFTPos,
                                        Other = a.Other,
                                        Notes = a.Notes,
                                        ModifierId = a.ModifierId,
                                        CreatedOn = a.CreatedOn,
                                        LastUpdated = a.LastUpdated,
                                        AllowEdit = a.AllowEdit,
                                        CreatorId = a.CreatorId,
                                        ReceiptTypeId = a.ReceiptTypeId,
                                        PatientName = p.FirstName + " " + p.LastName
                                    })
                                    .ToListAsync();

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<GetReciptsResponse>> GetReceipts()
        {
            try
            {
                var query = _context.Receipts.AsQueryable();
                var result = await (from a in query
                                    join p in _context.Patients on a.PatientId equals p.Id

                                    select new GetReciptsResponse
                                    {
                                        Id = a.Id,
                                        ReceiptNo = a.ReceiptNo,
                                        PatientId = a.PatientId,
                                        Cash = a.Cash,
                                        EFTPos = a.EFTPos,
                                        Other = a.Other,
                                        Notes = a.Notes,
                                        ModifierId = a.ModifierId,
                                        CreatedOn = a.CreatedOn,
                                        LastUpdated = a.LastUpdated,
                                        AllowEdit = a.AllowEdit,
                                        CreatorId = a.CreatorId,
                                        ReceiptTypeId = a.ReceiptTypeId,
                                        PatientName = p.FirstName + " " + p.LastName
                                    })
                                    .ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteReceipt(int patientId)
        {
            var result = new GlobalResponse();

            try
            {
                var receipt = await _context.Receipts.FirstOrDefaultAsync(r => r.PatientId == patientId);
                if (receipt == null)
                    throw new Exception("Receipt Not Found");

                _context.Receipts.Remove(receipt);
                await _context.SaveChangesAsync();
                result.Message = "Receipt Deleted Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SaveExpense(SaveExpenseDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();

                if (model.EditOrNew == -1)
                {
                    var expense = _mapper.Map<ExpensesContext>(model);
                    expense.CreatedOn = DateTime.Now;
                    expense.CreatorId = userId;
                    _context.Expenses.Add(expense);
                    await _context.SaveChangesAsync();
                    result.Message = "Expense Saved Successfully";
                    result.Status = 0;
                    return result;
                }
                else
                {
                    var existingExpense = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == model.EditOrNew);
                    if (existingExpense == null)
                    {
                        throw new Exception("Expense Not Found");
                    }

                    _mapper.Map(model, existingExpense);
                    existingExpense.ModifierId = userId;
                    existingExpense.LastUpdated = DateTime.Now;
                    _context.Expenses.Update(existingExpense);
                    await _context.SaveChangesAsync();
                    result.Message = "Expense Updated Successfully";
                    result.Status = 0;
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<ExpensesContext>> GetExpenses()
        {
            try
            {
                var expenses = await _context.Expenses.ToListAsync();
                return expenses;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SaveInvoiceDiscount(SaveInvoiceDiscountDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();

                var existingInvoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == model.InvoiceId);

                if (existingInvoice == null)
                {
                    throw new Exception("Invoice Not Found");
                }

                _mapper.Map(model, existingInvoice);
                existingInvoice.ModifierId = userId;
                existingInvoice.LastUpdated = DateTime.Now;
                existingInvoice.TotalDiscount = model.TotalDiscount;
                _context.Invoices.Update(existingInvoice);
                await _context.SaveChangesAsync();
                result.Message = $"Invoice Discount Updated Successfully , Id : {existingInvoice.Id}";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<GetInvoiceDetailsResponse>> GetInvoiceDetails(int appointmentId)
        {
            try
            {
                var query = _context.Invoices.AsQueryable();
                var result = await (from i in query
                                    join b in _context.Businesses on i.BusinessId equals b.Id
                                    join t in _context.Treatments on appointmentId equals t.AppointmentId
                                    join u in _context.Users on i.PractitionerId equals u.Id

                                    select new GetInvoiceDetailsResponse
                                    {
                                        SystemCode = i.Id,
                                        InvoiceNo = i.InvoiceNo,
                                        BussinessName = b.Name,
                                        Amount = i.Amount,
                                        TotalDiscount = i.TotalDiscount,
                                        Receipt = i.Receipt,
                                        Payment = i.Payment,
                                        RemainingAmount = (i.Amount - i.TotalDiscount) - i.Receipt,
                                        VisitTime = t.VisitTime,
                                        DoctorName = u.FirstName + " " + u.LastName
                                    }).ToListAsync();

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> CancelInvoice(int invoiceId)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();

                var existingInvoice = await _context.Invoices.FirstOrDefaultAsync(e => e.Id == invoiceId);
                if (existingInvoice == null)
                {
                    throw new Exception("Invoice Not Found");
                }

                existingInvoice.ModifierId = userId;
                existingInvoice.LastUpdated = DateTime.Now;
                existingInvoice.IsCanceled = true;
                _context.Invoices.Update(existingInvoice);
                await _context.SaveChangesAsync();
                result.Message = "Invoice Canceled Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> ApproveDiscount(int invoiceId)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();

                var existingInvoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == invoiceId);
                if (existingInvoice == null)
                {
                    throw new Exception("Invoice Not Found");
                }

                existingInvoice.ModifierId = userId;
                existingInvoice.LastUpdated = DateTime.Now;
                existingInvoice.AcceptDiscount = true;
                _context.Invoices.Update(existingInvoice);
                await _context.SaveChangesAsync();
                result.Message = "Discount Approved Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> InvoiceItemIsDone(int invoiceItemId, bool isDone)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();

                var existingInvoiceItem = await _context.InvoiceItems.FirstOrDefaultAsync(i => i.Id == invoiceItemId);
                if (existingInvoiceItem == null)
                {
                    throw new Exception("Invoice Item Not Found");
                }

                existingInvoiceItem.ModifierId = userId;
                existingInvoiceItem.LastUpdated = DateTime.Now;
                existingInvoiceItem.Done = isDone;
                _context.InvoiceItems.Update(existingInvoiceItem);
                await _context.SaveChangesAsync();
                result.Message = "Done Field Updated Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteExpense(int id)
        {
            var result = new GlobalResponse();

            try
            {
                var expense = await _context.Expenses.FirstOrDefaultAsync(r => r.Id == id);
                if (expense == null)
                    throw new Exception("Expense Not Found");

                _context.Expenses.Remove(expense);
                await _context.SaveChangesAsync();
                result.Message = "Expense Deleted Successfully";
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
