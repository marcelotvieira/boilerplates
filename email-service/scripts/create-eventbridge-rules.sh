#!/bin/bash

# Script para criar regras do EventBridge no LocalStack
# Execute este script DENTRO do container LocalStack:
# docker exec boilerplates-localstack bash -c "$(cat scripts/create-eventbridge-rules.sh)"
#
# Ou copie e cole os comandos diretamente no shell do container:
# docker exec -it boilerplates-localstack bash

set -e

STAGE="local"
REGION="us-east-1"
EVENT_BUS_NAME="identity-service-${STAGE}"
LAMBDA_ARN="arn:aws:lambda:${REGION}:000000000000:function:email-service-${STAGE}-processEmailEvent"

echo "🚀 Creating EventBridge Rules for Email Service..."

# Rule 1: EmailVerificationRequested
echo ""
echo "📧 Creating rule: email-service-verification-${STAGE}"
awslocal events put-rule \
  --name "email-service-verification-${STAGE}" \
  --event-bus-name "${EVENT_BUS_NAME}" \
  --event-pattern '{"source":["identity-service"],"detail-type":["EmailVerificationRequested"]}' \
  --region "${REGION}"

echo "🎯 Adding target to verification rule..."
awslocal events put-targets \
  --rule "email-service-verification-${STAGE}" \
  --event-bus-name "${EVENT_BUS_NAME}" \
  --targets "Id"="1","Arn"="${LAMBDA_ARN}" \
  --region "${REGION}"

# Rule 2: PasswordResetRequested
echo ""
echo "🔑 Creating rule: email-service-password-reset-${STAGE}"
awslocal events put-rule \
  --name "email-service-password-reset-${STAGE}" \
  --event-bus-name "${EVENT_BUS_NAME}" \
  --event-pattern '{"source":["identity-service"],"detail-type":["PasswordResetRequested"]}' \
  --region "${REGION}"

echo "🎯 Adding target to password reset rule..."
awslocal events put-targets \
  --rule "email-service-password-reset-${STAGE}" \
  --event-bus-name "${EVENT_BUS_NAME}" \
  --targets "Id"="1","Arn"="${LAMBDA_ARN}" \
  --region "${REGION}"

# Rule 3: InviteCreated
echo ""
echo "👥 Creating rule: email-service-invite-${STAGE}"
awslocal events put-rule \
  --name "email-service-invite-${STAGE}" \
  --event-bus-name "${EVENT_BUS_NAME}" \
  --event-pattern '{"source":["identity-service"],"detail-type":["InviteCreated"]}' \
  --region "${REGION}"

echo "🎯 Adding target to invite rule..."
awslocal events put-targets \
  --rule "email-service-invite-${STAGE}" \
  --event-bus-name "${EVENT_BUS_NAME}" \
  --targets "Id"="1","Arn"="${LAMBDA_ARN}" \
  --region "${REGION}"

# Verify
echo ""
echo "✅ EventBridge Rules created successfully!"
echo ""
echo "📋 Listing all rules:"
awslocal events list-rules \
  --event-bus-name "${EVENT_BUS_NAME}" \
  --region "${REGION}" \
  --query 'Rules[*].[Name,State,EventPattern]' \
  --output table

echo ""
echo "✨ Done!"
