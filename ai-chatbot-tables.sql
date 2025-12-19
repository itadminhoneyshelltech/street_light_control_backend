-- AI Chatbot Database Tables
-- Run this to enable AI chatbot functionality

USE street_light_control;

-- Table for storing AI chatbot conversations
CREATE TABLE IF NOT EXISTS ai_chatbot_conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    message TEXT NOT NULL,
    intent_type VARCHAR(50),
    response TEXT NOT NULL,
    executed_action JSON,
    user_rating TINYINT DEFAULT NULL COMMENT '1-5 rating',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI chatbot conversation history';

-- Table for logging AI automation actions
CREATE TABLE IF NOT EXISTS ai_automation_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    light_id VARCHAR(100),
    action VARCHAR(20) NOT NULL COMMENT 'on, off, dim, etc',
    reason VARCHAR(255) NOT NULL COMMENT 'Why AI took this action',
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result JSON COMMENT 'Execution result details',
    INDEX idx_light_id (light_id),
    INDEX idx_executed_at (executed_at),
    FOREIGN KEY (light_id) REFERENCES street_lights(light_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI automatic control actions log';

-- Table for AI learning patterns
CREATE TABLE IF NOT EXISTS ai_command_patterns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_phrase TEXT NOT NULL,
    normalized_command VARCHAR(255) NOT NULL,
    intent_type VARCHAR(50),
    success_count INT DEFAULT 0,
    failure_count INT DEFAULT 0,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_intent_type (intent_type),
    INDEX idx_last_used (last_used_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI command pattern learning';

-- Insert sample conversation for testing
INSERT INTO ai_chatbot_conversations (user_id, message, intent_type, response, executed_action)
VALUES 
(1, 'Turn on all lights', 'LIGHT_CONTROL', 'Done! I have turned on 7 lights.', '{"lights_updated": 7, "action": "on"}'),
(1, 'Show status', 'STATUS_QUERY', 'Found 7 lights. 7 are ON, 0 are OFF. Average battery: 95%.', '{"lights_found": 7}');

-- Add AI user to users table if not exists
INSERT IGNORE INTO users (id, name, email, password, role, city, is_active)
VALUES (999, 'AI Assistant', 'ai@streetlight.system', 'NO_PASSWORD', 'admin', 'System', 1);

SELECT 'AI Chatbot tables created successfully!' as status;
