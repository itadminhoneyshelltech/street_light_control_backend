@echo off
REM Initialize city summary table
mysql -u root -pHoneyshell2024 street_light_control -e "INSERT INTO city_summary (city, total_lights, lights_on, lights_off, lights_in_error) SELECT 'Delhi', COUNT(*), SUM(status='on'), SUM(status='off'), SUM(status='error') FROM street_lights WHERE city='Delhi' ON DUPLICATE KEY UPDATE total_lights=VALUES(total_lights), lights_on=VALUES(lights_on), lights_off=VALUES(lights_off), lights_in_error=VALUES(lights_in_error);"
echo City summary initialized!
pause
