using System.Net;
using System.Text.Json;

namespace CampSite.API.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(
            RequestDelegate next,
            ILogger<ExceptionMiddleware> logger)
        {
            _next   = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception occurred.");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(
            HttpContext context,
            Exception exception)
        {
            context.Response.ContentType = "application/json";

            var (statusCode, message) = exception switch
            {
                KeyNotFoundException      => (HttpStatusCode.NotFound,
                                             exception.Message),
                UnauthorizedAccessException=> (HttpStatusCode.Unauthorized,
                                             exception.Message),
                InvalidOperationException => (HttpStatusCode.BadRequest,
                                             exception.Message),
                ArgumentException         => (HttpStatusCode.BadRequest,
                                             exception.Message),
                _                         => (HttpStatusCode.InternalServerError,
                                             "An unexpected error occurred.")
            };

            context.Response.StatusCode = (int)statusCode;

            var response = new
            {
                statusCode = (int)statusCode,
                message,
                timestamp  = DateTime.UtcNow
            };

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            await context.Response.WriteAsync(
                JsonSerializer.Serialize(response, options));
        }
    }
}