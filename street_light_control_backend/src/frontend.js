
import { getOverallSummary } from './frontend_overallsummary.js';
import { getCCMSList } from './frontend_ccms.js';

export function setupFrontend(app, pool) {
  
  // GET /api/front_end_query - Dynamic query based on trigger
  app.get('/api/front_end_query', async (req, res) => {
    let trigger = req.query.trigger;
    console.log('Frontend query trigger:', trigger);
        // Normalize common aliases
    const uid = req.query.uid || null;
    const event = req.query.event || null;
    
    let conn;
    try {
      conn = await pool.getConnection();
      
      // Handle different triggers dynamically
      let responseData = {};
      
      switch(trigger) {
        case 'overallSummary':
          responseData = await getOverallSummary(conn);
          break;
       
        case 'ccms':
          responseData = await getCCMSList(conn);
          break;
        default:
          return res.status(400).json({ 
            status: 'error', 
            error_status: 'invalid_trigger',
            message: `Unknown trigger: ${trigger}`,
          });
      }
      
      return res.json({
        status: 'success',
        trigger: trigger,
        data: responseData
      });
      
    } catch (err) {
      console.error('DB error:', err);
      return res.status(500).json({ 
        status: 'error', 
        error_status: 'db_query_failed',
        message: err.message 
      });
    } finally {
      if (conn) conn.release();
    }
  });

  // GET /api/front_end_query/uid/:uid - Shortcut for StatsForUID
  app.get('/api/front_end_query/uid/:uid', async (req, res) => {
    req.query.uid = req.params.uid;
    req.query.trigger = 'StatsForUID';
    // Call the main handler by using app.emit and re-routing, or just duplicate logic
    // For simplicity, we'll forward the call
    const newReq = Object.create(req);
    newReq.query = { trigger: 'StatsForUID', uid: req.params.uid };
    const mockRes = res;
    
    // Re-call the main endpoint handler
    app._router.stack.forEach(middleware => {
      if (middleware.route && middleware.route.path === '/api/front_end_query') {
        middleware.route.stack[0].handle(newReq, mockRes);
      }
    });
  });

}
