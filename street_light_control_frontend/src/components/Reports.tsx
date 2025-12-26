import React, { useState } from 'react';
import '../styles/Reports.css';

interface ReportsProps {
  city?: string;
}

export const Reports: React.FC<ReportsProps> = ({ city }) => {
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedWards, setSelectedWards] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [monthYear, setMonthYear] = useState('');
  const [singleDate, setSingleDate] = useState('');
  const [reportName, setReportName] = useState('1');
  const [reportType, setReportType] = useState('66');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showSingleDate, setShowSingleDate] = useState(false);

  const handleReportChange = (value: string) => {
    setReportName(value);
    // Adjust date picker visibility based on report type if needed
  };

  const handleLoadTable = () => {
    console.log('Loading RLC Table with zones:', selectedZones, 'wards:', selectedWards);
  };

  const handleViewReport = () => {
    console.log('Viewing report:', {
      reportName,
      reportType,
      fromDate,
      toDate,
      monthYear,
      singleDate,
      zones: selectedZones,
      wards: selectedWards
    });
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Reports & Analytics</h2>
        <p>Generate comprehensive reports for street light monitoring and energy management</p>
      </div>

      <div className="reports-content">
        {/* Zone and Ward Selection */}
        <div className="form-row">
          <div className="form-group col-3">
            <label htmlFor="zone">Zone:</label>
            <select 
              className="form-control" 
              id="zone" 
              multiple 
              value={selectedZones}
              onChange={(e) => setSelectedZones(Array.from(e.target.selectedOptions, option => option.value))}
            >
              <option value="1">Shiggaon Const</option>
            </select>
          </div>

          <div className="form-group col-3">
            <label htmlFor="ward">Ward:</label>
            <select 
              className="form-control" 
              id="ward" 
              multiple
              value={selectedWards}
              onChange={(e) => setSelectedWards(Array.from(e.target.selectedOptions, option => option.value))}
            >
              <option value="1">Bankapura</option>
              <option value="3">Savanur</option>
              <option value="2">Shiggaon</option>
            </select>
          </div>

          <div className="form-group col-3">
            <button 
              className="btn btn-primary load-map" 
              id="loadtable"
              onClick={handleLoadTable}
            >
              Load RLC Table
            </button>
            <input type="text" id="projectid" hidden />
          </div>
        </div>

        {/* Date Selection */}
        <div className="form-row">
          <div className="form-group col-2 date-picker">
            <label htmlFor="fromdate">From:</label>
            <input 
              className="form-control" 
              type="date" 
              id="fromdate"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="form-group col-2 date-picker to-date">
            <label htmlFor="todate">To:</label>
            <input 
              className="form-control" 
              type="date" 
              id="todate"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className={`form-group col-4 month-picker ${showMonthPicker ? '' : 'hide'}`}>
            <label htmlFor="monthSelector">Month-Year:</label>
            <input 
              className="form-control" 
              type="month" 
              id="monthSelector"
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
            />
          </div>

          <div className={`form-group col-4 single-date-picker ${showSingleDate ? '' : 'hide'}`}>
            <label htmlFor="singleDate">Date:</label>
            <input 
              className="form-control" 
              type="date" 
              id="singleDate"
              value={singleDate}
              onChange={(e) => setSingleDate(e.target.value)}
            />
          </div>

          <div className="form-group col-3">
            <label htmlFor="reportname">Report:</label>
            <select 
              className="form-control" 
              id="reportname"
              value={reportName}
              onChange={(e) => handleReportChange(e.target.value)}
            >
              <option value="1">Energy Report</option>
              <option value="85">Spectrum Energy Report</option>
              <option value="2">Failure Report</option>
              <option value="93">Live Power Failure</option>
              <option value="20">Present Lamp Failure</option>
              <option value="3">Historical Lamp Failure</option>
              <option value="4">Error Log Report</option>
              <option value="5">Live Status Report</option>
              <option value="6">Maintenance Report</option>
              <option value="8">Day Report</option>
              <option value="12">Lamp Report</option>
              <option value="13">Lamp History Report</option>
              <option value="15">ILMLIVESTATUS</option>
              <option value="16">Configuration Report</option>
              <option value="17">HUBCONFIGURATION</option>
              <option value="18">PENALTY</option>
              <option value="22">Lamp Glow Rate Report</option>
              <option value="31">Faulty Lamps Reports</option>
              <option value="94">Connected Lamp Report</option>
              <option value="95">SPECTRUM RR report</option>
              <option value="23">Lamp Count Report</option>
            </select>
          </div>

          <div className="form-group col-3">
            <label htmlFor="reporttype">Type:</label>
            <select 
              className="form-control" 
              id="reporttype"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="66">ALL</option>
              <option value="1">OK</option>
              <option value="2">HNB</option>
              <option value="3">FAIL</option>
              <option value="0">NC</option>
            </select>
          </div>

          <div className="form-group col-2">
            <button 
              className="btn btn-primary view-report" 
              id="reportview"
              onClick={handleViewReport}
            >
              View Report
            </button>
          </div>
        </div>

        {/* Report Output Area */}
        <div className="report-output">
          <div className="report-placeholder">
            <p>Select report parameters and click "View Report" to generate</p>
          </div>
        </div>
      </div>
    </div>
  );
};
