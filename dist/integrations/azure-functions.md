# Azure Functions

> Expert patterns for Azure Functions development including isolated worker model,
Durable Functions orchestration, cold start optimization, and production patterns.
Covers .NET, Python, and Node.js programming models.


**Category:** integrations | **Version:** 1.0.0

**Tags:** azure, serverless, functions, durable-functions, cloud

---

## Patterns

### Isolated Worker Model (.NET)
Modern .NET execution model with process isolation
**When:** Building new .NET Azure Functions apps

### Node.js v4 Programming Model
Modern code-centric approach for TypeScript/JavaScript
**When:** Building Node.js Azure Functions

### Python v2 Programming Model
Decorator-based approach for Python functions
**When:** Building Python Azure Functions

### Durable Functions - Function Chaining
Sequential execution with state persistence
**When:** Need sequential workflow with automatic retry

### Durable Functions - Fan-Out/Fan-In
Parallel execution with result aggregation
**When:** Processing multiple items in parallel

### Cold Start Optimization
Minimize cold start latency in production
**When:** Need fast response times in production

### Queue Trigger with Error Handling
Reliable message processing with poison queue
**When:** Processing messages from Azure Storage Queue

### HTTP Trigger with Long-Running Pattern
Handle work exceeding 230-second HTTP limit
**When:** HTTP request triggers long-running work


## Anti-Patterns

### Blocking Async Calls
Using .Result, .Wait(), or Thread.Sleep blocks threads
**Instead:** Use await/async pattern with Task.Delay

### New HttpClient Per Request
Creating HttpClient instances causes socket exhaustion
**Instead:** Use IHttpClientFactory or static client with DI

### In-Process Model for New Projects
In-process model deprecated in November 2026
**Instead:** Use isolated worker model for .NET

### Synchronous External Calls
Blocks threads, causes thread starvation
**Instead:** Use async patterns for all I/O

### Verbose Logging in Production
Excessive logging degrades performance
**Instead:** Use appropriate log levels, structured logging


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [HIGH] undefined

**Situation:** HTTP-triggered functions with long processing time

**Why it happens:**
The Azure Load Balancer has a hard-coded 230-second idle timeout for HTTP
requests. This applies regardless of your function app timeout setting.

Even if you set functionTimeout to 30 minutes in host.json, HTTP triggers
will timeout after 230 seconds from the client's perspective.

The function may continue running after timeout, but the client won't
receive the response.


