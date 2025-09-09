Feature: External Service Integration
  As a system administrator
  I want to validate user profiles through an external service
  So that I can ensure data quality and security compliance

  Background:
    Given the User API is running
    And the profile validation service is available
    And the database is clean

  Scenario: Create user with successful profile validation
    Given I have valid user data:
      | name        | email                | bio                    |
      | John Doe    | john@example.com     | Software developer    |
    When I create a new user
    Then the response status should be 201
    And the response should contain the user data
    And the user should have a generated ID
    And the profile validation service should have been called

  Scenario: Create user with profile validation rejection
    Given I have user data that will be rejected:
      | name           | email                | bio                    |
      | Suspicious User| spam@spam.com        | Spam content here     |
    When I create a new user
    Then the response status should be 400
    And the response should contain a profile validation error
    And the profile validation service should have been called

  Scenario: Create user when profile validation service returns error
    Given I have user data that will trigger service error:
      | name        | email                | bio                    |
      | Test User   | error@example.com    | Valid bio             |
    When I create a new user
    Then the response status should be 400
    And the response should contain a service unavailable error
    And the profile validation service should have been called

  Scenario: Update user with successful profile validation
    Given a user exists with name "Original Name" and email "original@example.com"
    When I update the user with:
      | name        | email           | bio                    |
      | Updated Name| updated@example.com | Updated bio           |
    Then the response status should be 200
    And the response should contain the updated user data
    And the profile validation service should have been called

  Scenario: Update user with profile validation rejection
    Given a user exists with name "Original Name" and email "original@example.com"
    When I update the user with rejected data:
      | name           | email           | bio                    |
      | Suspicious Name| spam@spam.com   | Spam content          |
    Then the response status should be 400
    And the response should contain a profile validation error
    And the profile validation service should have been called

  Scenario: Direct profile validation endpoint - success
    Given I have valid profile data:
      | name        | email                | bio                    |
      | Jane Smith  | jane@example.com     | Product manager       |
    When I call the profile validation endpoint
    Then the response status should be 200
    And the validation response should indicate success
    And the response should contain a risk score

  Scenario: Direct profile validation endpoint - rejection
    Given I have profile data that will be rejected:
      | name           | email                | bio                    |
      | Spam User      | spam@spam.com        | Suspicious content    |
    When I call the profile validation endpoint
    Then the response status should be 200
    And the validation response should indicate failure
    And the response should contain a high risk score

  Scenario: Multiple users with different validation results
    Given I have valid user data:
      | name        | email                | bio                    |
      | Valid User  | valid@example.com    | Good user             |
    When I create a new user
    Then the response status should be 201
    Given I have user data that will be rejected:
      | name           | email                | bio                    |
      | Bad User       | spam@spam.com        | Spam content          |
    When I create a new user
    Then the response status should be 400
    When I request all users
    Then the response status should be 200
    And the response should contain 1 user