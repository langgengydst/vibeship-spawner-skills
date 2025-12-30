# AWS Serverless

> Specialized skill for building production-ready serverless applications on AWS.
Covers Lambda functions, API Gateway, DynamoDB, SQS/SNS event-driven patterns,
SAM/CDK deployment, and cold start optimization.


**Category:** integrations | **Version:** 1.0.0

**Tags:** aws, lambda, serverless, api-gateway, dynamodb

---

## Patterns

### Lambda Handler Pattern
Proper Lambda function structure with error handling
```
```javascript
// Node.js Lambda Handler
// handler.js

// Initialize outside handler (reused across invocations)
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Handler function
exports.handler = async (event, context) => {
  // Optional: Don't wait for event loop to clear (Node.js)
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Parse input based on event source
    const body = typeof event.body === 'string'
      ? JSON.parse(event.body)
      : event.body;

    // Business logic
    const result = await processRequest(body);

    // Return API Gateway compatible response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error:', JSON.stringify({
      error: error.message,
      stack: error.stack,
      requestId: context.awsRequestId
    }));

    return {
      statusCode: error.statusCode || 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message || 'Internal server error'
      })
    };
  }
};

async function processRequest(data) {
  // Your business logic here
  const result = await docClient.send(new GetCommand({
    TableName: process.env.TABLE_NAME,
    Key: { id: data.id }
  }));
  return result.Item;
}
```

```python
# Python Lambda Handler
# handler.py

import json
import os
import logging
import boto3
from botocore.exceptions import ClientError

# Initialize outside handler (reused across invocations)
logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

def handler(event, context):
    try:
        # Parse input
        body = json.loads(event.get('body', '{}')) if isinstance(event.get('body'), str) else event.get('body', {})

        # Business logic
        result = process_request(body)

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result)
        }

    except ClientError as e:
        logger.error(f"DynamoDB error: {e.response['Error']['Message']}")
        return error_response(500, 'Database error')

    except json.JSONDecodeError:
        return error_response(400, 'Invalid JSON')

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return error_response(500, 'Internal server error')

def process_request(data):
    response = table.get_item(Key={'id': data['id']})
    return response.get('Item')

def error_response(status_code, message):
    return {
        'statusCode': status_code,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'error': message})
    }
```

```

### API Gateway Integration Pattern
REST API and HTTP API integration with Lambda
```
```yaml
# template.yaml (SAM)
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Runtime: nodejs20.x
    Timeout: 30
    MemorySize: 256
    Environment:
      Variables:
        TABLE_NAME: !Ref ItemsTable

Resources:
  # HTTP API (recommended for simple use cases)
  HttpApi:
    Type: AWS::Serverless::HttpApi
    Properties:
      StageName: prod
      CorsConfiguration:
        AllowOrigins:
          - "*"
        AllowMethods:
          - GET
          - POST
          - DELETE
        AllowHeaders:
          - "*"

  # Lambda Functions
  GetItemFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/get.handler
      Events:
        GetItem:
          Type: HttpApi
          Properties:
            ApiId: !Ref HttpApi
            Path: /items/{id}
            Method: GET
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref ItemsTable

  CreateItemFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/create.handler
      Events:
        CreateItem:
          Type: HttpApi
          Properties:
            ApiId: !Ref HttpApi
            Path: /items
            Method: POST
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref ItemsTable

  # DynamoDB Table
  ItemsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: S
      KeySchema:
        - AttributeName: id
          KeyType: HASH
      BillingMode: PAY_PER_REQUEST

Outputs:
  ApiUrl:
    Value: !Sub "https://${HttpApi}.execute-api.${AWS::Region}.amazonaws.com/prod"
```

```javascript
// src/handlers/get.js
const { getItem } = require('../lib/dynamodb');

exports.handler = async (event) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing id parameter' })
    };
  }

  const item = await getItem(id);

  if (!item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Item not found' })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(item)
  };
};
```

```

### Event-Driven SQS Pattern
Lambda triggered by SQS for reliable async processing
```
```yaml
# template.yaml
Resources:
  ProcessorFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/processor.handler
      Events:
        SQSEvent:
          Type: SQS
          Properties:
            Queue: !GetAtt ProcessingQueue.Arn
            BatchSize: 10
            FunctionResponseTypes:
              - ReportBatchItemFailures  # Partial batch failure handling

  ProcessingQueue:
    Type: AWS::SQS::Queue
    Properties:
      VisibilityTimeout: 180  # 6x Lambda timeout
      RedrivePolicy:
        deadLetterTargetArn: !GetAtt DeadLetterQueue.Arn
        maxReceiveCount: 3

  DeadLetterQueue:
    Type: AWS::SQS::Queue
    Properties:
      MessageRetentionPeriod: 1209600  # 14 days
