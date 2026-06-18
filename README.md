# Risk Register App

A healthcare compliance risk register built with React, inspired by real HIPAA and PIPEDA compliance work.

## Live Demo

[View Live App](https://resonant-croquembouche-84dba5.netlify.app)

## About

This project was built to demonstrate practical knowledge of GRC (Governance, Risk and Compliance) concepts in a healthcare environment. It replicates the kind of risk tracking tool used during real compliance implementations — including work done on a HIPAA/PIPEDA-compliant GCP platform.

## Features

- Add, edit and delete compliance risks
- Automatic risk scoring (Severity x Likelihood)
- Filter by severity and status
- Summary dashboard — Total, Open, Critical and Resolved counts
- Export full risk register to CSV
- Colour-coded severity and status badges

## Risk Scoring

| Score | Level |
|-------|-------|
| 1-3 | Low |
| 4-8 | Medium |
| 9-12 | High |
| 13-20 | Critical |

## Built With

- React
- JavaScript
- CSS-in-JS

## Compliance Context

This app reflects real-world GRC workflows including:

- HIPAA risk assessment requirements
- PIPEDA privacy risk documentation
- Risk register management with owners and remediation timelines
- Audit-ready status tracking

## Getting Started

git clone https://github.com/tosin-akinyemi/risk-register-app.git
cd risk-register-app
npm install
npm start

## Author

Esther Akinyemi
Privacy and Compliance Analyst | GRC Specialist
