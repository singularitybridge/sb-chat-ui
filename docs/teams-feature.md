# Teams Feature

The Teams feature allows you to organize AI assistants into logical groups. Each team can have multiple assistants, and each assistant can belong to multiple teams.

## Team Properties

- **Name**: The name of the team
- **Description**: A description of the team's purpose
- **Icon**: An optional icon for the team (using Lucide icons)
- **CompanyId**: The ID of the company that owns the team

## Features

### Teams Management

- View all teams in the company
- Create new teams
- Edit existing teams
- Delete teams
- Assign assistants to teams
- Remove assistants from teams

### API Endpoints

#### Teams

- `GET /teams` - Get all teams for the current company
- `GET /teams/:id` - Get a specific team by ID
- `POST /teams` - Create a new team
- `PUT /teams/:id` - Update an existing team
- `DELETE /teams/:id` - Delete a team

#### Team Assignments

- `GET /teams/:id/assistants` - Get all assistants assigned to a specific team
- `POST /teams/:teamId/assistants/:assistantId` - Assign an assistant to a team
- `DELETE /teams/:teamId/assistants/:assistantId` - Remove an assistant from a team

#### Assistants

- `GET /assistant/by-team/:teamId` - Get all assistants assigned to a specific team

## Team Icons

Teams can be assigned icons from the Lucide icon library. The application includes:

- An icon selector component that allows users to browse and search for icons
- Case-insensitive icon name matching for better compatibility
- Visual display of icons in the teams list and edit pages

## Usage

### Creating a Team

1. Navigate to the Teams page by clicking on "Teams" in the sidebar menu
2. Click the "+" button in the top right corner
3. Enter a name and description for the team
4. Select an icon from the icon selector component
5. Click "Create" to create the team

### Editing a Team

1. Navigate to the Teams page
2. Click on the team you want to edit
3. Update the team's name, description, or select a different icon from the icon selector
4. Click "Save" to save your changes

### Assigning Assistants to a Team

1. Navigate to the Teams page
2. Click on the team you want to assign assistants to
3. In the "Team Assistants" section, select an assistant from the dropdown
4. Click "Add" to assign the assistant to the team

### Removing Assistants from a Team

1. Navigate to the Teams page
2. Click on the team you want to remove assistants from
3. In the "Team Assistants" section, find the assistant you want to remove
4. Click the "X" button next to the assistant to remove it from the team

## Implementation Details

The Teams feature is implemented using a many-to-many relationship between assistants and teams. Each assistant can be assigned to multiple teams, and each team can have multiple assistants.

The relationship is stored in the Assistant model, which has a `teams` array field containing references to Team documents.

When a team is deleted, all references to that team are automatically removed from assistants.
