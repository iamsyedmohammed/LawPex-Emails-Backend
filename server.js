const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,  // Allow all origins
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // 16-digit app-specific password
    }
  });
};

// Email templates
const emailTemplates = {
  askFreeQuestion: (data) => ({
    subject: `New Legal Question: ${data.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">New Legal Question Submission</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #34495e; margin-top: 0;">Question Details</h3>
          <p><strong>Area of Law:</strong> ${data.areaOfLaw}</p>
          <p><strong>City:</strong> ${data.city}</p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Question:</strong></p>
          <div style="background-color: white; padding: 15px; border-left: 4px solid #3498db;">
            ${data.question.replace(/\n/g, '<br>')}
          </div>
        </div>
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 5px;">
          <h3 style="color: #27ae60; margin-top: 0;">Contact Information</h3>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Contact Number:</strong> ${data.contactNo}</p>
          <p><strong>Interested in Lawyer:</strong> ${data.interestedInLawyer ? 'Yes' : 'No'}</p>
        </div>
        <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 5px;">
          <p style="margin: 0; color: #856404;"><strong>Note:</strong> This question was submitted through the LawPex website.</p>
        </div>
      </div>
    `
  }),

  talkToLawyer: (data) => ({
    subject: `New Talk to Lawyer Request from ${data.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">New Talk to Lawyer Request</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #34495e; margin-top: 0;">Client Information</h3>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Mobile Number:</strong> ${data.mobileNumber}</p>
          <p><strong>City:</strong> ${data.city}</p>
          <p><strong>Agreed to Terms:</strong> ${data.agreeToTerms ? 'Yes' : 'No'}</p>
        </div>
        <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 5px;">
          <p style="margin: 0; color: #856404;"><strong>Action Required:</strong> Please contact the client to discuss their legal needs and connect them with appropriate lawyers.</p>
        </div>
      </div>
    `
  }),

  lawyerSignup: (data) => ({
    subject: `New Lawyer Signup Request from ${data.fullName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">New Lawyer Signup Request</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #34495e; margin-top: 0;">Lawyer Information</h3>
          <p><strong>Full Name:</strong> ${data.fullName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Mobile Number:</strong> ${data.mobile}</p>
          <p><strong>City:</strong> ${data.city}</p>
        </div>
        <div style="margin-top: 20px; padding: 15px; background-color: #d4edda; border-radius: 5px;">
          <p style="margin: 0; color: #155724;"><strong>Next Steps:</strong> Please review the lawyer's credentials and initiate the verification process.</p>
        </div>
      </div>
    `
  })
};

