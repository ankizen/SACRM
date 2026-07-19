namespace SACRM.Application.Leads;

public static class LeadMappingExtensions
{
    public static IQueryable<LeadListItemDto> ToListItemDtoQuery(this IQueryable<Domain.Entities.Lead> query) =>
        query.Select(l => new LeadListItemDto
        {
            Id = l.Id,
            Name = l.Name,
            Phone = l.Phone,
            Email = l.Email,
            ShopName = l.ShopName,
            CityName = l.City != null ? l.City.Name : null,
            LeadStageId = l.LeadStageId,
            LeadStageName = l.LeadStage.Name,
            LeadSourceName = l.LeadSource != null ? l.LeadSource.Name : null,
            AssignedToUserId = l.AssignedToUserId,
            AssignedToUserName = l.AssignedToUser != null ? l.AssignedToUser.FullName : null,
            Priority = l.Priority.ToString(),
            IsDuplicate = l.IsDuplicate,
            IsDeleted = l.IsDeleted,
            CreatedAtUtc = l.CreatedAtUtc
        });

    public static IQueryable<LeadDto> ToDtoQuery(this IQueryable<Domain.Entities.Lead> query) =>
        query.Select(l => new LeadDto
        {
            Id = l.Id,
            Name = l.Name,
            Phone = l.Phone,
            WhatsAppNumber = l.WhatsAppNumber,
            AlternatePhone = l.AlternatePhone,
            Email = l.Email,
            ShopName = l.ShopName,
            Address = l.Address,
            CityId = l.CityId,
            CityName = l.City != null ? l.City.Name : null,
            State = l.State,
            ZipCode = l.ZipCode,
            CountryId = l.CountryId,
            CountryName = l.Country != null ? l.Country.Name : null,
            GstNumber = l.GstNumber,
            Website = l.Website,
            LeadSourceId = l.LeadSourceId,
            LeadSourceName = l.LeadSource != null ? l.LeadSource.Name : null,
            LeadStageId = l.LeadStageId,
            LeadStageName = l.LeadStage.Name,
            AssignedToUserId = l.AssignedToUserId,
            AssignedToUserName = l.AssignedToUser != null ? l.AssignedToUser.FullName : null,
            Priority = l.Priority.ToString(),
            Remarks = l.Remarks,
            IsDuplicate = l.IsDuplicate,
            DuplicateOfLeadId = l.DuplicateOfLeadId,
            IsDeleted = l.IsDeleted,
            CreatedAtUtc = l.CreatedAtUtc,
            CreatedByUserId = l.CreatedByUserId,
            UpdatedAtUtc = l.UpdatedAtUtc,
            RowVersion = Convert.ToBase64String(l.RowVersion)
        });
}
