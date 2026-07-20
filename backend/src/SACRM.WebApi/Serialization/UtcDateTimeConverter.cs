using System.Text.Json;
using System.Text.Json.Serialization;

namespace SACRM.WebApi.Serialization;

/// <summary>
/// Every DateTime in this API is UTC by convention (the "*Utc" naming throughout the domain),
/// but EF Core reads SQL Server's datetime2 columns back with DateTimeKind.Unspecified --
/// System.Text.Json's default converter only appends the "Z" suffix for DateTimeKind.Utc, so
/// without this, clients received e.g. "2026-07-20T12:34:00" with no timezone marker at all.
/// `new Date(...)` on a marker-less string is parsed as the *browser's local* time, not UTC --
/// for any user whose browser isn't already in the company's configured timezone, every date
/// silently comes out wrong by exactly their UTC offset. Forcing Kind=Utc here fixes it
/// app-wide in one place instead of touching every DTO.
/// </summary>
public class UtcDateTimeConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetDateTime();
        return DateTime.SpecifyKind(value, DateTimeKind.Utc);
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        var utcValue = value.Kind == DateTimeKind.Utc ? value : DateTime.SpecifyKind(value, DateTimeKind.Utc);
        writer.WriteStringValue(utcValue);
    }
}
