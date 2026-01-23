import dynamoose from 'dynamoose';
import { Environment } from '../../shared/config/environment.js';
import { Logger } from '../../shared/utils/logger.js';
const logger = Logger.of('DynamoDBConfig');
let isInitialized = false;
export function initializeDynamoDB() {
    if (isInitialized) {
        logger.debug('DynamoDB already initialized');
        return;
    }
    try {
        if (Environment.IS_LOCAL && Environment.DYNAMODB_ENDPOINT) {
            logger.info('Initializing DynamoDB with LocalStack', {
                endpoint: Environment.DYNAMODB_ENDPOINT,
                table: Environment.DYNAMODB_TABLE_NAME
            });
            const ddb = new dynamoose.aws.ddb.DynamoDB({
                endpoint: Environment.DYNAMODB_ENDPOINT,
                region: 'us-east-1',
                credentials: {
                    accessKeyId: 'test',
                    secretAccessKey: 'test'
                }
            });
            dynamoose.aws.ddb.set(ddb);
        }
        else {
            logger.info('Initializing DynamoDB with AWS', {
                table: Environment.DYNAMODB_TABLE_NAME
            });
        }
        isInitialized = true;
        logger.info('DynamoDB initialized successfully');
    }
    catch (error) {
        logger.error('Failed to initialize DynamoDB', error);
        throw error;
    }
}
//# sourceMappingURL=dynamodb.config.js.map