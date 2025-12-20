# Street Light Control System - Database ER Diagram

## Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ control_logs : "performs"
    street_lights ||--o{ control_logs : "has"
    street_lights ||--o| smart_meters : "connected_to"
    street_lights ||--o{ energy_parameters : "monitors"
    street_lights ||--o{ schedules : "has"
    street_lights ||--o| battery_status : "has"
    street_lights ||--o{ gsm_communication_log : "communicates"
    street_lights ||--o{ alerts : "generates"

    users {
        int id PK
        string name
        string email UK
        string password
        enum role
        string city
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    street_lights {
        int id PK
        string light_id UK
        string name
        string city
        decimal latitude
        decimal longitude
        text address
        enum status
        boolean is_automatic
        timestamp last_status_change
        text error_details
        int brightness
        float energy_consumption
        timestamp installation_date
        timestamp maintenance_schedule
        boolean schedule_enabled
        time sunrise_time
        time sunset_time
        int battery_backup_hours
        enum battery_status
        string gsm_imei
        int gsm_signal_strength
        enum communication_type
        boolean maintenance_required
        timestamp created_at
        timestamp updated_at
    }

    control_logs {
        int id PK
        string light_id FK
        enum action
        string performed_by
        int user_id FK
        enum control_type
        string previous_status
        string new_status
        text reason
        timestamp created_at
    }

    city_summary {
        int id PK
        string city UK
        int total_lights
        int lights_on
        int lights_off
        int lights_in_error
        timestamp last_updated
    }

    smart_meters {
        int id PK
        string light_id UK,FK
        string meter_id UK
        enum meter_type
        string gsm_imei
        enum phase_type
        timestamp created_at
        timestamp updated_at
    }

    energy_parameters {
        int id PK
        string light_id FK
        string meter_id
        timestamp timestamp
        decimal phase_a_voltage
        decimal phase_b_voltage
        decimal phase_c_voltage
        decimal phase_a_current
        decimal phase_b_current
        decimal phase_c_current
        decimal phase_a_power_factor
        decimal phase_b_power_factor
        decimal phase_c_power_factor
        decimal frequency
        decimal total_active_power
        decimal total_apparent_power
        decimal cumulative_kwh
        decimal cumulative_kvah
        int power_unavailable_hours
        timestamp created_at
    }

    schedules {
        int id PK
        string light_id FK
        boolean enabled
        enum schedule_type
        time start_time
        time end_time
        boolean monday
        boolean tuesday
        boolean wednesday
        boolean thursday
        boolean friday
        boolean saturday
        boolean sunday
        date seasonal_start_date
        date seasonal_end_date
        enum action
        int brightness_level
        timestamp created_at
        timestamp updated_at
    }

    battery_status {
        int id PK
        string light_id UK,FK
        int backup_hours_available
        int current_charge_percentage
        enum status
        datetime last_discharge_time
        int discharge_duration_hours
        timestamp created_at
        timestamp updated_at
    }

    gsm_communication_log {
        int id PK
        string light_id FK
        string gsm_imei
        int signal_strength
        text message_sent
        text message_received
        enum status
        timestamp created_at
    }

    alerts {
        int id PK
        string light_id FK
        enum alert_type
        enum severity
        text message
        boolean is_resolved
        timestamp created_at
        timestamp resolved_at
    }
```

## Table Cardinality Legend

| Relationship | Cardinality | Description |
|-------------|-------------|-------------|
| users → control_logs | 1:N | One user can perform many control actions |
| street_lights → control_logs | 1:N | One light can have many control log entries |
| street_lights → smart_meters | 1:1 | One light has one smart meter (optional) |
| street_lights → energy_parameters | 1:N | One light has many energy readings over time |
| street_lights → schedules | 1:N | One light can have multiple schedules |
| street_lights → battery_status | 1:1 | One light has one battery status record |
| street_lights → gsm_communication_log | 1:N | One light has many communication logs |
| street_lights → alerts | 1:N | One light can generate many alerts |

## Key Relationships Explained

### Primary Relationships
- **`street_lights`** is the central hub table - all CCMS tables reference it via `light_id`
- **`users`** links to `control_logs` to track who performed manual actions
- **`city_summary`** is independent (no FK) - aggregated data for dashboard performance

### Data Integrity
- All foreign keys use `ON DELETE CASCADE` except:
  - `control_logs.user_id` uses `ON DELETE SET NULL` (preserve logs even if user deleted)
- Unique constraints ensure:
  - One meter per light (`smart_meters.light_id` unique)
  - One battery record per light (`battery_status.light_id` unique)
  - No duplicate light IDs (`street_lights.light_id` unique)

### Indexes
- Performance indexes on:
  - All foreign key columns
  - `city` columns (for filtering)
  - `created_at` timestamps (for time-based queries)
  - GPS coordinates (`latitude`, `longitude` composite index)

## Database Size Estimation

Assuming 10,000 street lights with 1 year of data:

| Table | Records | Est. Size |
|-------|---------|-----------|
| users | 100-500 | < 1 MB |
| street_lights | 10,000 | ~2 MB |
| control_logs | ~3.65M | ~500 MB |
| city_summary | 10-100 | < 1 MB |
| smart_meters | 10,000 | ~1 MB |
| energy_parameters | ~87.6M | ~15 GB |
| schedules | 10,000-30,000 | ~5 MB |
| battery_status | 10,000 | ~1 MB |
| gsm_communication_log | ~3.65M | ~800 MB |
| alerts | ~365K | ~100 MB |
| **TOTAL** | | **~17 GB/year** |

*Assumptions: 1 energy reading/15min (96/day), 1 control action/day, 100 alerts/day*

## Performance Recommendations

1. **Partitioning**:
   - Partition `energy_parameters` by month (most data-heavy)
   - Partition `control_logs` by quarter
   - Partition `gsm_communication_log` by month

2. **Archival Strategy**:
   - Archive `energy_parameters` older than 6 months to cold storage
   - Keep `control_logs` for 2 years, then archive
   - Retain `alerts` indefinitely (small size)

3. **Indexing**:
   - Add composite index on `energy_parameters(light_id, timestamp)` for time-series queries
   - Add index on `alerts(is_resolved, severity)` for dashboard filters

4. **Materialized Views**:
   - Create hourly/daily aggregate views for `energy_parameters`
   - Pre-calculate common report queries

## Query Examples

### Get Light Status with Battery and Meter
```sql
SELECT 
    sl.light_id,
    sl.name,
    sl.status,
    bs.current_charge_percentage,
    sm.meter_id,
    ep.total_active_power
FROM street_lights sl
LEFT JOIN battery_status bs ON sl.light_id = bs.light_id
LEFT JOIN smart_meters sm ON sl.light_id = sm.light_id
LEFT JOIN energy_parameters ep ON sl.light_id = ep.light_id
WHERE sl.city = 'Delhi'
ORDER BY ep.timestamp DESC
LIMIT 1;
```

### Get Unresolved Critical Alerts
```sql
SELECT 
    a.light_id,
    sl.name,
    a.alert_type,
    a.message,
    a.created_at
FROM alerts a
JOIN street_lights sl ON a.light_id = sl.light_id
WHERE a.is_resolved = FALSE
  AND a.severity = 'critical'
ORDER BY a.created_at DESC;
```

### Daily Energy Consumption by City
```sql
SELECT 
    sl.city,
    DATE(ep.created_at) as date,
    SUM(ep.total_active_power) as total_kwh,
    COUNT(DISTINCT ep.light_id) as lights_reporting
FROM energy_parameters ep
JOIN street_lights sl ON ep.light_id = sl.light_id
WHERE ep.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY sl.city, DATE(ep.created_at)
ORDER BY date DESC, total_kwh DESC;
```
