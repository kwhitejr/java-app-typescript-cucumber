Feature: User Management API
  As a system administrator
  I want to manage users through the API
  So that I can perform CRUD operations on user data

  Background:
    Given the User API is running
    And the database is clean

  Scenario: Get all users when no users exist
    When I request all users
    Then the response status should be 200
    And the response should contain an empty list

  Scenario: Create a new user successfully
    Given I have valid user data:
      | name     | email           | bio                    |
      | John Doe | john@example.com | Software developer    |
    When I create a new user
    Then the response status should be 201
    And the response should contain the user data
    And the user should have a generated ID

  Scenario: Create multiple users
    Given I have valid user data:
      | name       | email             | bio                     |
      | Alice Smith| alice@example.com | Product manager        |
    When I create a new user
    Then the response status should be 201
    Given I have valid user data:
      | name      | email            | bio                    |
      | Bob Wilson| bob@example.com  | QA engineer           |
    When I create a new user
    Then the response status should be 201
    When I request all users
    Then the response status should be 200
    And the response should contain 2 users

  Scenario: Get user by ID
    Given a user exists with name "Jane Doe" and email "jane@example.com"
    When I request the user by ID
    Then the response status should be 200
    And the response should contain the user "Jane Doe"

  Scenario: Update an existing user
    Given a user exists with name "Original Name" and email "original@example.com"
    When I update the user with:
      | name        | email           | bio                    |
      | Updated Name| updated@example.com | Updated bio         |
    Then the response status should be 200
    And the response should contain the updated user data

  Scenario: Delete a user
    Given a user exists with name "To Delete" and email "delete@example.com"
    When I delete the user
    Then the response status should be 204
    When I request the user by ID
    Then the response status should be 404

  Scenario Outline: Create user with invalid data
    Given I have invalid user data:
      | name   | email   | bio   |
      | <name> | <email> | <bio> |
    When I create a new user
    Then the response status should be 400
    And the response should contain validation errors

    Examples:
      | name | email           | bio                                                                                                                                                                                        |
      |      | valid@email.com | Valid bio                                                                                                                                                                                  |
      | X    | valid@email.com | Valid bio                                                                                                                                                                                  |
      | Valid Name | invalid-email   | Valid bio                                                                                                                                                                          |
      | Valid Name | valid@email.com | This bio is way too long and exceeds the maximum allowed length of 200 characters. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua |

  Scenario: Create user with duplicate email
    Given a user exists with name "First User" and email "duplicate@example.com"
    When I try to create another user with email "duplicate@example.com"
    Then the response status should be 409
    And the response should contain a conflict error message

  Scenario: Get non-existent user
    When I request a user with ID 99999
    Then the response status should be 404
    And the response should contain a not found error message

  Scenario: Update non-existent user
    When I try to update a user with ID 99999
    Then the response status should be 404
    And the response should contain a not found error message

  Scenario: Delete non-existent user
    When I try to delete a user with ID 99999
    Then the response status should be 404
    And the response should contain a not found error message