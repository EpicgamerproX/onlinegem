import { supabase } from './supabaseClient.js';

export const MAP_ID = 'office_v1';

export const DEFAULT_WORLD_STATE = {
  map_id: MAP_ID,
  position_x: 0,
  position_y: 1.6,
  position_z: 2,
  rotation_yaw: 0,
  rotation_pitch: 0,
  fear_level: 0
};

export class WorldStateService {
  constructor(userId) {
    this.userId = userId;
  }

  async load() {
    const { data, error } = await supabase
      .from('player_world_state')
      .select('map_id, position_x, position_y, position_z, rotation_yaw, rotation_pitch, fear_level')
      .eq('user_id', this.userId)
      .eq('map_id', MAP_ID)
      .maybeSingle();

    if (error) throw error;
    return data || DEFAULT_WORLD_STATE;
  }

  async save(snapshot, reason = 'autosave') {
    const payload = {
      user_id: this.userId,
      map_id: MAP_ID,
      position_x: snapshot.position.x,
      position_y: snapshot.position.y,
      position_z: snapshot.position.z,
      rotation_yaw: snapshot.yaw,
      rotation_pitch: snapshot.pitch,
      fear_level: snapshot.fearLevel,
      saved_reason: reason
    };

    const { error } = await supabase
      .from('player_world_state')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) {
      console.warn('Failed to save world state:', error);
    }
  }
}
