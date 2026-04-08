# Resume Analyzer - Local Setup Guide

Follow these steps to run the Resume Analyzer on your local machine (`localhost`).

## Prerequisites

1. **Node.js**: Install the latest LTS version of Node.js from [nodejs.org](https://nodejs.org/).
2. **Gemini API Key**: Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

## Setup Instructions

1. **Download the Source Code**:
   Download or clone this project folder to your computer.

2. **Install Dependencies**:
   Open your terminal (Command Prompt, PowerShell, or Terminal) in the project folder and run:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   - Create a new file named `.env` in the root directory of the project.
   - Add your Gemini API key to the file:
     ```env
     GEMINI_API_KEY=your_api_key_here
     ```

4. **Start the Development Server**:
   Run the following command to start the app:
   ```bash
   npm run dev
   ```

5. **Access the App**:
   Once the server starts, open your browser and go to:
   `http://localhost:3000`

## Project Structure

- `src/App.tsx`: Main UI and logic.
- `src/services/gemini.ts`: AI analysis integration.
- `src/index.css`: Styling with Tailwind CSS.

## Troubleshooting

- **Port 3000 is busy**: If you see an error that port 3000 is in use, you can change the port in `package.json` under the `dev` script or close the application using that port.
- **API Errors**: Ensure your `GEMINI_API_KEY` is correct and has not expired.