**Solution:**
```
## Use async pattern with Durable Functions

```csharp
[Function("StartLongProcess")]
public static async Task<HttpResponseData> Start(
    [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequestData req,
    [DurableClient] DurableTaskClient client)
{
    var input = await req.ReadFromJsonAsync<WorkRequest>();

    // Start orchestration, returns immediately
    string instanceId = await client.ScheduleNewOrchestrationInstanceAsync(
        "LongRunningOrchestrator", input);

    // Returns status URLs for polling
    return client.CreateCheckStatusResponse(req, instanceId);
}

// Client polls statusQueryGetUri until complete
```

## Use queue-based async pattern

```csharp
[Function("StartWork")]
public static async Task<HttpResponseData> StartWork(
    [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequestData req,
    [QueueOutput("work-queue")] out WorkItem workItem)
{
    var workId = Guid.NewGuid().ToString();

    workItem = new WorkItem { Id = workId, /* ... */ };

    var response = req.CreateResponse(HttpStatusCode.Accepted);
    await response.WriteAsJsonAsync(new {
        id = workId,
        statusUrl = $"/api/status/{workId}"
    });
    return response;
}
```

## Use webhook callback pattern

```csharp
// Client provides callback URL
// Function queues work, returns 202 Accepted
// When done, POST result to callback URL
```

```

---

### [HIGH] undefined

**Situation:** Creating HttpClient instances inside function code

**Why it happens:**
Creating a new HttpClient for each request creates a new socket connection.
Sockets linger in TIME_WAIT state for 240 seconds after closing.

In a serverless environment with high throughput, you quickly exhaust
available sockets. This affects all network clients, not just HttpClient.

Azure Functions shares network resources among multiple customers,
making this even more critical.


**Solution:**
```
## Use IHttpClientFactory (Recommended)

```csharp
// Program.cs
var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices(services =>
    {
        services.AddHttpClient<IMyApiClient, MyApiClient>(client =>
        {
            client.BaseAddress = new Uri("https://api.example.com");
            client.Timeout = TimeSpan.FromSeconds(30);
        });
    })
    .Build();

// MyApiClient.cs
public class MyApiClient : IMyApiClient
{
    private readonly HttpClient _client;

    public MyApiClient(HttpClient client)
    {
        _client = client;  // Injected, managed by factory
    }

    public async Task<string> GetDataAsync()
    {
        return await _client.GetStringAsync("/data");
    }
}
```

## Use static client (Alternative)

```csharp
public static class MyFunction
{
    // Static HttpClient, reused across invocations
    private static readonly HttpClient _httpClient = new HttpClient
    {
        Timeout = TimeSpan.FromSeconds(30)
    };

    [Function("MyFunction")]
    public static async Task Run(...)
    {
        var result = await _httpClient.GetAsync("...");
    }
}
```

## Same pattern for Azure SDK clients

```csharp
// Also applies to:
// - BlobServiceClient
// - CosmosClient
// - ServiceBusClient
// Use DI or static instances
```

```

---

### [HIGH] undefined

**Situation:** Using .Result, .Wait(), or Thread.Sleep in async code

**Why it happens:**
Azure Functions thread pool is limited. Blocking calls (.Result, .Wait())
hold a thread hostage while waiting, preventing other work.

Thread.Sleep blocks a thread that could be handling other requests.

With multiple concurrent executions, you quickly run out of threads,
causing deadlocks and timeouts.


**Solution:**
```
## Always use async/await

```csharp
// BAD - blocks thread
var result = httpClient.GetAsync(url).Result;
someTask.Wait();
Thread.Sleep(5000);

// GOOD - yields thread
var result = await httpClient.GetAsync(url);
await someTask;
await Task.Delay(5000);
```

## Fix synchronous method calls

```csharp
// BAD - sync over async
public void ProcessData()
{
    var data = GetDataAsync().Result;  // Blocks!
}

// GOOD - async all the way
public async Task ProcessDataAsync()
{
    var data = await GetDataAsync();
}
```

## Configure async in console/startup

```csharp
// If you must call async from sync context
public static void Main(string[] args)
{
    // Use GetAwaiter().GetResult() at entry point only
    MainAsync(args).GetAwaiter().GetResult();
}

private static async Task MainAsync(string[] args)
{
    // Async code here
}
```

```

---

### [MEDIUM] undefined

**Situation:** Running long processes on Consumption plan

**Why it happens:**
Consumption plan has a hard limit of 10 minutes execution time.
Default is 5 minutes if not configured.

This cannot be increased beyond 10 minutes on Consumption plan.
Long-running work requires Premium plan or different architecture.


**Solution:**
```
## Configure maximum timeout (Consumption)

```json
// host.json
{
  "version": "2.0",
  "functionTimeout": "00:10:00"  // Max for Consumption
}
```

## Upgrade to Premium plan for longer timeouts

```json
// Premium plan - 30 min default, unbounded available
{
  "version": "2.0",
  "functionTimeout": "00:30:00"  // Or remove for unbounded
}
```

## Use Durable Functions for long workflows

```csharp
[Function("LongWorkflowOrchestrator")]
public static async Task<string> RunOrchestrator(
    [OrchestrationTrigger] TaskOrchestrationContext context)
{
    // Each activity has its own timeout
    // Workflow can run for days
    await context.CallActivityAsync("Step1", input);
    await context.CallActivityAsync("Step2", input);
    await context.CallActivityAsync("Step3", input);
    return "Complete";
}
```

## Break work into smaller chunks

```csharp
// Queue-based chunking
[Function("ProcessChunk")]
[QueueOutput("work-queue")]
public static IEnumerable<WorkChunk> ProcessChunk(
    [QueueTrigger("work-queue")] WorkChunk chunk)
{
    var results = Process(chunk);

    // Queue next chunks if more work
    if (chunk.HasMore)
    {
        yield return chunk.Next();
    }
}
```

```

---

### [HIGH] undefined

**Situation:** Creating new .NET functions or maintaining existing

**Why it happens:**
The in-process model runs your code in the same process as the
Azure Functions host. This causes:
- Assembly version conflicts
- Limited to LTS .NET versions
- No access to latest .NET features
- Tighter coupling with host runtime

Support ends November 10, 2026. After this date, in-process apps
may stop working or receive no security updates.


**Solution:**
```
## Use isolated worker for new projects

```bash
# Create new isolated worker project
func init MyFunctionApp --worker-runtime dotnet-isolated

# Or with .NET 8
dotnet new func --name MyFunctionApp --framework net8.0
```

## Migrate existing in-process to isolated

```csharp
// OLD - In-process (FunctionName attribute)
public class InProcessFunction
{
    [FunctionName("MyFunction")]
    public async Task<IActionResult> Run(
        [HttpTrigger] HttpRequest req,
        ILogger log)
    {
        log.LogInformation("Processing");
        return new OkResult();
    }
}

// NEW - Isolated worker (Function attribute)
public class IsolatedFunction
{
    private readonly ILogger<IsolatedFunction> _logger;

    public IsolatedFunction(ILogger<IsolatedFunction> logger)
    {
        _logger = logger;
    }

    [Function("MyFunction")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "get")]
        HttpRequestData req)
    {
        _logger.LogInformation("Processing");
        return req.CreateResponse(HttpStatusCode.OK);
    }
}
```

## Key migration changes
- FunctionName → Function attribute
- HttpRequest → HttpRequestData
- IActionResult → HttpResponseData
- ILogger injection → constructor injection
- Add Program.cs with HostBuilder

```

