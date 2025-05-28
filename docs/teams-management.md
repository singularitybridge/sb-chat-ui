# Teams Management Implementation

This document tracks the implementation of the Teams Management feature in the application.

## Overview

The Teams feature allows organizing AI assistants into logical groups. Each team can have multiple assistants, and each assistant can belong to multiple teams.

## Team Properties

- **Name**: The name of the team
- **Description**: A description of the team's purpose
- **Icon**: An optional icon for the team
- **CompanyId**: The ID of the company that owns the team

## Implementation Steps

### Step 1: Create the Team Model and Service ✅
- Create the Team model ✅
- Create the teamService.ts file for API calls ✅

### Step 2: Update RootStore ✅
- Add teams array to RootStore ✅
- Add basic team-related actions ✅

### Step 3: Create Teams Page ✅
- Create TeamsPage component to list available teams ✅
- Update Router to include the teams route ✅
- Update Menu to include Teams link ✅

### Step 4: Create Add Team Dialog ✅
- Create AddTeamDialog component ✅
- Update DialogManager to handle team dialogs ✅
- Refactor AddTeamDialog to use DynamicForm component ✅
- Create teamFieldConfigs for consistent form handling ✅

### Step 5: Create Edit Team Page ✅
- Create EditTeamPage component ✅
- Update Router to include the edit team route ✅

### Step 6: Update Assistant Model ✅
- Update Assistant model to include teams ✅
- Add team assignment functionality ✅

### Step 7: Update Translations ✅
- Add team-related translations ✅

## API Endpoints

### Teams

- `GET /teams` - Get all teams for the current company
- `GET /teams/:id` - Get a specific team by ID
- `POST /teams` - Create a new team
- `PUT /teams/:id` - Update an existing team
- `DELETE /teams/:id` - Delete a team

### API Request Format

#### Creating a Team

```json
POST /teams
{
  "name": "Customer Support",
  "description": "Assistants focused on customer support tasks",
  "icon": "support_icon"
}
```

**Important Notes:**
- Do NOT include an `_id` field in the request payload. MongoDB will automatically generate a valid ObjectId for the new team.
- The `companyId` is automatically added from your authentication token, so you don't need to include it in the request.
- The `name` and `description` fields are required.

**Example Response:**
```json
{
  "_id": "67cd37eb4ec60c82c318db1a",
  "name": "Customer Support",
  "description": "Assistants focused on customer support tasks",
  "icon": "support_icon",
  "companyId": "66d41ac3487c19f6d4c23fa1",
  "__v": 0
}
```

### Team Assignments

- `GET /teams/:id/assistants` - Get all assistants assigned to a specific team
- `POST /teams/:teamId/assistants/:assistantId` - Assign an assistant to a team
- `DELETE /teams/:teamId/assistants/:assistantId` - Remove an assistant from a team

### Assistants

- `GET /assistant/by-team/:teamId` - Get all assistants assigned to a specific team

## Dialog Implementation Pattern

The application follows a consistent pattern for implementing dialogs:

1. **Field Configurations**: Each entity type (Assistant, Team, etc.) has a field configuration file in `src/store/fieldConfigs/` that defines the form fields and their properties.

2. **View Component**: Each dialog has a corresponding view component (e.g., `NewTeamView.tsx`) that uses the `DynamicForm` component to render the form fields.

3. **Dialog Factory**: The `DialogFactory.ts` file maps event types to dialog components and handles creating the dialog with the appropriate title and component.

4. **Dialog Manager**: The `DialogManager.tsx` component listens for events and uses the DialogFactory to create and display the appropriate dialog.

5. **Translations**: Each entity type has corresponding translations in the translation files for form field labels and other text.

This pattern ensures consistency across all dialogs in the application and makes it easier to add new dialogs or modify existing ones.

## Troubleshooting

### Common Errors

1. **Invalid `_id` field**: Including an `_id` field with an invalid value (like an empty string) in the request payload will cause a validation error:
   ```
   Error: Team validation failed: _id: Cast to ObjectId failed for value "" (type string) at path "_id" because of "BSONError"
   ```
   **Solution**: Remove the `_id` field from your request payload.

2. **Missing required fields**: The `name` and `description` fields are required. If you omit them, you'll get a validation error.

3. **Authentication issues**: Make sure your authentication token is valid and included in the request headers.

4. **Access denied**: You can only manage teams that belong to your company. Attempting to access or modify teams from other companies will result in an "Access denied" error.
