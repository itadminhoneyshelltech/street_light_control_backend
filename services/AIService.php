<?php
// services/AIService.php
// AI service for natural language processing and intent recognition

class AIService {
    private $apiKey;
    private $model;
    private $useOpenAI;
    
    public function __construct() {
        // Check if OpenAI API key is configured
        $this->apiKey = getenv('OPENAI_API_KEY') ?: (defined('OPENAI_API_KEY') ? OPENAI_API_KEY : null);
        $this->model = 'gpt-3.5-turbo'; // or gpt-4
        $this->useOpenAI = !empty($this->apiKey);
    }
    
    /**
     * Analyze user message and extract intent + entities
     */
    public function analyzeIntent($message) {
        if ($this->useOpenAI) {
            return $this->analyzeWithOpenAI($message);
        } else {
            return $this->analyzeWithPatterns($message);
        }
    }
    
    /**
     * Analyze using OpenAI API
     */
    private function analyzeWithOpenAI($message) {
        $prompt = $this->buildAnalysisPrompt($message);
        
        $ch = curl_init('https://api.openai.com/v1/chat/completions');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'model' => $this->model,
            'messages' => [
                ['role' => 'system', 'content' => 'You are an AI assistant for street light control. Extract intent and entities from commands. Respond ONLY with valid JSON.'],
                ['role' => 'user', 'content' => $prompt]
            ],
            'temperature' => 0.3,
            'max_tokens' => 200
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200 || !$response) {
            error_log("OpenAI API failed, falling back to pattern matching");
            return $this->analyzeWithPatterns($message);
        }
        
        $data = json_decode($response, true);
        $content = $data['choices'][0]['message']['content'] ?? '';
        
        // Extract JSON from response
        if (preg_match('/\{.*\}/s', $content, $matches)) {
            $intent = json_decode($matches[0], true);
            if ($intent) {
                return $intent;
            }
        }
        
