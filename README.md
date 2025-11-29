# MyStree Soul

> **⚠️ IMPORTANT NOTICE: This is a PROTOTYPE**
> 
> This application is a prototype demonstration. Due to time constraints, all agent interactions are **simulated** and may not be medically accurate. All patient data, health metrics, diagnoses, and AI assessments are **simulated** for demonstration purposes only. This application should **NOT** be used for actual medical diagnosis or treatment.

---

MyStree Soul is a comprehensive healthcare platform designed to bridge the gap between patients and doctors, specifically focusing on women's health. It features a dual-interface system: a mobile-first Patient App for symptom tracking and AI consultations, and a desktop-optimized Doctor Dashboard for case management and diagnosis.

## Features

*   **Patient App:**
    *   **AI Health Assistant:** "Soul" provides preliminary assessments and support.
    *   **Symptom Tracking:** Log symptoms and cycle status.
    *   **Real-time Chat:** Communicate with the AI and receive updates from doctors.
    *   **Digital Reports:** Receive signed, professional medical reports directly in the app.
*   **Doctor Dashboard:**
    *   **Case Management:** View and prioritize incoming patient cases.
    *   **AI Risk Assessment:** Review AI-generated risk scores and assessments.
    *   **Diagnosis & Approval:** Approve diagnoses, prescribe medications, and issue reports.
    *   **Risk Adjustment:** Upgrade or downgrade case risk levels based on professional judgment.

## Prerequisites

Before you begin, ensure you have the following installed:
*   **Node.js** (v16 or higher)
*   **npm** (Node Package Manager)

## Installation

1.  Clone the repository or navigate to the project directory.
2.  Install the dependencies:

    ```bash
    npm install
    ```

## Running the Application

1.  Start the development server:

    ```bash
    npm run dev
    ```

2.  The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## How to Test (Side-by-Side View)

To fully experience the real-time interaction between the Patient and the Doctor, we recommend running two windows side-by-side.

1.  **Open Window 1 (Patient View):**
    *   Go to `http://localhost:5173`.
    *   Select a **Patient Persona** (e.g., "Priya - High Risk" or "Anjali - Medium Risk").
    *   This window simulates the patient's mobile device. You can chat with the AI, upload photos (simulated), and wait for doctor feedback.

2.  **Open Window 2 (Doctor View):**
    *   Open a new browser window or tab.
    *   Go to `http://localhost:5173`.
    *   Select **"Doctor Login"**.
    *   This window simulates the doctor's dashboard. You will see the case created by the patient in Window 1.

3.  **Test the Flow:**
    *   **Patient:** Report a symptom in the chat (e.g., "I have a rash").
    *   **Patient:** Confirm sending the case to the doctor when prompted.
    *   **Doctor:** Watch the case appear in the "Incoming Cases" list.
    *   **Doctor:** Select the case, review the details, and click **"Approve Diagnosis"**.
    *   **Patient:** Observe the "Medical Report" popup appearing instantly with the doctor's signature and prescription.

## Resetting Data

If you need to restart the demo or clear the data:
*   Click the small **"Reset Data"** button located in the bottom-right corner of the screen (it's semi-transparent until hovered).