```

```javascript
// src/handlers/processor.js
exports.handler = async (event) => {
  const batchItemFailures = [];

  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      await processMessage(body);
    } catch (error) {
      console.error(`Failed to process message ${record.messageId}:`, error);
      // Report this item as failed (will be retried)
      batchItemFailures.push({
        itemIdentifier: record.messageId
      });
    }
  }

  // Return failed items for retry
  return { batchItemFailures };
};

async function processMessage(message) {
  // Your processing logic
  console.log('Processing:', message);

  // Simulate work
  await saveToDatabase(message);
}
```

```python
# Python version
import json
import logging

logger = logging.getLogger()

def handler(event, context):
    batch_item_failures = []

    for record in event['Records']:
        try:
            body = json.loads(record['body'])
            process_message(body)
        except Exception as e:
            logger.error(f"Failed to process {record['messageId']}: {e}")
            batch_item_failures.append({
                'itemIdentifier': record['messageId']
            })

    return {'batchItemFailures': batch_item_failures}
```

```

### DynamoDB Streams Pattern
React to DynamoDB table changes with Lambda
```
```yaml
# template.yaml
Resources:
  ItemsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: items
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: S
      KeySchema:
        - AttributeName: id
          KeyType: HASH
      BillingMode: PAY_PER_REQUEST
      StreamSpecification:
        StreamViewType: NEW_AND_OLD_IMAGES

  StreamProcessorFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/stream.handler
      Events:
        Stream:
          Type: DynamoDB
          Properties:
            Stream: !GetAtt ItemsTable.StreamArn
            StartingPosition: TRIM_HORIZON
            BatchSize: 100
            MaximumRetryAttempts: 3
            DestinationConfig:
              OnFailure:
                Destination: !GetAtt StreamDLQ.Arn

  StreamDLQ:
    Type: AWS::SQS::Queue
```

```javascript
// src/handlers/stream.js
exports.handler = async (event) => {
  for (const record of event.Records) {
    const eventName = record.eventName;  // INSERT, MODIFY, REMOVE

    // Unmarshall DynamoDB format to plain JS objects
    const newImage = record.dynamodb.NewImage
      ? unmarshall(record.dynamodb.NewImage)
      : null;
    const oldImage = record.dynamodb.OldImage
      ? unmarshall(record.dynamodb.OldImage)
      : null;

    console.log(`${eventName}: `, { newImage, oldImage });

    switch (eventName) {
      case 'INSERT':
        await handleInsert(newImage);
        break;
      case 'MODIFY':
        await handleModify(oldImage, newImage);
        break;
      case 'REMOVE':
        await handleRemove(oldImage);
        break;
    }
  }
};

// Use AWS SDK v3 unmarshall
const { unmarshall } = require('@aws-sdk/util-dynamodb');
```

```

### Cold Start Optimization Pattern
Minimize Lambda cold start latency
```
## 1. Optimize Package Size

```javascript
// Use modular AWS SDK v3 imports
// GOOD - only imports what you need
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

// BAD - imports entire SDK
const AWS = require('aws-sdk');  // Don't do this!
```

## 2. Use SnapStart (Java/.NET)

```yaml
# template.yaml
Resources:
  JavaFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: com.example.Handler::handleRequest
      Runtime: java21
      SnapStart:
        ApplyOn: PublishedVersions  # Enable SnapStart
      AutoPublishAlias: live
```

## 3. Right-size Memory

```yaml
# More memory = more CPU = faster init
Resources:
  FastFunction:
    Type: AWS::Serverless::Function
    Properties:
      MemorySize: 1024  # 1GB gets full vCPU
      Timeout: 30
```

## 4. Provisioned Concurrency (when needed)

```yaml
Resources:
  CriticalFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/critical.handler
      AutoPublishAlias: live

  ProvisionedConcurrency:
    Type: AWS::Lambda::ProvisionedConcurrencyConfig
    Properties:
      FunctionName: !Ref CriticalFunction
      Qualifier: live
      ProvisionedConcurrentExecutions: 5
```

## 5. Keep Init Light

```python
# GOOD - Lazy initialization
_table = None

