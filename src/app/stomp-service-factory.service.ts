import {Injectable} from '@angular/core';
import {StompConfig, StompService} from '@stomp/ng2-stompjs';
import * as SockJS from 'sockjs-client';

@Injectable()
export class StompServiceFactoryService {

  private services = {};

  constructor() {
  }

  public get(sessionId: string): StompService {
    if (!this.services[sessionId]) {
      this.services[sessionId] = new StompService(this.config(sessionId));
    }
    return this.services[sessionId];
  }

  private config(sessionId: string): StompConfig {
    return {
      // Which server?
      // url: 'ws://127.0.0.1:15674/ws',
      url: () => {
        return new SockJS('/icp/ws') as WebSocket;
      },

      // Headers
      // Typical keys: login, passcode, host
      headers: {
        login: 'guest',
        passcode: 'guest',
        sessionId: sessionId
      },

      // How often to heartbeat?
      // Interval in milliseconds, set to 0 to disable
      heartbeat_in: 0, // Typical value 0 - disabled
      heartbeat_out: 20000, // Typical value 20000 - every 20 seconds
      // Wait in milliseconds before attempting auto reconnect
      // Set to 0 to disable
      // Typical value 5000 (5 seconds)
      reconnect_delay: 5000,

      // Will log diagnostics on console
      debug: true
    };
  }
}
