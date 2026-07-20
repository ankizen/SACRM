namespace SACRM.Application.Common;

/// <summary>
/// "Today" resolved against the company's configured timezone instead of raw UTC midnight --
/// without this, anything created between midnight and the timezone's UTC offset (e.g.
/// midnight-5:30am for Asia/Kolkata) gets miscounted as "yesterday." Pure/no I/O so it stays
/// in the Application layer; callers fetch CompanyProfile.Timezone themselves and pass it in.
/// </summary>
public static class CompanyClock
{
    public const string DefaultTimezone = "Asia/Kolkata";

    public static (DateTime StartUtc, DateTime EndUtc) GetTodayRangeUtc(string? timezoneId)
    {
        var timeZone = ResolveTimeZone(timezoneId);
        var nowLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZone);
        var todayLocalStart = DateTime.SpecifyKind(nowLocal.Date, DateTimeKind.Unspecified);
        var todayLocalEnd = todayLocalStart.AddDays(1);

        return (
            TimeZoneInfo.ConvertTimeToUtc(todayLocalStart, timeZone),
            TimeZoneInfo.ConvertTimeToUtc(todayLocalEnd, timeZone)
        );
    }

    private static TimeZoneInfo ResolveTimeZone(string? timezoneId)
    {
        if (!string.IsNullOrWhiteSpace(timezoneId))
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById(timezoneId);
            }
            catch (TimeZoneNotFoundException)
            {
                // Fall through to the default below.
            }
            catch (InvalidTimeZoneException)
            {
                // Fall through to the default below.
            }
        }

        return TimeZoneInfo.FindSystemTimeZoneById(DefaultTimezone);
    }
}