---

### [MEDIUM] undefined

**Situation:** Using dependency-injected ILogger in isolated worker

**Why it happens:**
In isolated worker model, the dependency-injected ILogger may not
be properly connected to the Azure Functions logging pipeline.

Local development especially affected - logs may go nowhere.
Application Insights requires explicit configuration.

The ILogger from FunctionContext works differently than
the injected ILogger<T>.


**Solution:**
```
## Configure Application Insights properly

```csharp
// Program.cs
var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices(services =>
    {
        // Add App Insights telemetry
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();
    })
    .Build();
```

## Configure logging levels

```json
// host.json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    },
    "logLevel": {
      "default": "Information",
      "Host.Results": "Error",
      "Function": "Information",
      "Host.Aggregator": "Trace"
    }
  }
}
```

## Use context.GetLogger for reliability

```csharp
[Function("MyFunction")]
public async Task Run(
    [HttpTrigger] HttpRequestData req,
    FunctionContext context)
{
    // This logger always works
    var logger = context.GetLogger<MyFunction>();
    logger.LogInformation("Processing request");
}
```

## Local development - check local.settings.json

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "APPLICATIONINSIGHTS_CONNECTION_STRING": "InstrumentationKey=..."
  }
}
```

```

---

### [MEDIUM] undefined

**Situation:** Using triggers/bindings without installing extensions

**Why it happens:**
Azure Functions v2+ uses extension bundles for triggers and bindings.
If extensions aren't properly configured or packages aren't installed,
the function host can't recognize the bindings.

In isolated worker, you need explicit NuGet packages.
In in-process, you need Microsoft.Azure.WebJobs.Extensions.*.


**Solution:**
```
## Check extension bundle (most common)

```json
// host.json - Extension bundles handle most cases
{
  "version": "2.0",
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  }
}
```

## Install explicit packages for isolated worker

```xml
<!-- .csproj - Isolated worker packages -->
<PackageReference Include="Microsoft.Azure.Functions.Worker" Version="1.20.0" />
<PackageReference Include="Microsoft.Azure.Functions.Worker.Sdk" Version="1.16.0" />

<!-- Storage triggers/bindings -->
<PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.Storage" Version="6.2.0" />

<!-- Service Bus -->
<PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.ServiceBus" Version="5.14.0" />

<!-- Cosmos DB -->
<PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.CosmosDB" Version="4.6.0" />

<!-- Durable Functions -->
<PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.DurableTask" Version="1.1.0" />
```

## Verify function registration

```bash
# Check registered functions
func host start --verbose

# Look for:
# "Found the following functions:"
# If empty, check extensions and attributes
```

```

---

### [MEDIUM] undefined

**Situation:** Using Premium plan expecting zero cold start

**Why it happens:**
Premium plan provides pre-warmed instances, but:
- Only one pre-warmed instance by default
- Rapid scale-out still creates cold instances
- Pre-warmed instances still run YOUR code initialization
- Warmup trigger runs, but your code may still be slow

Pre-warmed means the runtime is ready, not your application.


**Solution:**
```
## Add warmup trigger to initialize your code

```csharp
[Function("Warmup")]
public void Warmup(
    [WarmupTrigger] object warmupContext,
    FunctionContext context)
{
    var logger = context.GetLogger("Warmup");
    logger.LogInformation("Warmup trigger fired");

    // Initialize expensive resources
    _cosmosClient.GetContainer("db", "container");
    _httpClient.GetAsync("https://api.example.com/health").Wait();
}
```

## Configure pre-warmed instance count

```bash
# Increase pre-warmed instances (costs more)
az functionapp config set \
  --name <app-name> \
  --resource-group <rg> \
  --prewarmed-instance-count 3
```

## Optimize application initialization

```csharp
// Lazy initialize heavy resources
private static readonly Lazy<ExpensiveClient> _client =
    new Lazy<ExpensiveClient>(() => new ExpensiveClient());

// Connection pooling
services.AddDbContext<MyDbContext>(options =>
    options.UseSqlServer(connectionString, sql =>
        sql.MinPoolSize(5)));
```

## Use always-ready instances (most expensive)

```bash
# Instances always running, no cold start
az functionapp config set \
  --name <app-name> \
  --resource-group <rg> \
  --minimum-elastic-instance-count 2
```

```

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `user needs AWS serverless` | aws-serverless | Lambda, API Gateway, SAM |
| `user needs GCP serverless` | gcp-cloud-run | Cloud Run, Cloud Functions |
| `user needs container-based deployment` | gcp-cloud-run | Azure Container Apps or Cloud Run |
| `user needs database design` | postgres-wizard | Azure SQL, Cosmos DB data modeling |
| `user needs authentication` | auth-specialist | Azure AD, Easy Auth, managed identity |
| `user needs complex orchestration` | workflow-automation | Logic Apps, Power Automate |

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/integrations/azure-functions/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
