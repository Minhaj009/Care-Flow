# Voice-to-Data Patient Check-in System

A production-ready medical clinic application that uses voice recognition to capture patient information and automatically extract structured data using AI.

## Features

- **Voice Recording**: Web Speech API integration for real-time speech-to-text
- **AI Data Extraction**: Google Gemini Flash API extracts patient name, age, symptoms, and duration
- **Database Storage**: Supabase backend stores all check-ins with full audit trail
- **High Contrast UI**: Black and white design optimized for medical environments
- **Mobile-Friendly**: Large touch targets and responsive layout
- **Multi-language Support**: Handles mixed English/Roman Urdu transcripts

## Technology Stack

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Supabase for database
- Google Gemini Flash API for AI extraction
- Web Speech API for voice recognition

## Setup Instructions

### 1. Get Your Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Environment Variables

Open the `.env` file and update the Gemini API key:

```
VITE_SUPABASE_URL=https://mqzoqiidfnsegkmbnqsi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Usage Guide

### Recording a Patient Check-in

1. Click the large "Record Patient Check-in" button
2. Speak the patient information clearly:
   - Patient name
   - Age
   - Symptoms
   - How long they've had the symptoms
3. Click the "Stop Recording" button when finished
4. The system will automatically:
   - Extract structured data using AI
   - Save to the database
   - Display in the recent check-ins list

### Example Speech Input

> "Patient name is John Smith, age 45. He has fever, cough, and body aches for the past 3 days."

### What Gets Extracted

The AI will extract:
- **Patient Name**: John Smith
- **Age**: 45
- **Symptoms**: ["fever", "cough", "body aches"]
- **Duration**: "3 days"

## Browser Compatibility

The Web Speech API requires one of the following browsers:
- Google Chrome (recommended)
- Microsoft Edge
- Safari

Firefox does not currently support the Web Speech API.

## Database Schema

The application uses a single Supabase table:

### `patient_visits`
- `id` (uuid): Unique identifier
- `created_at` (timestamp): When the check-in was recorded
- `raw_transcript` (text): Original speech-to-text output
- `patient_data` (jsonb): Extracted patient name and age
- `symptoms_data` (jsonb): Extracted symptoms and duration

## Security Considerations

- Database has Row Level Security (RLS) enabled
- All API keys are stored in environment variables
- Production deployment should implement proper authentication
- Consider HIPAA compliance requirements for medical data

## Production Deployment

### Recommended Platforms
- Vercel
- Netlify
- Cloudflare Pages

### Environment Variables to Set
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`

## Troubleshooting

### Speech Recognition Not Working
- Ensure you're using Chrome, Edge, or Safari
- Check that microphone permissions are granted
- Try using HTTPS (required for production)

### API Errors
- Verify your Gemini API key is correct
- Check your API quota hasn't been exceeded
- Ensure environment variables are properly set

### Database Connection Issues
- Verify Supabase credentials in `.env`
- Check that the `patient_visits` table exists
- Ensure RLS policies are properly configured

## License

MIT

## Support

For issues or questions, please refer to the documentation or contact your system administrator.
