import dynamoose from 'dynamoose'
import { config } from '../../config/env.config.js'
import { Logger } from '../../shared/utils/logger.js'

const logger = Logger.of('DynamoDBConfig')

export function initializeDynamoDB(): void {
  logger.info('Initializing DynamoDB configuration', {
    tableName: config.DYNAMODB_TABLE_NAME,
    nodeEnv: config.NODE_ENV,
    region: config.AWS_REGION,
    isLocal: config.IS_LOCAL
  })

  // Configure DynamoDB client
  // For LocalStack or local development, use custom endpoint
  if (config.IS_LOCAL && config.DYNAMODB_ENDPOINT) {
    const ddbConfig = new dynamoose.aws.ddb.DynamoDB({
      region: config.AWS_REGION,
      endpoint: config.DYNAMODB_ENDPOINT,
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test'
      }
    })

    dynamoose.aws.ddb.set(ddbConfig)
    logger.info('DynamoDB configured for LocalStack', {
      endpoint: config.DYNAMODB_ENDPOINT
    })
  } else {
    // In Lambda, IAM role handles authentication automatically
    const ddbConfig = new dynamoose.aws.ddb.DynamoDB({
      region: config.AWS_REGION
    })

    dynamoose.aws.ddb.set(ddbConfig)
    logger.info('DynamoDB configured for AWS')
  }

  // Set table configuration for all models
  dynamoose.Table.defaults.set({
    create: false, // Don't auto-create tables (managed by Serverless Framework)
    update: false, // Don't auto-update tables
    waitForActive: false,
    prefix: '',
    suffix: ''
  })

  logger.info('DynamoDB configuration initialized successfully')
}
