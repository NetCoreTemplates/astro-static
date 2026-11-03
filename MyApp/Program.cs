using System.Net;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using MyApp.Data;
using MyApp.ServiceInterface;

AppHost.RegisterKey();

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;

services.AddAuthorization();
services.AddAuthentication(options =>
    {
        options.DefaultScheme = IdentityConstants.ApplicationScheme;
        options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
    })
    .AddIdentityCookies();
services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo("App_Data"));

services.AddDatabaseDeveloperPageExceptionFilter();

services.AddIdentityCore<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();

services.AddRazorPages();

services.AddSingleton<IEmailSender<ApplicationUser>, IdentityNoOpEmailSender>();
// Uncomment to send emails with SMTP, configure SMTP with "SmtpConfig" in appsettings.json
// services.AddSingleton<IEmailSender<ApplicationUser>, EmailSender>();
services.AddScoped<IUserClaimsPrincipalFactory<ApplicationUser>, AdditionalUserClaimsPrincipalFactory>();

// Register all services
services.AddServiceStack(typeof(MyServices).Assembly);

var app = builder.Build();
var nodeProxy = new NodeProxy("http://127.0.0.1:5173") {
    Log = app.Logger
};

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseMigrationsEndPoint();

    app.MapNotFoundToNode(nodeProxy);
}
else
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseDefaultFiles();
app.UseStaticFiles();
app.MapCleanUrls(); // serve Astro's prerendered pages without .html, e.g. /about => about.html
// Route after static files, otherwise "/" matches the 404 fallback before index.html is served
app.UseRouting();

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapRazorPages();

app.UseServiceStack(new AppHost(), options => {
    options.MapEndpoints();
});

// Proxy HMR WebSocket and fallback routes to Node dev server in Development
if (app.Environment.IsDevelopment())
{
    app.RunNodeProcess(nodeProxy, "../MyApp.Client"); // Start Node if not running
    app.UseWebSockets();
    app.MapViteHmr(nodeProxy);
    app.MapFallbackToNode(nodeProxy); // Fallback to Node dev server in development
}
else
{
    // Every Astro page is prerendered (MyApp.Client/dist > wwwroot), so any other path is a 404
    app.MapFallback(async context => {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(app.Environment.WebRootFileProvider.GetFileInfo("404.html"));
    });
}

app.Run();
