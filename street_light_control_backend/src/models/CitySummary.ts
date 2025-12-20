// TypeScript interface for CitySummary
// Note: Using PHP/MySQL backend instead of MongoDB

export interface ICitySummary {
  id?: string;
  city: string;
  total_lights: number;
  lights_on: number;
  lights_off: number;
  lights_in_error: number;
  last_updated: Date;
}
