// TypeScript interface for ControlLog
// Note: Using PHP/MySQL backend instead of MongoDB

export interface IControlLog {
  id?: string;
  light_id: string;
  action: 'on' | 'off' | 'brightness_change' | 'mode_change';
  performed_by: string;
  user_id?: string;
  control_type: 'manual' | 'automatic';
  previous_status: string;
  new_status: string;
  reason?: string;
  created_at: Date;
}
