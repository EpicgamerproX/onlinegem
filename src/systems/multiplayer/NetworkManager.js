import { supabase } from '../../services/supabaseClient.js';
import { MAP_ID } from '../../services/WorldStateService.js';

export class NetworkManager {
  constructor(playerSync) {
    this.playerSync = playerSync;
    this.channel = null;
    this.user = null;
    this.profile = null;
    this.lastBroadcast = 0;
    this.lastPresenceTrack = 0;
  }

  async init({ user, profile }) {
    this.user = user;
    this.profile = profile;
    this.channel = supabase.channel(`office:${MAP_ID}`, {
      config: {
        presence: {
          key: user.id
        },
        broadcast: {
          self: false
        }
      }
    });

    this.channel
      .on('presence', { event: 'sync' }, () => this.syncPresence())
      .on('presence', { event: 'leave' }, ({ key }) => this.playerSync.removePlayer(key))
      .on('broadcast', { event: 'player_state' }, ({ payload }) => {
        if (payload.user_id !== this.user.id) this.playerSync.upsertPlayer(payload);
      });

    await this.channel.subscribe(async status => {
      if (status === 'SUBSCRIBED') {
        await this.trackPresence(this.lastPayload || this.createPayload());
      }
    });
  }

  update(cameraController, deltaTime) {
    if (!this.channel) return;

    this.playerSync.update(deltaTime);
    const now = performance.now();
    if (now - this.lastBroadcast < 120) return;
    this.lastBroadcast = now;

    const payload = this.createPayload(cameraController);
    this.lastPayload = payload;
    this.channel.send({
      type: 'broadcast',
      event: 'player_state',
      payload
    });
    if (now - this.lastPresenceTrack > 2000) {
      this.lastPresenceTrack = now;
      this.trackPresence(payload);
    }
  }

  createPayload(cameraController = null) {
    const pose = cameraController?.getPose?.();
    return {
      user_id: this.user.id,
      username: this.profile.username,
      display_name: this.profile.display_name,
      map_id: MAP_ID,
      x: pose?.position.x ?? 0,
      y: pose?.position.y ?? 1.6,
      z: pose?.position.z ?? 2,
      yaw: pose?.yaw ?? 0,
      pitch: pose?.pitch ?? 0
    };
  }

  async trackPresence(payload) {
    if (!this.channel) return;
    await this.channel.track(payload);
  }

  syncPresence() {
    const state = this.channel.presenceState();
    Object.entries(state).forEach(([userId, presences]) => {
      if (userId === this.user.id) return;
      const latest = presences[presences.length - 1];
      this.playerSync.upsertPlayer(latest);
    });
  }

  async destroy() {
    if (!this.channel) return;
    await this.channel.untrack();
    await supabase.removeChannel(this.channel);
    this.channel = null;
  }
}
