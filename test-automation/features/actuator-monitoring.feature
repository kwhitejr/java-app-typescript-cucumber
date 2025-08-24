Feature: Spring Boot Actuator Health Monitoring
  As a system administrator
  I want to monitor the application health through the Actuator health endpoint
  So that I can ensure the application is healthy and running properly

  Background:
    Given the Application is running

  Scenario: Check application health status
    When I request the health endpoint
    Then the response status should be 200
    And the health status should be "UP"
    And the health response should contain components

  Scenario: Verify health endpoint shows database connectivity
    When I request the health endpoint
    Then the response status should be 200
    And the health components should include "db"
    And the database component status should be "UP"