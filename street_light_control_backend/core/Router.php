<?php
// backend/core/Router.php

class Router {
    private $routes = [];

    public function post($path, $callback) {
        $this->routes['POST'][$path] = $callback;
    }

    public function get($path, $callback) {
        $this->routes['GET'][$path] = $callback;
    }

    public function put($path, $callback) {
        $this->routes['PUT'][$path] = $callback;
    }

    public function delete($path, $callback) {
        $this->routes['DELETE'][$path] = $callback;
    }

    public function dispatch() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $path = str_replace('/api', '', $path);
        
        // Ensure path starts with /
        if (empty($path)) {
            $path = '/';
        }

        if (isset($this->routes[$method])) {
            foreach ($this->routes[$method] as $route => $callback) {
                if ($this->pathMatches($route, $path)) {
                    call_user_func($callback);
                    return;
                }
            }
        }

        Response::error('Route not found', 404);
    }

    private function pathMatches($route, $path) {
        $routePattern = preg_replace('/{[^}]+}/', '([^/]+)', $route);
        $routePattern = '#^' . $routePattern . '$#';
        return preg_match($routePattern, $path);
    }
}
?>
