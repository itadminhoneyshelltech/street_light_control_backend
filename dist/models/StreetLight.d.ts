export interface IStreetLight {
    id?: string;
    light_id: string;
    name: string;
    city: string;
    latitude: number;
    longitude: number;
    address: string;
    status: 'on' | 'off' | 'error';
    is_automatic: boolean;
    last_status_change: Date;
    error_details?: string;
    brightness?: number;
    energy_consumption: number;
    installation_date: Date;
    maintenance_schedule?: Date;
    created_at: Date;
    updated_at: Date;
}
//# sourceMappingURL=StreetLight.d.ts.map