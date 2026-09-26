import {
  DeliveryStatusChangedEvent,
  DeliveryStatusUpdateEmitPayload,
  DriverLocationEmitPayload,
  DriverPositionUpdateEvent,
} from './types';

export const TRACKING_SOCKET_NAMESPACE = '/tracking';

export interface TrackingSocketEvents {
  // Client emits:
  'driver:location': (payload: DriverLocationEmitPayload) => void;
  'delivery:status-update': (payload: DeliveryStatusUpdateEmitPayload) => void;
  'dashboard:get-all-positions': () => void;

  // Server emits / broadcasts:
  'driver:position-updated': (event: DriverPositionUpdateEvent) => void;
  'delivery:status-changed': (event: DeliveryStatusChangedEvent) => void;
  'dashboard:all-positions': (positions: Array<{ driver_id: string; latitude: number; longitude: number; updatedAt: string }>) => void;
}
