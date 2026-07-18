namespace SACRM.Domain.Enums;

public enum LeadTimelineEventType
{
    Created,
    Assigned,
    Reassigned,
    StageChanged,
    FieldUpdated,
    ActivityLogged,
    NoteAdded,
    AttachmentAdded,
    FollowupScheduled,
    FollowupCompleted,
    Converted,
    MarkedLost,
    Restored,
    MergedDuplicate
}
