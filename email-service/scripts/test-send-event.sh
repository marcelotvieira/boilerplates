#!/bin/bash

# Script para testar envio de eventos para o Email Service
# Usa LocalStack EventBridge

set -e

AWS_ENDPOINT="http://localhost:4566"
AWS_REGION="us-east-1"
EVENT_BUS_NAME="identity-service-local"

echo "🧪 Email Service - Test Event Sender"
echo ""

# Menu de opções
echo "Escolha o tipo de email para testar:"
echo "1) Email Verification"
echo "2) Password Reset"
echo "3) Team Invite"
echo ""
read -p "Opção (1-3): " OPTION

case $OPTION in
  1)
    echo ""
    echo "📧 Enviando evento: EmailVerificationRequested"

    aws events put-events \
      --endpoint-url ${AWS_ENDPOINT} \
      --region ${AWS_REGION} \
      --entries "[{
        \"Source\": \"identity-service\",
        \"DetailType\": \"EmailVerificationRequested\",
        \"Detail\": \"{\\\"email\\\":\\\"test@example.com\\\",\\\"fullName\\\":\\\"Test User\\\",\\\"verificationCode\\\":\\\"123456\\\",\\\"expiresAt\\\":\\\"2025-01-03T12:15:00Z\\\",\\\"template\\\":\\\"email-verification\\\",\\\"templateData\\\":{\\\"userName\\\":\\\"Test User\\\",\\\"code\\\":\\\"123456\\\",\\\"expiresInMinutes\\\":15}}\",
        \"EventBusName\": \"${EVENT_BUS_NAME}\"
      }]"

    echo ""
    echo "✅ Evento enviado!"
    echo "📬 Verifique o email em: http://localhost:8025"
    ;;

  2)
    echo ""
    echo "🔑 Enviando evento: PasswordResetRequested"

    aws events put-events \
      --endpoint-url ${AWS_ENDPOINT} \
      --region ${AWS_REGION} \
      --entries "[{
        \"Source\": \"identity-service\",
        \"DetailType\": \"PasswordResetRequested\",
        \"Detail\": \"{\\\"email\\\":\\\"test@example.com\\\",\\\"fullName\\\":\\\"Test User\\\",\\\"resetCode\\\":\\\"654321\\\",\\\"expiresAt\\\":\\\"2025-01-03T12:15:00Z\\\",\\\"template\\\":\\\"password-reset\\\",\\\"templateData\\\":{\\\"userName\\\":\\\"Test User\\\",\\\"code\\\":\\\"654321\\\",\\\"expiresInMinutes\\\":15}}\",
        \"EventBusName\": \"${EVENT_BUS_NAME}\"
      }]"

    echo ""
    echo "✅ Evento enviado!"
    echo "📬 Verifique o email em: http://localhost:8025"
    ;;

  3)
    echo ""
    echo "🎉 Enviando evento: InviteCreated"

    aws events put-events \
      --endpoint-url ${AWS_ENDPOINT} \
      --region ${AWS_REGION} \
      --entries "[{
        \"Source\": \"identity-service\",
        \"DetailType\": \"InviteCreated\",
        \"Detail\": \"{\\\"inviteToken\\\":\\\"abc-123-token\\\",\\\"email\\\":\\\"invite@example.com\\\",\\\"tenantId\\\":\\\"tenant-uuid\\\",\\\"tenantName\\\":\\\"Acme Corp\\\",\\\"role\\\":\\\"ADMIN\\\",\\\"invitedBy\\\":\\\"user-uuid\\\",\\\"inviteLink\\\":\\\"http://localhost:3000/auth/accept-invite?token=abc-123-token\\\",\\\"expiresAt\\\":\\\"2025-01-10T12:00:00Z\\\",\\\"template\\\":\\\"invite\\\",\\\"templateData\\\":{\\\"recipientEmail\\\":\\\"invite@example.com\\\",\\\"tenantName\\\":\\\"Acme Corp\\\",\\\"invitedByName\\\":\\\"John Doe\\\",\\\"role\\\":\\\"ADMIN\\\",\\\"inviteLink\\\":\\\"http://localhost:3000/auth/accept-invite?token=abc-123-token\\\",\\\"expiresInDays\\\":7}}\",
        \"EventBusName\": \"${EVENT_BUS_NAME}\"
      }]"

    echo ""
    echo "✅ Evento enviado!"
    echo "📬 Verifique o email em: http://localhost:8025"
    ;;

  *)
    echo "❌ Opção inválida!"
    exit 1
    ;;
esac

echo ""
echo "💡 Dicas:"
echo "   - Ver logs: serverless logs -f processEmailEvent --stage local --tail"
echo "   - Ver DynamoDB: aws dynamodb scan --table-name email-logs-local --endpoint-url http://localhost:4566"
echo ""
