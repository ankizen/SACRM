namespace SACRM.Application.Common.Exceptions;

public class ForbiddenAccessException(string message = "You do not have permission to perform this action.")
    : Exception(message);
