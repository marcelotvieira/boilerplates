#!/bin/bash

# Script para inicializar recursos do LocalStack para o Email Service
# Este script é executado após o deploy local para configurar o EventBridge

set -e

STAGE="local"
AWS_ENDPOINT="http://localhost:4566"
AWS_REGION="us-east-1"

echo "🚀 Initializing Email Service LocalStack resources..."

# Aguardar LocalStack estar pronto
echo "⏳ Waiting for LocalStack to be ready..."
until curl -s ${AWS_ENDPOINT}/health | grep -q '"dynamodb": "running"'; do
  echo "Waiting for LocalStack..."
  sleep 2
done

echo "✅ LocalStack is ready!"

# Verificar se o Event Bus do Identity Service existe
echo "🔍 Checking if identity-service event bus exists..."
EVENT_BUS_EXISTS=$(aws events list-event-buses \
  --endpoint-url=${AWS_ENDPOINT} \
  --region=${AWS_REGION} \
  --query "EventBuses[?Name=='identity-service-${STAGE}'].Name" \
  --output text 2>/dev/null || echo "")

if [ -z "$EVENT_BUS_EXISTS" ]; then
  echo "⚠️  Identity Service event bus not found!"
  echo "📝 Creating identity-service-${STAGE} event bus..."

  aws events create-event-bus \
    --name identity-service-${STAGE} \
    --endpoint-url=${AWS_ENDPOINT} \
    --region=${AWS_REGION}

  echo "✅ Event bus created!"
else
  echo "✅ Identity Service event bus already exists"
fi

# Listar todas as regras do EventBridge
echo ""
echo "📋 Current EventBridge rules:"
aws events list-rules \
  --event-bus-name identity-service-${STAGE} \
  --endpoint-url=${AWS_ENDPOINT} \
  --region=${AWS_REGION} \
  --query 'Rules[*].[Name,State]' \
  --output table

# Verificar DynamoDB table
echo ""
echo "🔍 Checking DynamoDB table..."
TABLE_EXISTS=$(aws dynamodb list-tables \
  --endpoint-url=${AWS_ENDPOINT} \
  --region=${AWS_REGION} \
  --query "TableNames[?@=='email-logs-${STAGE}']" \
  --output text 2>/dev/null || echo "")

if [ -z "$TABLE_EXISTS" ]; then
  echo "⚠️  email-logs-${STAGE} table not found (will be created by Serverless)"
else
  echo "✅ email-logs-${STAGE} table exists"
fi

# Verificar SQS Dead Letter Queue
echo ""
echo "🔍 Checking SQS Dead Letter Queue..."
QUEUE_URL=$(aws sqs get-queue-url \
  --queue-name email-service-dlq-${STAGE} \
  --endpoint-url=${AWS_ENDPOINT} \
  --region=${AWS_REGION} \
  --query 'QueueUrl' \
  --output text 2>/dev/null || echo "")

if [ -z "$QUEUE_URL" ]; then
  echo "⚠️  email-service-dlq-${STAGE} queue not found (will be created by Serverless)"
else
  echo "✅ email-service-dlq-${STAGE} queue exists"
  echo "   URL: ${QUEUE_URL}"
fi

echo ""
echo "✨ LocalStack initialization complete!"
echo ""
echo "📌 Next steps:"
echo "   1. Deploy the email-service: npm run deploy:local"
echo "   2. Test Mailpit UI: http://localhost:8025"
echo "   3. Send test event: npm run test:send-event"
echo ""