def get_table():
    global _table
    if _table is None:
        dynamodb = boto3.resource('dynamodb')
        _table = dynamodb.Table(os.environ['TABLE_NAME'])
    return _table

def handler(event, context):
    table = get_table()  # Only initializes on first use
    # ...
```

```

### SAM Local Development Pattern
Local testing and debugging with SAM CLI
```
```bash
# Install SAM CLI
pip install aws-sam-cli

# Initialize new project
sam init --runtime nodejs20.x --name my-api

# Build the project
sam build

# Run locally
sam local start-api

# Invoke single function
sam local invoke GetItemFunction --event events/get.json

# Local debugging (Node.js with VS Code)
sam local invoke --debug-port 5858 GetItemFunction

# Deploy
sam deploy --guided
```

```json
// events/get.json (test event)
{
  "pathParameters": {
    "id": "123"
  },
  "httpMethod": "GET",
  "path": "/items/123"
}
```

```json
// .vscode/launch.json (for debugging)
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach to SAM CLI",
      "type": "node",
      "request": "attach",
      "address": "localhost",
      "port": 5858,
      "localRoot": "${workspaceRoot}/src",
      "remoteRoot": "/var/task/src",
      "protocol": "inspector"
    }
  ]
}
```

```

### CDK Serverless Pattern
Infrastructure as code with AWS CDK
```
```typescript
// lib/api-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const table = new dynamodb.Table(this, 'ItemsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev only
    });

    // Lambda Function
    const getItemFn = new lambda.Function(this, 'GetItemFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'get.handler',
      code: lambda.Code.fromAsset('src/handlers'),
      environment: {
        TABLE_NAME: table.tableName,
      },
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
    });

    // Grant permissions
    table.grantReadData(getItemFn);

    // API Gateway
    const api = new apigateway.RestApi(this, 'ItemsApi', {
      restApiName: 'Items Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const items = api.root.addResource('items');
    const item = items.addResource('{id}');

    item.addMethod('GET', new apigateway.LambdaIntegration(getItemFn));

    // Output API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
    });
  }
}
```

```bash
# CDK commands
npm install -g aws-cdk
cdk init app --language typescript
cdk synth    # Generate CloudFormation
cdk diff     # Show changes
cdk deploy   # Deploy to AWS
```

```


## Anti-Patterns

### Monolithic Lambda
Don't put all code in one function
**Why it's bad:** Large deployment packages cause slow cold starts.
Hard to scale individual operations.
Updates affect entire system.


### Large Dependencies
Avoid bundling unnecessary packages
**Why it's bad:** Increases deployment package size.
Slows down cold starts significantly.
Most of SDK/library may be unused.


### Synchronous Calls in VPC
Avoid blocking calls that delay cold start
**Why it's bad:** VPC-attached Lambdas have ENI setup overhead.
Blocking DNS lookups or connections worsen cold starts.



## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [HIGH] undefined

**Situation:** Running Lambda functions in production

**Why it happens:**
As of August 1, 2025, AWS bills the INIT phase the same way it bills
invocation duration. Previously, cold start initialization wasn't billed
for the full duration.

This affects functions with:
- Heavy dependency loading (large packages)
- Slow initialization code
- Frequent cold starts (low traffic or poor concurrency)

Cold starts now directly impact your bill, not just latency.


**Solution:**
```
## Measure your INIT phase

```bash
# Check CloudWatch Logs for INIT_REPORT
# Look for Init Duration in milliseconds

# Example log line:
# INIT_REPORT Init Duration: 423.45 ms
```

## Reduce INIT duration

```javascript
// 1. Minimize package size
// Use tree shaking, exclude dev dependencies
// npm prune --production

// 2. Lazy load heavy dependencies
let heavyLib = null;
function getHeavyLib() {
  if (!heavyLib) {
    heavyLib = require('heavy-library');
  }
  return heavyLib;
}

// 3. Use AWS SDK v3 modular imports
const { S3Client } = require('@aws-sdk/client-s3');
// NOT: const AWS = require('aws-sdk');
```

## Use SnapStart for Java/.NET

```yaml
Resources:
  JavaFunction:
    Type: AWS::Serverless::Function
    Properties:
      Runtime: java21
      SnapStart:
        ApplyOn: PublishedVersions
```

## Monitor cold start frequency

```javascript
// Track cold starts with custom metric
let isColdStart = true;

exports.handler = async (event) => {
  if (isColdStart) {
    console.log('COLD_START');
    // CloudWatch custom metric here
    isColdStart = false;
  }
  // ...
};
```

```