// Routes
app.post('/api/send-email/ask-free-question', async (req, res) => {
  try {
    const { areaOfLaw, city, subject, question, name, contactNo, email, interestedInLawyer } = req.body;

    // Validate required fields
    if (!areaOfLaw || !city || !subject || !question || !name || !contactNo || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    const transporter = createTransporter();
    
    // Email 1: Send notification to admin (syedmohdah@gmail.com)
    const adminTemplate = emailTemplates.askFreeQuestion(req.body);
    const adminMailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
      replyTo: email
    };

    // Email 2: Send automated response to the client
    const clientResponseTemplate = {
      subject: 'Thank You for Your Legal Question - LawPex',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin-bottom: 10px;">Welcome to LawPex!</h1>
            <p style="color: #7f8c8d; font-size: 16px;">Your Legal Question Has Been Received</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <p style="color: #2c3e50; font-size: 18px; margin-bottom: 20px;">
              Hello <strong>${name}</strong>,
            </p>
            
            <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">
              Thank you for submitting your legal question to LawPex. We have received your query and our team is already working to provide you with the best possible answer.
            </p>
            
            <div style="background-color: white; padding: 20px; border-radius: 5px; border-left: 4px solid #3498db; margin-bottom: 20px;">
              <h3 style="color: #2c3e50; margin-top: 0; margin-bottom: 15px;">Your Question Details:</h3>
              <p style="color: #34495e; margin-bottom: 10px;"><strong>Area of Law:</strong> ${areaOfLaw}</p>
              <p style="color: #34495e; margin-bottom: 10px;"><strong>Subject:</strong> ${subject}</p>
              <p style="color: #34495e; margin-bottom: 10px;"><strong>City:</strong> ${city}</p>
              <p style="color: #34495e; margin-bottom: 0;"><strong>Question:</strong> ${question}</p>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 5px; border-left: 4px solid #27ae60;">
              <h3 style="color: #2c3e50; margin-top: 0; margin-bottom: 15px;">What Happens Next?</h3>
              <ul style="color: #34495e; line-height: 1.8; padding-left: 20px;">
                <li><strong>Question Review:</strong> Our team will review your legal question</li>
                <li><strong>Lawyer Assignment:</strong> We'll assign it to the most suitable lawyer</li>
                <li><strong>Response Timeline:</strong> You'll receive an answer within 24 hours</li>
                <li><strong>Email Notification:</strong> We'll notify you when your question is answered</li>
              </ul>
            </div>
            
            <p style="color: #34495e; line-height: 1.6; margin-top: 20px;">
              Our team will contact you at <strong>${contactNo}</strong> if we need any additional information to provide you with a comprehensive answer.
            </p>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #27ae60; margin-top: 0;">Why Choose LawPex?</h3>
            <ul style="color: #34495e; line-height: 1.6; padding-left: 20px;">
              <li>Expert lawyers with years of experience</li>
              <li>Quick response time (within 24 hours)</li>
              <li>Free legal advice and consultation</li>
              <li>Confidential and secure platform</li>
              <li>No hidden charges or fees</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; margin-bottom: 10px;">
              <strong>Need immediate assistance?</strong><br>
              Call us at <strong>+91-8750-100-555</strong> or email us at <a href="mailto:contact@lawpex.com" style="color: #3498db;">contact@lawpex.com</a>
            </p>
            <p style="color: #95a5a6; font-size: 14px;">
              <strong>Thanks and Regards,</strong><br>
              Team LawPex.com
            </p>
          </div>
        </div>
      `
    };

    const clientMailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: clientResponseTemplate.subject,
      html: clientResponseTemplate.html
    };

    // Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(clientMailOptions);

    res.json({ 
      success: true, 
      message: 'Your legal question has been submitted successfully. Please check your email for confirmation and next steps.' 
    });

  } catch (error) {
    console.error('Error sending ask free question email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit your question. Please try again later.' 
    });
  }
});

app.post('/api/send-email/talk-to-lawyer', async (req, res) => {
  try {
    const { name, mobileNumber, email, city, agreeToTerms } = req.body;

    // Validate required fields
    if (!name || !mobileNumber || !email || !city || !agreeToTerms) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided and terms must be agreed to' 
      });
    }

    const transporter = createTransporter();
    
    // Email 1: Send notification to admin (syedmohdah@gmail.com)
    const adminTemplate = emailTemplates.talkToLawyer(req.body);
    const adminMailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
      replyTo: email
    };

    // Email 2: Send automated response to the client
    const clientResponseTemplate = {
      subject: 'Thank You for Choosing LawPex - We\'ll Connect You with the Right Lawyer',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin-bottom: 10px;">Welcome to LawPex!</h1>
            <p style="color: #7f8c8d; font-size: 16px;">Connecting You to Trusted Lawyers</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <p style="color: #2c3e50; font-size: 18px; margin-bottom: 20px;">
              Hello <strong>${name}</strong>,
            </p>
            
            <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">
              Thank you for choosing LawPex to help you find the right lawyer for your legal needs.
            </p>
            
            <p style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">
              We have received your request and our team is already working to connect you with the best-matched lawyers in <strong>${city}</strong>.
            </p>
            
            <div style="background-color: white; padding: 20px; border-radius: 5px; border-left: 4px solid #3498db;">
              <h3 style="color: #2c3e50; margin-top: 0; margin-bottom: 15px;">What Happens Next?</h3>
              <ul style="color: #34495e; line-height: 1.8; padding-left: 20px;">
                <li><strong>Immediate Review:</strong> Our team will review your requirements</li>
                <li><strong>Lawyer Matching:</strong> We'll identify the best lawyers in your area</li>
                <li><strong>Quick Contact:</strong> You'll receive lawyer details within 2-4 hours</li>
                <li><strong>Free Consultation:</strong> Schedule a consultation with your matched lawyer</li>
              </ul>
            </div>
            
            <p style="color: #34495e; line-height: 1.6; margin-top: 20px;">
              Our team will contact you at <strong>${mobileNumber}</strong> to discuss your legal requirements in detail and provide you with the contact information of suitable lawyers.
            </p>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #27ae60; margin-top: 0;">Why Choose LawPex?</h3>
            <ul style="color: #34495e; line-height: 1.6; padding-left: 20px;">
              <li>Verified and experienced lawyers</li>
              <li>Quick response time (2-4 hours)</li>
              <li>Free initial consultation</li>
              <li>Transparent pricing</li>
              <li>Client satisfaction guarantee</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; margin-bottom: 10px;">
              <strong>Need immediate assistance?</strong><br>
              Call us at <strong>+91-8750-100-555</strong> or email us at <a href="mailto:contact@lawpex.com" style="color: #3498db;">contact@lawpex.com</a>
            </p>
            <p style="color: #95a5a6; font-size: 14px;">
              <strong>Thanks and Regards,</strong><br>
              Team LawPex.com
            </p>
          </div>
        </div>
      `
    };

    const clientMailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: clientResponseTemplate.subject,
      html: clientResponseTemplate.html
    };

    // Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(clientMailOptions);

    res.json({ 
      success: true, 
      message: 'Your request has been submitted successfully. Please check your email for confirmation and next steps.' 
    });

  } catch (error) {
    console.error('Error sending talk to lawyer email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit your request. Please try again later.' 
    });
  }
});

