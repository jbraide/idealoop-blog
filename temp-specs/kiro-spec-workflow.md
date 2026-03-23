# Kiro Spec Creation Workflow

## Overview

This document describes the systematic approach for transforming a rough feature idea into a detailed implementation plan through three structured phases: Requirements, Design, and Tasks. This workflow ensures thorough planning before implementation begins and supports an interface-first development approach where UI components are built with dummy data before API integration.

## Core Principles

- **Iterative refinement**: Each phase involves user feedback and approval before proceeding
- **User-driven validation**: Ground truth is established through explicit user approval at each stage
- **Incremental development**: Tasks build upon each other systematically
- **Test-driven approach**: Implementation prioritizes early validation and testing

## Workflow Structure

The workflow consists of three sequential phases, each producing a specific document:

1. **Requirements Phase** → `requirements.md`
2. **Design Phase** → `design.md` 
3. **Tasks Phase** → `tasks.md`

## Phase 1: Requirements Gathering

### Objective
Transform the initial feature idea into structured requirements using user stories and EARS format acceptance criteria.

### Process
1. Create initial requirements document based on user's rough idea
2. Format requirements with clear structure
3. Iterate with user feedback until approved
4. Get explicit approval before proceeding

### Document Structure
```markdown
# Requirements Document

## Introduction
[Summary of the feature and its purpose]

## Requirements

### Requirement 1
**User Story:** As a [role], I want [feature], so that [benefit]

#### Acceptance Criteria
1. WHEN [event] THEN [system] SHALL [response]
2. IF [precondition] THEN [system] SHALL [response]

### Requirement 2
**User Story:** As a [role], I want [feature], so that [benefit]

#### Acceptance Criteria
1. WHEN [event] THEN [system] SHALL [response]
2. WHEN [event] AND [condition] THEN [system] SHALL [response]
```

### Key Guidelines
- Use EARS format (Easy Approach to Requirements Syntax)
- Include user stories for context
- Consider edge cases and constraints
- Focus on what the system should do, not how
- Get explicit user approval before moving to design

## Phase 2: Design Document Creation

### Objective
Develop a comprehensive technical design based on approved requirements, incorporating necessary research.

### Process
1. Conduct research as needed for technical decisions
2. Create detailed design document
3. Address all requirements from Phase 1
4. Iterate with user feedback until approved
5. Get explicit approval before proceeding

### Document Structure
```markdown
# Design Document

## Overview
[High-level description of the solution approach]

## Architecture
[System architecture and key components]

## Components and Interfaces
[Detailed component descriptions and their interactions]

## Data Models
[Data structures and relationships]

## Error Handling
[Error scenarios and handling strategies]

## Testing Strategy
[Approach to testing and validation]
```

### Key Guidelines
- Base design on approved requirements
- Include research findings and rationale for decisions
- Use diagrams when helpful (Mermaid format recommended)
- Address all functional and non-functional requirements
- Highlight key design decisions and trade-offs
- Get explicit user approval before moving to tasks

## Phase 3: Implementation Tasks

### Objective
Create an actionable checklist of coding tasks that implement the approved design.

### Process
1. Convert design into discrete coding tasks
2. Structure tasks as numbered checklist with hierarchy
3. Ensure each task references specific requirements
4. Iterate with user feedback until approved
5. Get explicit approval to complete the workflow

### Document Structure
```markdown
# Implementation Plan

- [ ] 1. Set up project structure and core interfaces
  - Create directory structure for components
  - Define system boundary interfaces
  - _Requirements: 1.1, 2.3_

- [ ] 2. Implement data models and validation
- [ ] 2.1 Create core data model interfaces
  - Write TypeScript interfaces for all models
  - Implement validation functions
  - _Requirements: 2.1, 3.3_

- [ ] 2.2 Implement specific model classes
  - Write model classes with validation
  - Create unit tests for models
  - _Requirements: 1.2, 2.1_

[Continue with additional tasks...]
```

### Task Guidelines
- **Focus only on coding tasks**: Writing, modifying, or testing code
- **Incremental progression**: Each task builds on previous ones
- **Requirement traceability**: Reference specific requirements
- **Test-driven approach**: Include testing in task planning
- **Avoid non-coding tasks**: No deployment, user testing, or business processes

### Task Formatting Rules
- Use numbered checkbox format with maximum two levels
- Top-level items for major components
- Sub-tasks with decimal notation (1.1, 1.2, 2.1)
- Include requirement references for each task
- Keep tasks discrete and manageable

## Implementation Instructions for AIs

### Directory Structure
Create specs in the following structure:
```
.kiro/specs/{feature_name}/
├── requirements.md
├── design.md
└── tasks.md
```

### User Interaction Protocol
1. **Always ask for explicit approval** after each document creation/update
2. **Use structured questions** like "Do the requirements look good? If so, we can move on to the design."
3. **Continue feedback loops** until user explicitly approves (yes, approved, looks good)
4. **Never skip phases** - complete each phase before proceeding
5. **Don't assume preferences** - always ask for clarification when needed

### Approval Process
- After creating/updating requirements: Ask "Do the requirements look good? If so, we can move on to the design."
- After creating/updating design: Ask "Does the design look good? If so, we can move on to the implementation plan."
- After creating/updating tasks: Ask "Do the tasks look good?"
- Only proceed after receiving explicit positive confirmation

### Research Integration
- Conduct research during design phase as needed
- Incorporate findings directly into design document
- Don't create separate research files
- Use research to inform technical decisions

## Task Execution Phase (Post-Workflow)

### Execution Guidelines
- **Read all spec documents** before starting any task
- **Execute one task at a time** - never batch multiple tasks
- **Focus on current task only** - don't implement ahead
- **Verify against requirements** specified in task details
- **Stop after each task** - let user review before continuing
- **Update task status** as you progress (not_started → in_progress → completed)

### Task Status Management
- Mark tasks as "in_progress" when starting
- Mark as "completed" when finished
- Handle sub-tasks first, then parent tasks
- Use task management tools to track progress

## Troubleshooting Common Issues

### Requirements Stalls
- Suggest focusing on different requirement aspects
- Provide examples or options for decisions
- Summarize established points and identify gaps
- Consider research to inform requirements

### Design Complexity
- Break down into smaller components
- Focus on core functionality first
- Suggest phased implementation approach
- Return to requirements if prioritization needed

### Research Limitations
- Document missing information clearly
- Suggest alternative approaches
- Ask user for additional context
- Continue with available information

## Success Criteria

A successful spec workflow produces:
1. ✅ Clear, approved requirements with user stories and EARS criteria
2. ✅ Comprehensive design addressing all requirements
3. ✅ Actionable task list with requirement traceability
4. ✅ User approval at each phase
5. ✅ Ready-to-execute implementation plan

## Key Reminders for AI Implementation

- **Sequential execution**: Complete each phase fully before proceeding
- **User validation**: Get explicit approval at every stage
- **Iterative refinement**: Expect and accommodate feedback loops
- **Coding focus**: Tasks phase should only include implementable coding work
- **One task at a time**: During execution, never batch multiple tasks
- **Interface awareness**: Always read all spec documents before task execution
- **Interface-first workflow**: Use dummy data hooks for rapid UI development with seamless API transition
- **Dummy data development**: Build interfaces with comprehensive mock data before API integration
- **Interface-first approach**: Develop UI components with dummy data first, then connect APIs

This workflow ensures systematic feature development with clear validation points and comprehensive planning before implementation begins.