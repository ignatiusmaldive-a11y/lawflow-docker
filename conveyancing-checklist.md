# Conveyancing Checklist Feature in LawFlow

## Overview

The conveyancing checklist feature in LawFlow is a standardized workflow management system designed specifically for Spanish real-estate transactions in the Costa del Sol region. It provides structured checklists to ensure all legal and administrative requirements are completed systematically throughout the property transaction process.

## Feature Purpose

LawFlow is a matter-centric workflow CRM for small legal teams handling Spanish real-estate conveyancing. The checklist feature helps legal professionals track progress through each phase of property purchases and sales, ensuring no critical steps are missed and maintaining compliance with Spanish legal requirements.

## Checklist Types

There are **2 main types** of conveyancing checklists:

1. **PURCHASE** - For buyer-side property transactions (14 items)
2. **SALE** - For seller-side property transactions (7 items)

## Checklist Structure

Both checklist types follow the same **6-stage workflow structure**:

- **Intake** - Initial client onboarding and documentation collection
- **DD (Due Diligence)** - Property and legal verification processes
- **Contracts** - Agreement preparation and review
- **Notary** - Notary appointment coordination and preparation
- **Closing** - Final completion preparations
- **Registry** - Post-completion registration and updates

## PURCHASE Checklist Details

### Intake Stage
- KYC / Client onboarding + engagement letter
- Collect passports + proof of funds
- Apply for NIE (if needed)

### Due Diligence Stage
- Request Nota Simple (Land Registry extract)
- Check cargas/encumbrances + ownership
- Check IBI & community fees (HOA) paid
- Check permits, LPO / AFO if applicable

### Contracts Stage
- Review/prepare reservation agreement
- Draft/review Arras contract (deposit)

### Notary Stage
- Coordinate notary appointment (Escritura)
- Prepare completion statement + funds routing

### Closing Stage
- Prepare ITP/AJD filing pack

### Registry Stage
- Present deed to Land Registry
- Update cadastre / utilities & direct debits

## SALE Checklist Details

### Intake Stage
- Engagement letter + seller KYC

### Due Diligence Stage
- Obtain Nota Simple + verify title
- Energy certificate + required disclosures

### Contracts Stage
- Draft/review reservation + Arras

### Notary Stage
- Notary coordination + cancel charges (if any)

### Closing Stage
- Calculate Plusvalía municipal + CGT guidance

### Registry Stage
- Register transfer + notify utilities/HOA

## Technical Implementation

### Database Model
- **ChecklistItem** table with fields:
  - `stage`: Stage category (string)
  - `label`: Item description (string)
  - `is_done`: Completion status (boolean)
  - `due_date`: Optional deadline (date)
  - `project_id`: Foreign key to project

### Backend API
- FastAPI router with endpoints:
  - `GET /checklists`: List checklist items for a project
  - `PATCH /checklists/{item_id}`: Toggle completion status

### Frontend Component
- React `Checklist` component that:
  - Groups items by stage
  - Shows progress indicators (completed/total per stage)
  - Provides checkboxes for toggling completion
  - Displays due dates

### Integration
- Checklists are automatically seeded based on project transaction type
- Integrates with LawFlow's activity feed for audit trails
- Supports the overall workflow management system

## Usage Context

The checklists are part of LawFlow's broader conveyancing workflow that includes:
- Task management with assignments and due dates
- Timeline visualization of transaction phases
- File room for document management
- Activity feeds for team collaboration
- Closing pack generation for transaction completion

This feature ensures legal teams can systematically track and complete all necessary steps for Spanish property transactions, reducing risk and improving efficiency.