        return $this->analyzeWithPatterns($message);
    }
    
    /**
     * Build analysis prompt for AI
     */
    private function buildAnalysisPrompt($message) {
        return "Analyze this street light control command and return JSON with intent and entities.\n\n" .
               "User message: \"$message\"\n\n" .
               "Return JSON format:\n" .
               "{\n" .
               "  \"type\": \"INTENT_TYPE\",\n" .
               "  \"action\": \"action_name\",\n" .
               "  \"entities\": {\n" .
               "    \"light_id\": \"SL001\" (optional),\n" .
               "    \"city\": \"Delhi\" (optional),\n" .
               "    \"ward\": 5 (optional),\n" .
               "    \"brightness\": 75 (optional),\n" .
               "    \"filter\": \"low_battery\" (optional)\n" .
               "  }\n" .
               "}\n\n" .
               "Intent types: LIGHT_CONTROL, STATUS_QUERY, SCHEDULE_MANAGEMENT, ALERT_MANAGEMENT, INSPECTION_MANAGEMENT, ENERGY_QUERY, GREETING\n" .
               "Actions: on, off, status, create, enable, disable, list, resolve";
    }
    
    /**
     * Fallback: Pattern-based intent analysis (no API needed)
     */
    private function analyzeWithPatterns($message) {
        $message = strtolower(trim($message));
        
        // Light control patterns
        if (preg_match('/(turn|switch|set)\s+(on|off|all on|all off)/i', $message, $matches)) {
            $action = strpos($matches[2], 'off') !== false ? 'off' : 'on';
            
            $entities = ['action' => $action];
            
            // Extract brightness
            if (preg_match('/(\d+)\s*%|brightness\s+(\d+)|dim\s+to\s+(\d+)/i', $message, $brightnessMatch)) {
                $entities['brightness'] = intval($brightnessMatch[1] ?: $brightnessMatch[2] ?: $brightnessMatch[3]);
            }
            
            // Extract city
            if (preg_match('/in\s+([a-z]+)/i', $message, $cityMatch)) {
                $entities['city'] = ucfirst($cityMatch[1]);
            }
            
            // Extract light ID
            if (preg_match('/sl\d+|light\s+\d+/i', $message, $idMatch)) {
                $entities['light_id'] = strtoupper(str_replace(' ', '', $idMatch[0]));
            }
            
            // Extract ward
            if (preg_match('/ward\s+(\d+)/i', $message, $wardMatch)) {
                $entities['ward'] = intval($wardMatch[1]);
            }
            
            return [
                'type' => 'LIGHT_CONTROL',
                'action' => $action,
                'entities' => $entities
            ];
        }
        
        // Status query patterns
        if (preg_match('/(show|display|get|what|which|status|list)/i', $message)) {
            $entities = [];
            
            // Check for filters
            if (preg_match('/low battery|battery.*low/i', $message)) {
                $entities['filter'] = 'low_battery';
            } elseif (preg_match('/offline|not.*responding|disconnected/i', $message)) {
                $entities['filter'] = 'offline';
            } elseif (preg_match('/maintenance|repair|broken|faulty/i', $message)) {
                $entities['filter'] = 'maintenance';
            }
            
            // Extract city
            if (preg_match('/in\s+([a-z]+)/i', $message, $cityMatch)) {
                $entities['city'] = ucfirst($cityMatch[1]);
            }
            
            // Extract light ID
            if (preg_match('/sl\d+|light\s+\d+/i', $message, $idMatch)) {
                $entities['light_id'] = strtoupper(str_replace(' ', '', $idMatch[0]));
            }
            
            return [
                'type' => 'STATUS_QUERY',
                'action' => 'get_status',
                'entities' => $entities
            ];
        }
        
        // Schedule patterns
        if (preg_match('/(schedule|automatic|auto|sunset|sunrise|midnight)/i', $message)) {
            $entities = [];
            
            if (preg_match('/enable|turn on|activate|create/i', $message)) {
                $entities['schedule_action'] = 'enable';
            } elseif (preg_match('/disable|turn off|deactivate|remove/i', $message)) {
                $entities['schedule_action'] = 'disable';
            } else {
                $entities['schedule_action'] = 'create';
            }
            
            if (preg_match('/sunset|dark/i', $message)) {
                $entities['schedule_type'] = 'sunset';
            } elseif (preg_match('/sunrise|morning/i', $message)) {
                $entities['schedule_type'] = 'sunrise';
            }
            
            // Extract time
            if (preg_match('/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i', $message, $timeMatch)) {
                $entities['time'] = $timeMatch[0];
            }
            
            return [
                'type' => 'SCHEDULE_MANAGEMENT',
                'action' => $entities['schedule_action'],
                'entities' => $entities
            ];
        }
        
        // Alert patterns
        if (preg_match('/(alert|notification|warning|issue)/i', $message)) {
            $entities = [];
            
            if (preg_match('/resolve|fix|clear|mark.*resolved/i', $message)) {
                $entities['alert_action'] = 'resolve';
                
                // Extract alert ID
                if (preg_match('/#?(\d+)/i', $message, $idMatch)) {
                    $entities['alert_id'] = intval($idMatch[1]);
                }
            } else {
                $entities['alert_action'] = 'list';
            }
            
            return [
                'type' => 'ALERT_MANAGEMENT',
                'action' => $entities['alert_action'],
                'entities' => $entities
            ];
        }
        
        // Inspection patterns
        if (preg_match('/(inspection|inspect|check|field)/i', $message)) {
            $entities = ['inspection_action' => 'list'];
            
            return [
                'type' => 'INSPECTION_MANAGEMENT',
                'action' => 'list',
                'entities' => $entities
            ];
        }
        
        // Energy patterns
        if (preg_match('/(energy|power|consumption|kwh|voltage|current)/i', $message)) {
            $entities = [];
            
            if (preg_match('/sl\d+|light\s+\d+/i', $message, $idMatch)) {
                $entities['light_id'] = strtoupper(str_replace(' ', '', $idMatch[0]));
            }
            
            return [
                'type' => 'ENERGY_QUERY',
                'action' => 'get_energy',
                'entities' => $entities
            ];
        }
        
        // Greeting patterns
        if (preg_match('/(hi|hello|hey|good morning|good evening)/i', $message)) {
            return [
                'type' => 'GREETING',
                'action' => 'greet',
                'entities' => []
            ];
        }
        
        // Default: unknown intent
        return [
            'type' => 'UNKNOWN',
            'action' => 'unknown',
            'entities' => []
        ];
    }
    
    /**
     * Generate natural language response
     */
    public function generateResponse($intent, $result) {
        if ($this->useOpenAI) {
            return $this->generateResponseWithOpenAI($intent, $result);
        } else {
            return $this->generateResponseWithTemplates($intent, $result);
        }
    }
    
    /**
     * Generate response using OpenAI
     */
    private function generateResponseWithOpenAI($intent, $result) {
        $prompt = "Convert this technical result to a friendly, natural language response:\n\n" .
                  "Intent: " . $intent['type'] . "\n" .
                  "Result: " . json_encode($result) . "\n\n" .
                  "Respond in 1-2 sentences. Be concise and friendly.";
        
        $ch = curl_init('https://api.openai.com/v1/chat/completions');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'model' => $this->model,
            'messages' => [
                ['role' => 'system', 'content' => 'You are a friendly AI assistant for street light control.'],
                ['role' => 'user', 'content' => $prompt]
            ],
            'temperature' => 0.7,
            'max_tokens' => 100
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200 && $response) {
            $data = json_decode($response, true);
            $content = $data['choices'][0]['message']['content'] ?? '';
            if ($content) {
                return $content;
            }
        }
        
        return $this->generateResponseWithTemplates($intent, $result);
    }
    
    /**
     * Generate response using templates (no API)
     */
    private function generateResponseWithTemplates($intent, $result) {
        switch ($intent['type']) {
            case 'LIGHT_CONTROL':
                if (isset($result['error'])) {
                    return "I couldn't find any lights matching your criteria. " . $result['error'];
                }
                $count = $result['lights_updated'] ?? 0;
                $action = $result['action'] ?? 'controlled';
                $actionText = $action === 'on' ? 'turned on' : ($action === 'off' ? 'turned off' : 'controlled');
                return "Done! I've {$actionText} {$count} light" . ($count !== 1 ? 's' : '') . ".";
            
            case 'STATUS_QUERY':
                $summary = $result['summary'] ?? [];
                $total = $summary['total'] ?? 0;
                $onCount = $summary['on_count'] ?? 0;
                $offCount = $summary['off_count'] ?? 0;
                $avgBattery = round($summary['avg_battery'] ?? 0);
                
                if ($total === 0) {
                    return "I couldn't find any lights matching your query.";
                }
                
                $response = "Found {$total} light" . ($total !== 1 ? 's' : '') . ". ";
                $response .= "{$onCount} are ON, {$offCount} are OFF. ";
                if ($avgBattery > 0) {
                    $response .= "Average battery: {$avgBattery}%.";
                }
                
                // Always show light IDs; include battery % when low_battery filter is used
                if (!empty($result['lights'])) {
                    $filter = $intent['entities']['filter'] ?? '';
                    if ($filter === 'low_battery') {
                        $entries = array_map(function($l) {
                            $bp = isset($l['battery_percentage']) ? ((int)$l['battery_percentage']) . '%' : 'n/a';
                            return $l['light_id'] . " (" . $bp . ")";
                        }, $result['lights']);
                        if (count($entries) <= 10) {
                            $response .= " Light IDs: " . implode(', ', $entries);
                        } else {
                            $response .= " Light IDs: " . implode(', ', array_slice($entries, 0, 10)) . " and " . (count($entries) - 10) . " more.";
                        }
                    } else {
                        $lightIds = array_column($result['lights'], 'light_id');
                        if (count($lightIds) <= 10) {
                            $response .= " Light IDs: " . implode(', ', $lightIds);
                        } else {
                            $response .= " Light IDs: " . implode(', ', array_slice($lightIds, 0, 10)) . " and " . (count($lightIds) - 10) . " more.";
                        }
                    }
                }
                
                return $response;
            
            case 'SCHEDULE_MANAGEMENT':
                $action = $result['action'] ?? 'updated';
                $count = $result['affected_lights'] ?? 0;
                return "Schedule {$action} for {$count} light" . ($count !== 1 ? 's' : '') . ".";
            
            case 'ALERT_MANAGEMENT':
                if (isset($result['alerts'])) {
                    $count = $result['count'] ?? 0;
                    if ($count === 0) {
                        return "Great news! No active alerts right now. 🎉";
                    }
                    return "Found {$count} active alert" . ($count !== 1 ? 's' : '') . " that need attention.";
                } elseif (isset($result['action']) && $result['action'] === 'resolved') {
                    return "Alert #{$result['alert_id']} has been marked as resolved.";
                }
                return "Alert action completed.";
            
            case 'INSPECTION_MANAGEMENT':
                $count = $result['count'] ?? 0;
                if ($count === 0) {
                    return "No recent inspections found.";
                }
                return "Found {$count} recent inspection" . ($count !== 1 ? 's' : '') . ".";
            
            case 'ENERGY_QUERY':
                $count = $result['count'] ?? 0;
                if ($count === 0) {
                    return "No energy data available.";
                }
                return "Retrieved energy data for {$count} reading" . ($count !== 1 ? 's' : '') . ".";
            
            case 'GREETING':
                return "Hello! I'm your AI street light control assistant. I can help you control lights, check status, manage schedules, and more. Try saying 'turn on all lights' or 'show status'.";
            
            default:
                return "I understood your command but I'm not sure how to respond. Try rephrasing?";
        }
    }
}
?>
