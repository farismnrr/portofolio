import { jsPDF } from "jspdf";

export interface PDFData {
  personalInfo: {
    name: string;
    role: string;
    location: string;
    description: string;
  };
  socialLinks: {
    name: string;
    link: string;
  }[];
  workExperiences: {
    company: string;
    role: string;
    timeframe: string;
    achievements: string[];
  }[];
  studies: {
    institution: string;
    degree: string;
    period: string;
    description: string;
  }[];
  technicalSkills: {
    title: string;
    description: string;
    tags: string[];
  }[];
  projects: {
    title: string;
    summary: string;
    link?: string;
  }[];
  certifications: {
    title: string;
    imageUrl?: string;
  }[];
}

export const generatePDF = async (data: PDFData) => {
  const doc = new jsPDF();
  let yPos = 20;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;

  // Helper for text wrapping
  const addText = (
    text: string,
    fontSize: number,
    style: "normal" | "bold" = "normal",
    color = "#000000",
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", style);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, yPos);
    yPos += lines.length * (fontSize * 0.5) + 2;
  };

  const addLink = (label: string, url: string, fontSize: number, color = "#0066cc") => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(label, contentWidth);
    for (const line of lines) {
      doc.textWithLink(line, margin, yPos, { url });
      yPos += fontSize * 0.5 + 2;
    }
  };

  const ensureSpace = (height: number) => {
    if (yPos + height > pageHeight - margin) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Name and Role
  addText(data.personalInfo.name.toUpperCase(), 24, "bold");
  addText(data.personalInfo.role, 14, "normal", "#666666");
  addText(data.personalInfo.location, 10, "normal", "#888888");
  yPos += 5;

  // Social Links
  const socialText = data.socialLinks.map((s) => `${s.name}: ${s.link}`).join("  |  ");
  addText(socialText, 10, "normal", "#0066cc");
  yPos += 10;

  // About
  doc.setDrawColor(200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;
  addText("ABOUT", 14, "bold");
  addText(data.personalInfo.description, 11);
  yPos += 10;

  // Work Experience
  if (data.workExperiences.length > 0) {
    ensureSpace(20);
    addText("WORK EXPERIENCE", 14, "bold");
    for (const exp of data.workExperiences) {
      ensureSpace(20);
      addText(`${exp.company} • ${exp.role}`, 11, "bold");
      addText(exp.timeframe, 9, "normal", "#666666");
      if (exp.achievements.length > 0) {
        const bullets = exp.achievements.map((item) => `• ${item}`).join("\n");
        addText(bullets, 10);
      }
      yPos += 4;
    }
    yPos += 6;
  }

  // Studies
  if (data.studies.length > 0) {
    ensureSpace(20);
    addText("STUDIES", 14, "bold");
    for (const study of data.studies) {
      ensureSpace(18);
      addText(study.institution, 11, "bold");
      addText(`${study.degree} • ${study.period}`, 9, "normal", "#666666");
      if (study.description) addText(study.description, 10);
      yPos += 4;
    }
    yPos += 6;
  }

  // Technical Skills
  if (data.technicalSkills.length > 0) {
    ensureSpace(20);
    addText("TECHNICAL SKILLS", 14, "bold");
    for (const skill of data.technicalSkills) {
      ensureSpace(16);
      addText(skill.title, 11, "bold");
      if (skill.description) addText(skill.description, 10);
      if (skill.tags.length > 0) {
        addText(`Tags: ${skill.tags.join(", ")}`, 9, "normal", "#666666");
      }
      yPos += 4;
    }
    yPos += 6;
  }

  // Projects
  addText("PROJECTS", 14, "bold");
  for (const project of data.projects) {
    ensureSpace(28);
    addText(project.title, 12, "bold");
    if (project.link) {
      addLink(`URL: ${project.link}`, project.link, 10);
    }
    addText(project.summary, 10);
    yPos += 5;
  }

  // Certifications
  if (data.certifications.length > 0) {
    ensureSpace(20);
    addText("CERTIFICATIONS", 14, "bold");
    for (const cert of data.certifications) {
      ensureSpace(20);
      addText(cert.title, 10);
      if (cert.imageUrl) {
        addLink(`Image: ${cert.imageUrl}`, cert.imageUrl, 9, "#888888");
      }
    }
  }

  doc.save(`${data.personalInfo.name.replace(/\s+/g, "_")}_CV.pdf`);
};