---

### [HIGH] undefined

**Situation:** Running Lambda functions, especially with external calls

**Why it happens:**
Default Lambda timeout is only 3 seconds. Maximum is 15 minutes.

Common timeout causes:
- Default timeout too short for workload
- Downstream service taking longer than expected
- Network issues in VPC
- Infinite loops or blocking operations
- S3 downloads larger than expected

Lambda terminates at timeout without graceful shutdown.


**Solution:**
```
## Set appropriate timeout

```yaml
# template.yaml
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      Timeout: 30  # Seconds (max 900)
      # Set to expected duration + buffer
```

## Implement timeout awareness

```javascript
exports.handler = async (event, context) => {
  // Get remaining time
  const remainingTime = context.getRemainingTimeInMillis();

  // If running low on time, fail gracefully
  if (remainingTime < 5000) {
    console.warn('Running low on time, aborting');
    throw new Error('Insufficient time remaining');
  }

  // For long operations, check periodically
  for (const item of items) {
    if (context.getRemainingTimeInMillis() < 10000) {
      // Save progress and exit gracefully
      await saveProgress(processedItems);
      throw new Error('Timeout approaching, saved progress');
    }
    await processItem(item);
  }
};
```

## Set downstream timeouts

```javascript
const axios = require('axios');

// Always set timeouts on HTTP calls
const response = await axios.get('https://api.example.com/data', {
  timeout: 5000  // 5 seconds
});
```

```

---

### [HIGH] undefined

**Situation:** Lambda function processing data

**Why it happens:**
When Lambda exceeds memory allocation, AWS forcibly terminates
the runtime. This happens without raising a catchable exception.

Common causes:
- Processing large files in memory
- Memory leaks across invocations
- Buffering entire response bodies
- Heavy libraries consuming too much memory


**Solution:**
```
## Increase memory allocation

```yaml
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      MemorySize: 1024  # MB (128-10240)
      # More memory = more CPU too
```

## Stream large data

```javascript
// BAD - loads entire file into memory
const data = await s3.getObject(params).promise();
const content = data.Body.toString();

// GOOD - stream processing
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const s3 = new S3Client({});

const response = await s3.send(new GetObjectCommand(params));
const stream = response.Body;

// Process stream in chunks
for await (const chunk of stream) {
  await processChunk(chunk);
}
```

## Monitor memory usage

```javascript
exports.handler = async (event, context) => {
  const used = process.memoryUsage();
  console.log('Memory:', {
    heapUsed: Math.round(used.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.round(used.heapTotal / 1024 / 1024) + 'MB'
  });
  // ...
};
```

## Use Lambda Power Tuning

```bash
# Find optimal memory setting
# https://github.com/alexcasalboni/aws-lambda-power-tuning
```

```

---

### [MEDIUM] undefined

**Situation:** Lambda functions in VPC accessing private resources

**Why it happens:**
Lambda functions in VPC need Elastic Network Interfaces (ENIs).
AWS improved this significantly with Hyperplane ENIs, but:

- First cold start in VPC still has overhead
- NAT Gateway issues can cause timeouts
- Security group misconfig blocks traffic
- DNS resolution can be slow


**Solution:**
```
## Verify VPC configuration

```yaml
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      VpcConfig:
        SecurityGroupIds:
          - !Ref LambdaSecurityGroup
        SubnetIds:
          - !Ref PrivateSubnet1
          - !Ref PrivateSubnet2  # Multiple AZs

  LambdaSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Lambda SG
      VpcId: !Ref VPC
      SecurityGroupEgress:
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: 0.0.0.0/0  # Allow HTTPS outbound
```

## Use VPC endpoints for AWS services

```yaml
# Avoid NAT Gateway for AWS service calls
DynamoDBEndpoint:
  Type: AWS::EC2::VPCEndpoint
  Properties:
    ServiceName: !Sub com.amazonaws.${AWS::Region}.dynamodb
    VpcId: !Ref VPC
    RouteTableIds:
      - !Ref PrivateRouteTable
    VpcEndpointType: Gateway

S3Endpoint:
  Type: AWS::EC2::VPCEndpoint
  Properties:
    ServiceName: !Sub com.amazonaws.${AWS::Region}.s3
    VpcId: !Ref VPC
    VpcEndpointType: Gateway
```

## Only use VPC when necessary

Don't attach Lambda to VPC unless you need:
- Access to RDS/ElastiCache in VPC
- Access to private EC2 instances
- Compliance requirements

Most AWS services can be accessed without VPC.

```

---

### [MEDIUM] undefined

**Situation:** Node.js Lambda function with callbacks or timers

**Why it happens:**
By default, Lambda waits for the Node.js event loop to be empty
before returning. If you have:
- Unresolved setTimeout/setInterval
- Dangling database connections
- Pending callbacks

Lambda waits until timeout, even if your response was ready.


**Solution:**
```
## Tell Lambda not to wait for event loop

```javascript
exports.handler = async (event, context) => {
  // Don't wait for event loop to clear
  context.callbackWaitsForEmptyEventLoop = false;

  // Your code here
  const result = await processRequest(event);

  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
};
```

## Close connections properly

```javascript
// For database connections, use connection pooling
// or close connections explicitly

const mysql = require('mysql2/promise');

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const connection = await mysql.createConnection({...});
  try {
    const [rows] = await connection.query('SELECT * FROM users');
    return { statusCode: 200, body: JSON.stringify(rows) };
  } finally {
    await connection.end();  // Always close
  }
};
```

```