app.post('/api/send-email/lawyer-signup', async (req, res) => {
  try {
    const { fullName, email, mobile, city } = req.body;

    // Validate required fields
    if (!fullName || !email || !mobile || !city) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    const transporter = createTransporter();
    
    // Email 1: Send notification to admin (syedmohdah@gmail.com)
    const adminTemplate = emailTemplates.lawyerSignup(req.body);
    const adminMailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
      replyTo: email
    };

    // Email 2: Send automated response to the lawyer
    const lawyerResponseTemplate = {
      subject: 'Welcome to LawPex - Next Steps for Your Profile Creation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin-bottom: 10px;">Welcome to LawPex!</h1>
            <p style="color: #7f8c8d; font-size: 16px;">Connecting You to Trusted Lawyers</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <p style="color: #2c3e50; font-size: 18px; margin-bottom: 20px;">
              Hello <strong>${fullName}</strong>,
            </p>
            
            <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">
              Greetings for the day!
            </p>
            
            <p style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">
              Thank you for your interest in joining LawPex. For creating your profile, we would require the below mentioned details:
            </p>
            
            <div style="background-color: white; padding: 20px; border-radius: 5px; border-left: 4px solid #3498db;">
              <h3 style="color: #2c3e50; margin-top: 0; margin-bottom: 15px;">Required Documents & Information:</h3>
              <ol style="color: #34495e; line-height: 1.8; padding-left: 20px;">
                <li><strong>Professional Photo</strong></li>
                <li><strong>Bar Council ID Card Photo</strong></li>
                <li><strong>Areas of Expertise</strong></li>
                <li><strong>Office Address</strong></li>
                <li><strong>Courts that you practice in</strong></li>
                <li><strong>Email Address</strong></li>
                <li><strong>Languages Spoken</strong></li>
              </ol>
            </div>
            
            <p style="color: #34495e; line-height: 1.6; margin-top: 20px;">
              Kindly provide us the above mentioned details via WhatsApp or mail it to us at 
              <a href="mailto:partner@lawpex.com" style="color: #3498db; text-decoration: none;">
                <strong>partner@lawpex.com</strong>
              </a>
            </p>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #27ae60; margin-top: 0;">What's Next?</h3>
            <ul style="color: #34495e; line-height: 1.6; padding-left: 20px;">
              <li>Our team will review your documents</li>
              <li>Profile verification process will be completed</li>
              <li>Your profile will go live within 48 hours</li>
              <li>You'll start receiving client inquiries</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; margin-bottom: 10px;">
              <strong>Thanks and Regards,</strong><br>
              Team LawPex.com
            </p>
            <p style="color: #95a5a6; font-size: 14px;">
              For any queries, contact us at <a href="mailto:partner@lawpex.com" style="color: #3498db;">partner@lawpex.com</a>
            </p>
          </div>
        </div>
      `
    };

    const lawyerMailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: lawyerResponseTemplate.subject,
      html: lawyerResponseTemplate.html
    };

    // Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(lawyerMailOptions);

    res.json({ 
      success: true, 
      message: 'Your signup request has been submitted successfully. Please check your email for next steps and required documents.' 
    });

  } catch (error) {
    console.error('Error sending lawyer signup email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit your signup request. Please try again later.' 
    });
  }
});

app.post('/api/send-email/contact-lawyer', async (req, res) => {
  try {
    const { lawyerName, lawyerPhone, clientName, clientEmail, clientPhone, clientCity, subject, message } = req.body;

    // Validate required fields
    if (!lawyerName || !clientName || !clientEmail || !clientPhone) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    const transporter = createTransporter();
    
    // Email 1: Send notification to admin (syedmohdah@gmail.com)
    const adminTemplate = {
      subject: `New Contact Request for ${lawyerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50;">New Contact Request</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #2c3e50; margin-top: 0;">Lawyer Information:</h3>
            <p><strong>Name:</strong> ${lawyerName}</p>
            <p><strong>Phone:</strong> ${lawyerPhone || 'Not provided'}</p>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #27ae60; margin-top: 0;">Client Information:</h3>
            <p><strong>Name:</strong> ${clientName}</p>
            <p><strong>Email:</strong> ${clientEmail}</p>
            <p><strong>Phone:</strong> ${clientPhone}</p>
            <p><strong>City:</strong> ${clientCity || 'Not provided'}</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <p style="margin: 0;"><strong>Note:</strong> Client has been provided with the lawyer's contact information and can now contact them directly.</p>
          </div>
        </div>
      `
    };

    const adminMailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
      replyTo: clientEmail
    };

    // Email 2: Send confirmation to client with lawyer's phone number
    const clientResponseTemplate = {
      subject: `Contact Information for ${lawyerName} - LawPex`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin-bottom: 10px;">Contact Information Provided!</h1>
            <p style="color: #7f8c8d; font-size: 16px;">You can now contact ${lawyerName} directly</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <p style="color: #2c3e50; font-size: 18px; margin-bottom: 20px;">
              Hello <strong>${clientName}</strong>,
            </p>
            
            <p style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">
              Thank you for your interest in contacting <strong>${lawyerName}</strong>. You can now reach out to them directly using the contact information provided below.
            </p>
            
            <div style="background-color: #d4af37; padding: 30px; border-radius: 15px; margin-bottom: 20px; text-align: center; box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);">
              <h2 style="color: #000; margin-top: 0; margin-bottom: 15px; font-size: 24px;">📞 Lawyer Contact Number</h2>
              <div style="background-color: #000; color: #d4af37; padding: 20px; border-radius: 10px; font-size: 28px; font-weight: bold; letter-spacing: 2px;">
                ${lawyerPhone || 'Contact number will be provided separately'}
              </div>
              <p style="color: #000; margin-top: 15px; font-weight: 600; font-size: 16px;">
                Call now to discuss your legal requirements
              </p>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 5px; border-left: 4px solid #27ae60;">
              <h3 style="color: #2c3e50; margin-top: 0; margin-bottom: 15px;">Important Instructions:</h3>
              <ul style="color: #34495e; line-height: 1.8; padding-left: 20px;">
                <li><strong>Mention LawPex:</strong> Please mention that you contacted through LawPex for better assistance</li>
                <li><strong>Be Prepared:</strong> Have your legal questions ready before calling</li>
                <li><strong>Timing:</strong> Call during business hours for better response</li>
                <li><strong>Follow-up:</strong> You can call back if you don't reach them initially</li>
              </ul>
            </div>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #27ae60; margin-top: 0;">Next Steps:</h3>
            <ul style="color: #34495e; line-height: 1.6; padding-left: 20px;">
              <li>Call the lawyer using the provided phone number</li>
              <li>Mention that you contacted through LawPex</li>
              <li>Discuss your legal requirements</li>
              <li>Schedule a consultation if needed</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; margin-bottom: 10px;">
              <strong>Need more help?</strong><br>
              Call us at <strong>+91-8750-100-555</strong> or email us at <a href="mailto:contact@lawpex.com" style="color: #3498db;">contact@lawpex.com</a>
            </p>
            <p style="color: #95a5a6; font-size: 14px;">
              <strong>Thanks and Regards,</strong><br>
              Team LawPex.com
            </p>
          </div>
        </div>
      `
    };

    const clientMailOptions = {
      from: process.env.EMAIL_FROM,
      to: clientEmail,
      subject: clientResponseTemplate.subject,
      html: clientResponseTemplate.html
    };

    // Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(clientMailOptions);

    res.json({ 
      success: true, 
      message: 'Contact request submitted successfully. You will be redirected to the thank you page.' 
    });

  } catch (error) {
    console.error('Error sending contact lawyer email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit your contact request. Please try again later.' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Musab Hashmi Legal Services Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Musab Hashmi Legal Services Backend running on port ${PORT}`);
  console.log(`📧 Email service configured with: ${process.env.EMAIL_USER}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = app;
