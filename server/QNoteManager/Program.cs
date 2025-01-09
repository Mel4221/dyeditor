
using Microsoft.AspNetCore.Server.Kestrel.Core;

namespace QNoteManager
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Configure Kestrel server to increase timeouts
            builder.WebHost.ConfigureKestrel(options =>
            {
                
                options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(30); // 30 minutes keep-alive timeout
                options.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(30); // 30 minutes for request headers
            });

            // Add services to the container.
            builder.Services.AddControllers();

            // Add a permissive CORS policy
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                    policy.AllowAnyOrigin()
                          .AllowAnyHeader()
                          .AllowAnyMethod());
            });

            var app = builder.Build();
            

            // Use the permissive CORS policy
            app.UseCors("AllowAll");

            // Configure the HTTP request pipeline.
            app.UseAuthorization();

            // Add default route to redirect to QNoteController
            app.MapGet("/", context =>
            {
                context.Response.Redirect("QNote");
                return Task.CompletedTask;
            });

            app.MapControllers();   

            app.Run();
        }
    }
}
