Feature: Spring Boot Actuator Monitoring
  As a system administrator
  I want to monitor the application through Actuator endpoints
  So that I can ensure the application is healthy and gather operational metrics

  Background:
    Given the Application is running

  Scenario: Check application health status
    When I request the health endpoint
    Then the response status should be 200
    And the health status should be "UP"
    And the health response should contain components

  Scenario: Get application information
    When I request the info endpoint
    Then the response status should be 200
    And the response should contain application metadata
    And the response should contain build information

  Scenario: Get application metrics overview
    When I request the metrics endpoint
    Then the response status should be 200
    And the response should contain available metric names
    And the metrics should include JVM metrics
    And the metrics should include HTTP metrics

  Scenario Outline: Access various actuator endpoints
    When I request the "<endpoint>" actuator endpoint
    Then the response status should be 200
    And the response should contain valid JSON data

    Examples:
      | endpoint     |
      | health       |
      | info         |
      | metrics      |
      | env          |
      | beans        |
      | mappings     |
      | configprops  |

  Scenario: Verify health endpoint shows database connectivity
    When I request the health endpoint
    Then the response status should be 200
    And the health components should include "db"
    And the database component status should be "UP"

  Scenario: Verify metrics contain user API specific metrics
    Given some users exist in the system
    When I request the metrics endpoint
    Then the response status should be 200
    And the metrics should contain HTTP request metrics
    And the metrics should include database connection pool metrics