---

### [MEDIUM] undefined

**Situation:** Returning large responses or receiving large requests

**Why it happens:**
API Gateway has hard payload limits:
- REST API: 10 MB request/response
- HTTP API: 10 MB request/response
- Lambda itself: 6 MB sync response, 256 KB async

Exceeding these causes failures that may not be obvious.


**Solution:**
```
## For large file uploads

```javascript
// Use presigned S3 URLs instead of passing through API Gateway

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

exports.handler = async (event) => {
  const s3 = new S3Client({});

  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: `uploads/${Date.now()}.file`
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return {
    statusCode: 200,
    body: JSON.stringify({ uploadUrl })
  };
};
```

## For large responses

```javascript
// Store in S3, return presigned download URL
exports.handler = async (event) => {
  const largeData = await generateLargeReport();

  await s3.send(new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: `reports/${reportId}.json`,
    Body: JSON.stringify(largeData)
  }));

  const downloadUrl = await getSignedUrl(s3,
    new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: `reports/${reportId}.json`
    }),
    { expiresIn: 3600 }
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ downloadUrl })
  };
};
```

```

---

### [HIGH] undefined

**Situation:** Lambda triggered by events

**Why it happens:**
Lambda can accidentally trigger itself:
- S3 trigger writes back to same bucket
- DynamoDB trigger updates same table
- SNS publishes to topic that triggers it
- Step Functions with wrong error handling


**Solution:**
```
## Use different buckets/prefixes

```yaml
# S3 trigger with prefix filter
Events:
  S3Event:
    Type: S3
    Properties:
      Bucket: !Ref InputBucket
      Events: s3:ObjectCreated:*
      Filter:
        S3Key:
          Rules:
            - Name: prefix
              Value: uploads/  # Only trigger on uploads/

# Output to different bucket or prefix
# OutputBucket or processed/ prefix
```

## Add idempotency checks

```javascript
exports.handler = async (event) => {
  for (const record of event.Records) {
    const key = record.s3.object.key;

    // Skip if this is a processed file
    if (key.startsWith('processed/')) {
      console.log('Skipping already processed file:', key);
      continue;
    }

    // Process and write to different location
    await processFile(key);
    await writeToS3(`processed/${key}`, result);
  }
};
```

## Set reserved concurrency as circuit breaker

```yaml
Resources:
  RiskyFunction:
    Type: AWS::Serverless::Function
    Properties:
      ReservedConcurrentExecutions: 10  # Max 10 parallel
      # Limits blast radius of runaway invocations
```

## Monitor with CloudWatch alarms

```yaml
InvocationAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    MetricName: Invocations
    Namespace: AWS/Lambda
    Statistic: Sum
    Period: 60
    EvaluationPeriods: 1
    Threshold: 1000  # Alert if >1000 invocations/min
    ComparisonOperator: GreaterThanThreshold
```

```

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `user needs GCP serverless` | gcp-cloud-run | Cloud Run for containers, Cloud Functions for events |
| `user needs Azure serverless` | azure-functions | Azure Functions, Logic Apps |
| `user needs database design` | postgres-wizard | RDS design, or use DynamoDB patterns |
| `user needs authentication` | auth-specialist | Cognito, API Gateway authorizers |
| `user needs complex workflows` | workflow-automation | Step Functions, EventBridge |
| `user needs AI integration` | llm-architect | Lambda calling Bedrock or external LLMs |

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/integrations/aws-serverless/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
