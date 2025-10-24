# Musab Hashmi Legal Services - Backend Setup

This backend server handles email functionality for all forms on the Musab Hashmi Legal Services website.

## Features

- **Ask Free Question Form**: Sends legal questions to the team
- **Talk to Lawyer Form**: Connects clients with lawyers
- **Lawyer Signup Form**: Handles lawyer registration requests
- **Contact Lawyer Form**: Direct contact requests for Advocate Musab Hashmi

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

1. Copy the example environment file:
```bash
cp env.example .env
```

2. Edit `.env` file with your actual values:
```env
# Email Configuration (Google Gmail with App-Specific Password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-specific-password
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=musab.hashmi@lawpex.com

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 3. Google Gmail Setup

To use Gmail with Nodemailer, you need to:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App-Specific Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this 16-digit password in `EMAIL_PASS`

### 4. Run the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/api/health` - Check if server is running

### Email Endpoints

#### Ask Free Question
- **POST** `/api/send-email/ask-free-question`
- **Body**: `{ areaOfLaw, city, subject, question, name, contactNo, email, interestedInLawyer }`

#### Talk to Lawyer
- **POST** `/api/send-email/talk-to-lawyer`
- **Body**: `{ name, mobileNumber, email, city, agreeToTerms }`

#### Lawyer Signup
- **POST** `/api/send-email/lawyer-signup`
- **Body**: `{ fullName, email, mobile, city }`

#### Contact Lawyer
- **POST** `/api/send-email/contact-lawyer`
- **Body**: `{ name, email, phone, subject, message }`

## Email Templates

Each form has a custom HTML email template that includes:
- Professional styling
- Formatted data display
- Contact information
- Action items for the team

## Error Handling

- All endpoints return JSON responses
- Proper error messages for validation failures
- Server-side error logging
- CORS enabled for frontend communication

## Security Notes

- Environment variables are used for sensitive data
- Input validation on all endpoints
- CORS configured for specific frontend URL
- No sensitive data logged in production
