#!/bin/bash

echo "🚀 Initializing LocalStack for Identity Service..."

# Wait for LocalStack to be ready
echo "⏳ Waiting for LocalStack to be ready..."
sleep 5

# Set AWS credentials for local development
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

# Create DynamoDB Table
echo "📦 Creating DynamoDB table: identity-service-local..."

awslocal dynamodb create-table \
  --table-name identity-service-local \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
    AttributeName=GSI2PK,AttributeType=S \
    AttributeName=GSI2SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
    "[
      {
        \"IndexName\": \"GSI1\",
        \"KeySchema\": [
          {\"AttributeName\": \"GSI1PK\", \"KeyType\": \"HASH\"},
          {\"AttributeName\": \"GSI1SK\", \"KeyType\": \"RANGE\"}
        ],
        \"Projection\": {\"ProjectionType\": \"ALL\"},
        \"ProvisionedThroughput\": {
          \"ReadCapacityUnits\": 5,
          \"WriteCapacityUnits\": 5
        }
      },
      {
        \"IndexName\": \"GSI2\",
        \"KeySchema\": [
          {\"AttributeName\": \"GSI2PK\", \"KeyType\": \"HASH\"},
          {\"AttributeName\": \"GSI2SK\", \"KeyType\": \"RANGE\"}
        ],
        \"Projection\": {\"ProjectionType\": \"ALL\"},
        \"ProvisionedThroughput\": {
          \"ReadCapacityUnits\": 5,
          \"WriteCapacityUnits\": 5
        }
      }
    ]" \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1

echo "✅ DynamoDB table created successfully!"

# Create EventBridge Event Bus
echo "📨 Creating EventBridge event bus: identity-service-local..."

awslocal events create-event-bus \
  --name identity-service-local \
  --region us-east-1

echo "✅ EventBridge event bus created successfully!"

# List created resources
echo "📋 Listing created resources..."
echo ""
echo "DynamoDB Tables:"
awslocal dynamodb list-tables --region us-east-1

echo ""
echo "EventBridge Event Buses:"
awslocal events list-event-buses --region us-east-1

echo ""
echo "✨ LocalStack initialization complete!"
