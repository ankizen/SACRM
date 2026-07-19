using FluentValidation;

namespace SACRM.Application.Leads;

public class BulkUpdateLeadsRequest
{
    public List<int> LeadIds { get; set; } = [];
    public int? LeadStageId { get; set; }
    public int? AssignedToUserId { get; set; }
}

public class BulkUpdateLeadsRequestValidator : AbstractValidator<BulkUpdateLeadsRequest>
{
    public BulkUpdateLeadsRequestValidator()
    {
        RuleFor(x => x.LeadIds).NotEmpty();
        RuleFor(x => x)
            .Must(x => x.LeadStageId is not null || x.AssignedToUserId is not null)
            .WithMessage("At least one of LeadStageId or AssignedToUserId must be provided.");
    }
}
