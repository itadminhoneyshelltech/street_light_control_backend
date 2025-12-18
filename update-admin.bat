@echo off
REM Update admin password hash in database
mysql -u root -pHoneyshell2024 -e "UPDATE street_light_control.users SET password='$2y$10$n/PPDnf9piuGlw89NwAxCOei7J9H5r6XGxLP8jB4x2HZN/sY80fey' WHERE email='admin@streetlight.com';"
echo.
echo Admin password updated successfully!
echo Email: admin@streetlight.com
echo Password: admin123
pause
