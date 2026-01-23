import { injectable } from 'inversify'
import { EventBridge } from '@aws-sdk/client-eventbridge'
import { config } from '../config/environment.js'
import { Logger } from '../utils/logger.js'
import { DomainEvent, EVENT_SOURCE, EVENT_VERSION } from './event-types.js'
import { randomUUID } from 'crypto'

export interface EventBusService {
  publish(event: DomainEvent): Promise<void>
  publishBatch(events: DomainEvent[]): Promise<void>
}

@injectable()
export class EventBridgeService implements EventBusService {
  private readonly eventBridge: EventBridge
  private readonly logger = Logger.of('EventBridgeService')
  private readonly eventBusName: string

  constructor() {
    const clientConfig: any = {
      region: config.AWS_REGION
    }

    // Configure for LocalStack in local environment
    if (config.IS_LOCAL && config.EVENTBRIDGE_ENDPOINT) {
      this.logger.info('Initializing EventBridge for LocalStack', {
        endpoint: config.EVENTBRIDGE_ENDPOINT
      })
      clientConfig.endpoint = config.EVENTBRIDGE_ENDPOINT
      clientConfig.credentials = {
        accessKeyId: 'test',
        secretAccessKey: 'test'
      }
    }

    this.eventBridge = new EventBridge(clientConfig)
    this.eventBusName = config.IDENTITY_EVENT_BUS_NAME

    this.logger.info('EventBridge service initialized', {
      eventBusName: this.eventBusName,
      isLocal: config.IS_LOCAL
    })
  }

  async publish(event: DomainEvent): Promise<void> {
    this.logger.info('Publishing event', {
      eventType: event.eventType,
      eventId: event.eventId
    })

    try {
      const entry = this.buildEventEntry(event)

      const result = await this.eventBridge.putEvents({
        Entries: [entry]
      })

      if (result.FailedEntryCount && result.FailedEntryCount > 0) {
        const failureDetails = result.Entries?.[0]
        this.logger.error('Failed to publish event', new Error(failureDetails?.ErrorMessage), {
          eventType: event.eventType,
          errorCode: failureDetails?.ErrorCode
        })
        throw new Error(`Failed to publish event: ${failureDetails?.ErrorMessage}`)
      }

      this.logger.info('Event published successfully', {
        eventType: event.eventType,
        eventId: event.eventId
      })

    } catch (error: any) {
      this.logger.error('Error publishing event', error, {
        eventType: event.eventType
      })
      throw error
    }
  }

  async publishBatch(events: DomainEvent[]): Promise<void> {
    if (events.length === 0) {
      this.logger.warn('Attempted to publish empty batch')
      return
    }

    this.logger.info('Publishing event batch', {
      count: events.length,
      eventTypes: events.map(e => e.eventType)
    })

    try {
      const entries = events.map(event => this.buildEventEntry(event))

      const result = await this.eventBridge.putEvents({
        Entries: entries
      })

      if (result.FailedEntryCount && result.FailedEntryCount > 0) {
        const failures = result.Entries?.filter(e => e.ErrorCode) || []
        this.logger.error('Failed to publish some events in batch', new Error('Batch publish partial failure'), {
          failedCount: result.FailedEntryCount,
          failures: failures.map(f => ({
            errorCode: f.ErrorCode,
            errorMessage: f.ErrorMessage
          }))
        })
        throw new Error(`Failed to publish ${result.FailedEntryCount} events in batch`)
      }

      this.logger.info('Event batch published successfully', {
        count: events.length
      })

    } catch (error: any) {
      this.logger.error('Error publishing event batch', error, {
        count: events.length
      })
      throw error
    }
  }

  private buildEventEntry(event: DomainEvent) {
    // Ensure event has required base fields
    const enrichedEvent: DomainEvent = {
      ...event,
      eventId: event.eventId || randomUUID(),
      eventTime: event.eventTime || new Date().toISOString(),
      source: EVENT_SOURCE,
      version: EVENT_VERSION
    }

    return {
      Time: new Date(enrichedEvent.eventTime),
      Source: enrichedEvent.source,
      DetailType: enrichedEvent.eventType,
      Detail: JSON.stringify(enrichedEvent),
      EventBusName: this.eventBusName
    }
  }
}
