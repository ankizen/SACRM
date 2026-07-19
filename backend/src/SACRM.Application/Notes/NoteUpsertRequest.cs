using FluentValidation;

namespace SACRM.Application.Notes;

public class NoteUpsertRequest
{
    public string Content { get; set; } = string.Empty;
}

public class NoteUpsertRequestValidator : AbstractValidator<NoteUpsertRequest>
{
    public NoteUpsertRequestValidator()
    {
        RuleFor(x => x.Content).NotEmpty();
    }
}
