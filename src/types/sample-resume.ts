import { ResumeData } from "./resume";
import { sampleAvatarDataUrl } from "@/lib/avatar";

export const sampleResume: ResumeData = {
  personal_info: {
    full_name: "Roshan Kumar",
    professional_title: "Senior Data Scientist & AI Engineer",
    email: "roshan.kumar@email.com",
    phone: "+91 98765 43210",
    location: "Kolkata, India",
    linkedin: "https://linkedin.com/in/roshankumar",
    github: "https://github.com/roshankumar",
    website: "https://roshankumar.dev",
    nationality: "Indian",
    hobbies: "Website Development, Learning new skills, Chess",
    power_statement: "Data Scientist with 8+ years of experience building ML solutions that drove 30%+ revenue growth",
    photo_base64: sampleAvatarDataUrl,
  },
  summary:
    "Innovative Data Scientist and AI Engineer with over 8 years of experience designing and deploying machine learning systems that drive measurable business outcomes. Proven track record of increasing operational efficiency by 40% through automated ML pipelines at MOL IT, boosting customer engagement by 35% using recommendation engines at FlipRobo, and reducing false positives by 60% with anomaly detection systems at Inspira Enterprise. Expert in Python, TensorFlow, cloud-native architectures (AWS/Azure), and leading cross-functional AI teams.",
  experience: [
    {
      company: "MOL IT",
      position: "Senior Data Scientist",
      location: "Kolkata, India",
      start_date: "Jan 2022",
      end_date: "Present",
      description: [
        "Engineered an end-to-end ML pipeline processing 5M+ daily transactions, reducing fraud detection latency by 75% and saving $2M annually in potential losses",
        "Spearheaded the development of a real-time recommendation engine using collaborative filtering, increasing cross-sell revenue by 28% within 6 months of deployment",
        "Led a team of 4 data engineers to migrate on-premise ML workloads to AWS SageMaker, reducing infrastructure costs by 45% while improving model training speed by 3x",
        "Designed and deployed an automated A/B testing framework for model evaluation, cutting experiment cycle time from 3 weeks to 4 days",
      ],
    },
    {
      company: "Inspira Enterprise",
      position: "Data Scientist",
      location: "Mumbai, India",
      start_date: "Jun 2019",
      end_date: "Dec 2021",
      description: [
        "Developed an anomaly detection system using Isolation Forest and LSTM networks that identified 94% of security threats, reducing false positive rate by 60% compared to the rule-based predecessor",
        "Built a customer churn prediction model achieving 89% accuracy, enabling the retention team to proactively engage 2,500+ at-risk customers monthly and reducing churn by 22%",
        "Created interactive dashboards in Tableau and Streamlit for real-time KPI monitoring, adopted by 50+ stakeholders across 3 business units",
      ],
    },
    {
      company: "FlipRobo Technologies",
      position: "Junior Data Scientist",
      location: "Bangalore, India",
      start_date: "Mar 2017",
      end_date: "May 2019",
      description: [
        "Implemented NLP-based sentiment analysis pipeline processing 100K+ customer reviews monthly, providing product teams with actionable insights that improved NPS scores by 15 points",
        "Optimized SQL queries and data warehouse ETL processes, reducing report generation time from 6 hours to 45 minutes",
        "Collaborated with product managers to design and validate A/B tests, contributing to a 12% increase in user engagement metrics",
      ],
    },
  ],
  education: [
    {
      institution: "Indian Institute of Technology, Kharagpur",
      degree: "M.Tech in Artificial Intelligence",
      location: "Kharagpur, India",
      start_date: "Jul 2015",
      end_date: "Jun 2017",
      description: "GPA: 8.7/10. Thesis on 'Deep Learning Approaches for Time-Series Anomaly Detection in Financial Systems'",
    },
    {
      institution: "Jadavpur University",
      degree: "B.E. in Computer Science",
      location: "Kolkata, India",
      start_date: "Aug 2011",
      end_date: "Jun 2015",
      description: "First Class with Distinction. Dean's List all semesters.",
    },
  ],
  skills: [
    {
      category: "Programming Languages",
      skills: ["Python", "SQL", "R", "Java", "TypeScript"],
    },
    {
      category: "ML & AI Frameworks",
      skills: ["TensorFlow", "PyTorch", "Scikit-learn", "LangChain", "XGBoost"],
    },
    {
      category: "Cloud & DevOps",
      skills: ["AWS SageMaker", "Azure ML", "Docker", "Kubernetes", "CI/CD"],
    },
    {
      category: "Data Engineering",
      skills: ["Apache Spark", "Kafka", "Airflow", "PostgreSQL", "MongoDB"],
    },
  ],
  projects: [
    {
      name: "AI-Powered Resume Builder",
      role: "Lead Developer & Architect",
      link: "https://github.com/roshankumar/resume-ai",
      description: "Built a multi-agent LangGraph system that analyzes resumes against job descriptions, generates optimized content using the XYZ formula, and produces ATS-friendly PDF/Excel exports. Reduced resume tailoring time by 80% in user testing.",
    },
    {
      name: "Real-Time Fraud Detection Engine",
      role: "ML Engineer",
      link: "",
      description: "Designed a streaming fraud detection system using Kafka + TensorFlow serving, processing 10K+ events/second with sub-100ms inference latency. Achieved 96% precision in identifying fraudulent transactions.",
    },
  ],
  certifications: [
    {
      name: "AWS Certified Machine Learning - Specialty",
      issuer: "Amazon Web Services",
      date: "Mar 2023",
    },
    {
      name: "Deep Learning Specialization",
      issuer: "deeplearning.ai / Coursera",
      date: "Aug 2021",
    },
  ],
  languages: [
    { name: "English", proficiency: "Fluent" },
    { name: "Hindi", proficiency: "Native" },
    { name: "Bengali", proficiency: "Native" },
  ],
  accomplishments: [
    "Published 3 research papers in peer-reviewed journals on anomaly detection and NLP (IEEE, Springer)",
    "Speaker at PyData Mumbai 2023 — 'Building Production-Ready ML Pipelines'",
    "Awarded 'Data Scientist of the Year' at MOL IT (2023) for exceptional contribution to fraud detection systems",
    "Open source contributor to LangChain and Apache Airflow projects",
  ],
};
