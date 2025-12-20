<?php

// CCMS ReportsController (PHP stack)
// Uses existing router + Response helper
class ReportsController
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    /**
     * Get energy saving report
     * GET /api/reports/energy-saving?city_id=1&start_date=2024-01-01&end_date=2024-12-31
     */
    public function getEnergySavingReport()
    {
        $user = AuthMiddleware::authenticate();

        $cityId = isset($_GET['city_id']) ? intval($_GET['city_id']) : null;
        $startDate = $_GET['start_date'] ?? date('Y-m-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-d');

        if (!$cityId) {
            Response::error('City ID required', 400);
        }

        $dailySql = "SELECT report_date as date,
                            SUM(energy_consumed_kwh) as energy_kwh,
                            SUM(energy_cost_estimated) as cost,
                            AVG(uptime_percentage) as avg_uptime,
                            SUM(lights_faulty_count) as total_faulty,
                            COUNT(DISTINCT feeder_panel_id) as panel_count
                     FROM daily_energy_reports
                     WHERE city_id = ? AND report_date BETWEEN ? AND ?
                     GROUP BY report_date
                     ORDER BY report_date DESC";

        $dailyResult = $this->runQuery($dailySql, 'iss', [$cityId, $startDate, $endDate]);
        $dailyData = $dailyResult->fetch_all(MYSQLI_ASSOC);

        $summarySql = "SELECT SUM(energy_consumed_kwh) as total_energy_kwh,
                              SUM(energy_cost_estimated) as total_cost,
                              AVG(uptime_percentage) as avg_uptime,
                              MAX(peak_load_kw) as peak_load,
                              COUNT(DISTINCT report_date) as days_reported
                       FROM daily_energy_reports
                       WHERE city_id = ? AND report_date BETWEEN ? AND ?";

        $summaryResult = $this->runQuery($summarySql, 'iss', [$cityId, $startDate, $endDate]);
        $summary = $summaryResult->fetch_assoc();

        Response::success([
            'period' => ['start' => $startDate, 'end' => $endDate],
            'daily_data' => $dailyData,
            'summary' => $summary
        ], 'Energy saving report generated');
    }

    /**
     * Get lamp failure report
     * GET /api/reports/lamp-failure?city_id=1&ward_id=1&start_date=2024-01-01&end_date=2024-12-31
     */
    public function getLampFailureReport()
    {
        $user = AuthMiddleware::authenticate();

        $cityId = isset($_GET['city_id']) ? intval($_GET['city_id']) : null;
        $wardId = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : null;
        $startDate = $_GET['start_date'] ?? date('Y-m-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-d');

        if (!$cityId) {
            Response::error('City ID required', 400);
        }

        $query = "SELECT ll.light_id, ll.light_name, ll.wattage, ll.type,
                         fp.panel_name, w.ward_name, z.zone_name,
                         SUM(CASE WHEN f.fault_type = 'led_failure' THEN 1 ELSE 0 END) as failure_count,
                         MAX(ll.faulty_since) as first_failure_date,
                         ll.failure_count as total_historical_failures,
                         ll.status as current_status
                  FROM led_luminaires ll
                  JOIN feeder_panels fp ON ll.feeder_panel_id = fp.id
                  JOIN wards w ON fp.ward_id = w.id
                  JOIN zones z ON fp.zone_id = z.id
                  LEFT JOIN fault_logs f ON ll.id = f.light_id 
                       AND f.fault_type = 'led_failure'
                       AND f.created_at BETWEEN ? AND ?
                  WHERE fp.city_id = ?";

        $types = 'ssi';
        $params = [$startDate, $endDate, $cityId];

        if ($wardId) {
            $query .= ' AND fp.ward_id = ?';
            $types .= 'i';
            $params[] = $wardId;
        }

        $query .= " GROUP BY ll.id HAVING failure_count > 0 OR total_historical_failures > 0
                     ORDER BY failure_count DESC";

        $result = $this->runQuery($query, $types, $params);
        $failures = $result->fetch_all(MYSQLI_ASSOC);

        $summaryQuery = "SELECT COUNT(DISTINCT ll.id) as total_failed_lights,
                                COUNT(DISTINCT f.id) as total_failures,
                                AVG(ll.failure_count) as avg_failures_per_light
                         FROM led_luminaires ll
                         JOIN feeder_panels fp ON ll.feeder_panel_id = fp.id
                         LEFT JOIN fault_logs f ON ll.id = f.light_id
                         WHERE fp.city_id = ?";

        $summaryTypes = 'i';
        $summaryParams = [$cityId];
        if ($wardId) {
            $summaryQuery .= ' AND fp.ward_id = ?';
            $summaryTypes .= 'i';
            $summaryParams[] = $wardId;
        }

        $summaryResult = $this->runQuery($summaryQuery, $summaryTypes, $summaryParams);
        $summary = $summaryResult->fetch_assoc();

        Response::success([
            'period' => ['start' => $startDate, 'end' => $endDate],
            'failures' => $failures,
            'summary' => $summary
        ], 'Lamp failure report generated');
    }

    /**
     * Get system uptime report
     * GET /api/reports/uptime?city_id=1&start_date=2024-01-01&end_date=2024-12-31
     */
    public function getUptimeReport()
    {
        $user = AuthMiddleware::authenticate();

        $cityId = isset($_GET['city_id']) ? intval($_GET['city_id']) : null;
        $zoneId = isset($_GET['zone_id']) ? intval($_GET['zone_id']) : null;
        $wardId = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : null;
        $startDate = $_GET['start_date'] ?? date('Y-m-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-d');

        if (!$cityId) {
            Response::error('City ID required', 400);
        }

        $query = "SELECT c.city_name, z.zone_name, w.ward_name,
                         fp.panel_name, fp.panel_code,
                         AVG(der.uptime_percentage) as avg_uptime,
                         MIN(der.uptime_percentage) as min_uptime,
                         MAX(der.uptime_percentage) as max_uptime,
                         COUNT(der.report_date) as days_reported,
                         SUM(CASE WHEN der.uptime_percentage < 99 THEN 1 ELSE 0 END) as low_uptime_days
                  FROM daily_energy_reports der
                  JOIN feeder_panels fp ON der.feeder_panel_id = fp.id
                  JOIN wards w ON fp.ward_id = w.id
                  JOIN zones z ON fp.zone_id = z.id
                  JOIN cities c ON fp.city_id = c.id
                  WHERE fp.city_id = ?";

        $types = 'i';
        $params = [$cityId];

        if ($zoneId) {
            $query .= ' AND fp.zone_id = ?';
            $types .= 'i';
            $params[] = $zoneId;
        }
        if ($wardId) {
            $query .= ' AND fp.ward_id = ?';
            $types .= 'i';
            $params[] = $wardId;
        }

        $query .= " AND der.report_date BETWEEN ? AND ?
                     GROUP BY der.feeder_panel_id
                     ORDER BY avg_uptime ASC";
        $types .= 'ss';
        $params[] = $startDate;
        $params[] = $endDate;

        $result = $this->runQuery($query, $types, $params);
        $panelUptime = $result->fetch_all(MYSQLI_ASSOC);

        $summaryQuery = "SELECT AVG(der.uptime_percentage) as system_uptime,
                                COUNT(DISTINCT der.feeder_panel_id) as total_panels,
                                SUM(CASE WHEN der.uptime_percentage >= 99.5 THEN 1 ELSE 0 END) as excellent_panels,
                                SUM(CASE WHEN der.uptime_percentage >= 99 AND der.uptime_percentage < 99.5 THEN 1 ELSE 0 END) as good_panels,
                                SUM(CASE WHEN der.uptime_percentage < 99 THEN 1 ELSE 0 END) as needs_attention_panels
                         FROM daily_energy_reports der
                         JOIN feeder_panels fp ON der.feeder_panel_id = fp.id
                         WHERE fp.city_id = ?";

        $summaryTypes = 'i';
        $summaryParams = [$cityId];
        if ($zoneId) {
            $summaryQuery .= ' AND fp.zone_id = ?';
            $summaryTypes .= 'i';
            $summaryParams[] = $zoneId;
        }
        if ($wardId) {
            $summaryQuery .= ' AND fp.ward_id = ?';
            $summaryTypes .= 'i';
            $summaryParams[] = $wardId;
        }
        $summaryQuery .= " AND der.report_date BETWEEN ? AND ?";
        $summaryTypes .= 'ss';
        $summaryParams[] = $startDate;
        $summaryParams[] = $endDate;

        $summaryResult = $this->runQuery($summaryQuery, $summaryTypes, $summaryParams);
        $summary = $summaryResult->fetch_assoc();

        Response::success([
            'period' => ['start' => $startDate, 'end' => $endDate],
            'panel_uptime' => $panelUptime,
            'summary' => $summary
        ], 'Uptime report generated');
    }

    /**
     * Get maintenance report
     * GET /api/reports/maintenance?city_id=1&status=completed
     */
    public function getMaintenanceReport()
    {
        $user = AuthMiddleware::authenticate();

        $cityId = isset($_GET['city_id']) ? intval($_GET['city_id']) : null;
        $status = $_GET['status'] ?? null;
        $contractorId = isset($_GET['contractor_id']) ? intval($_GET['contractor_id']) : null;
        $startDate = $_GET['start_date'] ?? date('Y-01-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-d');

        if (!$cityId) {
            Response::error('City ID required', 400);
        }

        $query = "SELECT mr.id, mr.request_type, mr.description, mr.priority,
                         mr.status, mr.assigned_date, mr.completion_date,
                         mr.estimated_cost, mr.actual_cost,
                         fp.panel_name, fp.panel_code,
                         c.contractor_name,
                         DATEDIFF(mr.completion_date, mr.assigned_date) as completion_days
                  FROM maintenance_requests mr
                  LEFT JOIN feeder_panels fp ON mr.feeder_panel_id = fp.id
                  LEFT JOIN contractors c ON mr.contractor_id = c.id
                  WHERE (fp.city_id = ? OR mr.asset_inventory_id IS NOT NULL)";

        $types = 'i';
        $params = [$cityId];

        if ($status) {
            $query .= ' AND mr.status = ?';
            $types .= 's';
            $params[] = $status;
        }
        if ($contractorId) {
            $query .= ' AND mr.contractor_id = ?';
            $types .= 'i';
            $params[] = $contractorId;
        }

        $query .= ' AND mr.assigned_date BETWEEN ? AND ? ORDER BY mr.assigned_date DESC';
        $types .= 'ss';
        $params[] = $startDate;
        $params[] = $endDate;

        $result = $this->runQuery($query, $types, $params);
        $maintenance = $result->fetch_all(MYSQLI_ASSOC);

        $summaryQuery = "SELECT COUNT(*) as total_requests,
                               SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                               SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                               SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_requests,
                               SUM(actual_cost) as total_spent,
                               AVG(actual_cost) as avg_cost_per_job,
                               AVG(completion_days) as avg_days_to_complete
                        FROM (
                          SELECT mr.*, DATEDIFF(mr.completion_date, mr.assigned_date) as completion_days
                          FROM maintenance_requests mr
                          LEFT JOIN feeder_panels fp ON mr.feeder_panel_id = fp.id
                          WHERE (fp.city_id = ? OR mr.asset_inventory_id IS NOT NULL)
                        ) sub";

        $summaryResult = $this->runQuery($summaryQuery, 'i', [$cityId]);
        $summary = $summaryResult->fetch_assoc();

        Response::success([
            'period' => ['start' => $startDate, 'end' => $endDate],
            'maintenance_requests' => $maintenance,
            'summary' => $summary
        ], 'Maintenance report generated');
    }

    /**
     * Get contractor performance report
     * GET /api/reports/contractor-performance?city_id=1&contractor_id=1
     */
    public function getContractorPerformanceReport()
    {
        $user = AuthMiddleware::authenticate();

        $contractorId = isset($_GET['contractor_id']) ? intval($_GET['contractor_id']) : null;
        $cityId = isset($_GET['city_id']) ? intval($_GET['city_id']) : null;
        $startDate = $_GET['start_date'] ?? date('Y-01-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-d');

        $query = "SELECT c.id, c.contractor_name, c.contractor_code, c.contact_person,
                         COUNT(mr.id) as total_jobs,
                         SUM(CASE WHEN mr.status = 'completed' THEN 1 ELSE 0 END) as completed_jobs,
                         AVG(cpl.quality_rating) as avg_quality,
                         AVG(cpl.timeliness_rating) as avg_timeliness,
                         AVG(cpl.professionalism_rating) as avg_professionalism,
                         SUM(CASE WHEN cpl.days_variance <= 0 THEN 1 ELSE 0 END) as on_time_jobs,
                         SUM(CASE WHEN cpl.days_variance > 0 THEN 1 ELSE 0 END) as delayed_jobs,
                         SUM(mr.actual_cost) as total_cost_incurred
                  FROM contractors c
                  LEFT JOIN maintenance_requests mr ON c.id = mr.contractor_id
                  LEFT JOIN contractor_performance_log cpl ON mr.id = cpl.maintenance_request_id
                  WHERE mr.assigned_date BETWEEN ? AND ?";

        $types = 'ss';
        $params = [$startDate, $endDate];

        if ($contractorId) {
            $query .= ' AND c.id = ?';
            $types .= 'i';
            $params[] = $contractorId;
        }
        $query .= ' GROUP BY c.id ORDER BY avg_quality DESC';

        $result = $this->runQuery($query, $types, $params);
        $contractors = $result->fetch_all(MYSQLI_ASSOC);

        Response::success([
            'period' => ['start' => $startDate, 'end' => $endDate],
            'contractors' => $contractors
        ], 'Contractor performance report generated');
    }

    /**
     * Get asset inventory report
     * GET /api/reports/asset-inventory?city_id=1&asset_type=led_luminaire
     */
    public function getAssetInventoryReport()
    {
        $user = AuthMiddleware::authenticate();

        $cityId = isset($_GET['city_id']) ? intval($_GET['city_id']) : null;
        $assetType = $_GET['asset_type'] ?? null;
        $status = $_GET['status'] ?? null;

        if (!$cityId) {
            Response::error('City ID required', 400);
        }

        $query = "SELECT asset_type,
                         status,
                         COUNT(*) as count,
                         SUM(purchase_cost) as total_cost,
                         AVG(failure_count) as avg_failures,
                         COUNT(CASE WHEN last_maintenance_date IS NOT NULL THEN 1 END) as maintained_count,
                         COUNT(CASE WHEN last_maintenance_date IS NULL THEN 1 END) as not_maintained_count
                  FROM asset_inventory
                  WHERE city_id = ?";

        $types = 'i';
        $params = [$cityId];

        if ($assetType) {
            $query .= ' AND asset_type = ?';
            $types .= 's';
            $params[] = $assetType;
        }
        if ($status) {
            $query .= ' AND status = ?';
            $types .= 's';
            $params[] = $status;
        }

        $query .= ' GROUP BY asset_type, status ORDER BY asset_type, status';

        $result = $this->runQuery($query, $types, $params);
        $inventory = $result->fetch_all(MYSQLI_ASSOC);

        Response::success([
            'inventory' => $inventory
        ], 'Asset inventory report generated');
    }

    private function runQuery($sql, $types, $params)
    {
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            Response::error('Failed to prepare query', 500);
        }

        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        return $stmt->get_result();
    }
}
?>
