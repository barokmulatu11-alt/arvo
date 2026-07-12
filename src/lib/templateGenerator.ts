// Production-grade PDF template builder
// Generates a complete printable standalone HTML document with:
// - @page CSS for exact paper sizing & margins
// - Embedded Google Fonts (vector, selectable text)
// - break-inside: avoid on all item blocks (no content cutting across pages)
// - All resume sections: Summary, Experience, Education, Skills, Projects, Certifications
// - Full per-template typography for all 20 templates

export const buildResumeHTML = (templateId: string, content: any, margins: string, paperSize: string) => {
  const marginVal = margins === "narrow" ? "12mm" : margins === "wide" ? "28mm" : "18mm";
  const pageWidth = paperSize === "a4" ? "210mm" : "215.9mm";
  const pageHeight = paperSize === "a4" ? "297mm" : "279.4mm";

  // Default style tokens
  let fontImport = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap";
  let fontStack = "'Inter', system-ui, sans-serif";
  let bgColor = "#ffffff";
  let textColor = "#1e293b";
  let headerStyle = "border-bottom: 1px solid #cbd5e1; padding-bottom: 14px; margin-bottom: 18px;";
  let nameStyle = "font-size: 22pt; font-weight: 700; color: #0f172a; margin: 0 0 2px 0; line-height: 1.1;";
  let taglineStyle = "font-size: 10pt; color: #64748b; margin: 3px 0 0 0;";
  let contactStyle = "display: flex; flex-wrap: wrap; gap: 10px; color: #64748b; font-size: 8.5pt; margin-top: 7px;";
  let sectionHeaderStyle = "margin-top: 14px; margin-bottom: 10px; page-break-inside: avoid; break-inside: avoid;";
  let sectionTitleStyle = "font-size: 9.5pt; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 3px 0;";
  let sectionDividerStyle = "height: 1px; background: #cbd5e1; margin-bottom: 10px;";
  let itemTitleStyle = "font-weight: 700; font-size: 10.5pt; color: #0f172a;";
  let itemSubStyle = "font-size: 9.5pt; color: #475569; font-style: italic;";
  let itemDateStyle = "font-size: 9pt; color: #64748b;";
  let itemDescStyle = "font-size: 9.5pt; color: #334155; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap;";
  let skillsWrapperStyle = "display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; margin-top: 6px;";
  let skillCategoryStyle = "font-size: 9.5pt; font-weight: 700;";
  let skillItemStyle = "font-size: 9pt; color: #475569;";
  const itemBlockStyle = "margin-top: 10px; page-break-inside: avoid; break-inside: avoid;";

  switch (templateId) {
    case 'minimal':
      fontStack = "'Inter', sans-serif"; bgColor = "#fff"; textColor = "#171717";
      headerStyle = "text-align: center; border-bottom: 1px solid #171717; padding-bottom: 10px; margin-bottom: 16px;";
      nameStyle = "font-size: 20pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #171717; margin: 0; text-align: center;";
      taglineStyle = "font-size: 9.5pt; color: #6b7280; text-align: center; margin-top: 3px;";
      contactStyle = "display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; color: #6b7280; font-size: 8pt; margin-top: 6px;";
      sectionTitleStyle = "font-size: 9pt; font-weight: 700; color: #171717; text-transform: uppercase; letter-spacing: 0.08em;";
      sectionDividerStyle = "height: 1px; background: #171717; margin-bottom: 10px;";
      itemTitleStyle = "font-size: 10pt; font-weight: 700; color: #171717;";
      itemSubStyle = "font-size: 9pt; font-style: italic; color: #404040;";
      itemDateStyle = "font-size: 8.5pt; color: #6b7280;";
      itemDescStyle = "font-size: 9pt; color: #404040; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap;";
      skillCategoryStyle = "font-size: 9pt; font-weight: 700; color: #171717;";
      skillItemStyle = "font-size: 8.5pt; color: #404040;";
      break;
    case 'modern':
      fontStack = "'Inter', sans-serif"; bgColor = "#fff"; textColor = "#334155";
      headerStyle = "border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px;";
      nameStyle = "font-size: 22pt; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.02em;";
      taglineStyle = "font-size: 10pt; color: #64748b; margin-top: 3px;";
      contactStyle = "display: flex; flex-wrap: wrap; gap: 12px; color: #64748b; font-size: 8pt; margin-top: 6px;";
      sectionTitleStyle = "font-size: 9.5pt; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; border-left: 3px solid #94a3b8; padding-left: 8px;";
      sectionDividerStyle = "height: 1px; background: #f1f5f9; margin-bottom: 10px;";
      itemTitleStyle = "font-size: 10.5pt; font-weight: 700; color: #0f172a;";
      itemSubStyle = "font-size: 9pt; font-style: italic; color: #334155;";
      itemDateStyle = "font-size: 8.5pt; color: #64748b;";
      itemDescStyle = "font-size: 9pt; color: #475569; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap;";
      break;
    case 'executive':
      fontImport = "https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&display=swap";
      fontStack = "'Merriweather', Georgia, serif"; bgColor = "#fff"; textColor = "#292524";
      headerStyle = "text-align: center; border-bottom: 2px solid #e7e5e4; padding-bottom: 12px; margin-bottom: 18px;";
      nameStyle = "font-size: 22pt; font-weight: 700; color: #1c1917; margin: 0; text-align: center;";
      taglineStyle = "font-size: 10pt; color: #78716c; font-style: italic; text-align: center; margin-top: 4px;";
      contactStyle = "display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; color: #78716c; font-size: 8pt; margin-top: 6px;";
      sectionTitleStyle = "font-size: 10pt; font-weight: 700; color: #1c1917; border-bottom: 1px solid #d6d3d1; padding-bottom: 3px;";
      sectionDividerStyle = "height: 0; display: none;";
      itemTitleStyle = "font-size: 10pt; font-weight: 700; color: #1c1917;";
      itemSubStyle = "font-size: 9pt; font-style: italic; color: #44403c;";
      itemDateStyle = "font-size: 8.5pt; color: #78716c;";
      itemDescStyle = "font-size: 9pt; color: #44403c; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap;";
      break;
    case 'corporate':
      fontStack = "'Inter', sans-serif"; bgColor = "#fff"; textColor = "#262626";
      headerStyle = "border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 16px;";
      nameStyle = "font-size: 22pt; font-weight: 700; text-transform: uppercase; color: #1e3a8a; margin: 0; letter-spacing: 0.02em;";
      taglineStyle = "font-size: 10pt; color: #737373; margin-top: 3px;";
      contactStyle = "display: flex; flex-wrap: wrap; gap: 12px; color: #737373; font-size: 8pt; margin-top: 6px;";
      sectionTitleStyle = "font-size: 9.5pt; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.06em;";
      sectionDividerStyle = "height: 2px; background: #dbeafe; margin-bottom: 10px;";
      itemTitleStyle = "font-size: 10.5pt; font-weight: 700; color: #172554;";
      itemSubStyle = "font-size: 9pt; font-style: italic; color: #404040;";
      itemDateStyle = "font-size: 8.5pt; color: #1e3a8a; font-weight: 600;";
      itemDescStyle = "font-size: 9pt; color: #525252; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap;";
      break;
    case 'software':
      fontImport = "https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap";
      fontStack = "'Fira Code', Consolas, monospace"; bgColor = "#171717"; textColor = "#4ade80";
      headerStyle = "border-bottom: 1px solid #166534; padding-bottom: 12px; margin-bottom: 16px;";
      nameStyle = "font-size: 20pt; font-weight: 700; color: #86efac; margin: 0;";
      taglineStyle = "font-size: 9.5pt; color: #15803d; margin-top: 3px;";
      contactStyle = "display: flex; flex-wrap: wrap; gap: 12px; color: #15803d; font-size: 8pt; margin-top: 6px;";
      sectionTitleStyle = "font-size: 9pt; font-weight: 700; color: #86efac; text-transform: uppercase; letter-spacing: 0.06em;";
      sectionDividerStyle = "height: 1px; background: #166534; margin-bottom: 10px;";
      itemTitleStyle = "font-size: 10pt; font-weight: 700; color: #86efac;";
      itemSubStyle = "font-size: 9pt; font-style: italic; color: #4ade80;";
      itemDateStyle = "font-size: 8.5pt; color: #22c55e;";
      itemDescStyle = "font-size: 9pt; color: #d1d5db; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap;";
      skillCategoryStyle = "font-size: 9pt; font-weight: 700; color: #86efac;";
      skillItemStyle = "font-size: 8.5pt; color: #d1d5db;";
      break;
    case 'data':
      fontImport = "https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap";
      fontStack = "'Fira Code', Consolas, monospace"; bgColor = "#fff"; textColor = "#27272a";
      headerStyle = "border-bottom: 1px solid #ddd6fe; padding-bottom: 12px; margin-bottom: 16px;";
      nameStyle = "font-size: 22pt; font-weight: 700; color: #5b21b6; margin: 0;";
      taglineStyle = "font-size: 10pt; color: #71717a; margin-top: 3px;";
      contactStyle = "display: flex; flex-wrap: wrap; gap: 12px; color: #71717a; font-size: 8pt; margin-top: 6px;";
      sectionTitleStyle = "font-size: 9.5pt; font-weight: 700; color: #6d28d9; text-transform: uppercase; letter-spacing: 0.06em;";
      sectionDividerStyle = "height: 1px; background: #ddd6fe; margin-bottom: 10px;";
      itemTitleStyle = "font-size: 10pt; font-weight: 700; color: #4c1d95;";
      itemSubStyle = "font-size: 9pt; font-style: italic; color: #3f3f46;";
      itemDateStyle = "font-size: 8.5pt; color: #7c3aed;";
      itemDescStyle = "font-size: 9pt; color: #52525b; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap;";
      break;
    case 'product':
      fontImport = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap";
      fontStack = "'Outfit', 'Inter', sans-serif"; bgColor = "#fff"; textColor = "#262626";
      headerStyle = "border-left: 4px solid #059669; padding-left: 16px; margin-bottom: 16px;";
      nameStyle = "font-size: 22pt; font-weight: 800; color: #171717; margin: 0;";
      taglineStyle = "font-size: 10pt; color: #047857; font-weight: 600; margin-top: 3px;";
      contactStyle = "display: flex; flex-wrap: wrap; gap: 12px; color: #737373; font-size: 8pt; margin-top: 6px;";
      sectionTitleStyle = "font-size: 9.5pt; font-weight: 700; color: #171717; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #a7f3d0; padding-bottom: 2px;";
      sectionDividerStyle = "height: 0; display: none;";
      itemTitleStyle = "font-size: 10.5pt; font-weight: 700; color: #0a0a0a;";
      itemSubStyle = "font-size: 9pt; font-style: italic; color: #404040;";
      itemDateStyle = "font-size: 8.5pt; color: #047857; font-weight: 700;";
      itemDescStyle = "font-size: 9pt; color: #525252; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap;";
      break;
    case 'designer':
      fontImport = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap";
      fontStack = "'Outfit', 'Inter', sans-serif"; bgColor = "#f8fafc"; textColor = "#1e293b";
      headerStyle = "display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #c7d2fe; padding-bottom: 14px; margin-bottom: 18px;";
      nameStyle = "font-size: 24pt; font-weight: 900; text-transform: uppercase; color: #4338ca; margin: 0;";
      taglineStyle = "font-size: 10pt; color: #64748b; margin-top: 3px;";
      contactStyle = "display: flex; flex-direction: column; gap: 3px; align-items: flex-end; color: #64748b; font-size: 8pt;";
      sectionTitleStyle = "font-size: 10pt; font-weight: 900; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.06em;";
      sectionDividerStyle = "height: 2px; background: #c7d2fe; width: 64px; margin-bottom: 10px;";
      itemTitleStyle = "font-size: 10.5pt; font-weight: 700; color: #0f172a;";
      itemSubStyle = "font-size: 9pt; font-style: italic; color: #4338ca;";
      itemDateStyle = "font-size: 8.5pt; color: #94a3b8;";
      itemDescStyle = "font-size: 9pt; color: #475569; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap;";
      break;
    case 'creative':
      fontImport = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap";
      fontStack = "'Playfair Display', Georgia, serif"; bgColor = "#fff"; textColor = "#44403c";
      headerStyle = "text-align: center; border-bottom: 1px solid #fecdd3; padding-bottom: 14px; margin-bottom: 18px;";
      nameStyle = "font-size: 26pt; font-weight: 900; text-transform: uppercase; color: #e11d48; margin: 0; text-align: center;";
      taglineStyle = "font-size: 10.5pt; color: #78716c; font-style: italic; text-align: center; margin-top: 4px;";
      contactStyle = "display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; color: #a8a29e; font-size: 8pt; margin-top: 6px;";
      sectionTitleStyle = "font-size: 10.5pt; font-weight: 900; color: #e11d48; text-transform: uppercase;";
      sectionDividerStyle = "height: 2px; background: #ffe4e6; margin-bottom: 10px;";
      itemTitleStyle = "font-size: 10.5pt; font-weight: 700; color: #1c1917;";
      itemSubStyle = "font-size: 9pt; font-style: italic; color: #be123c;";
      itemDateStyle = "font-size: 8.5pt; color: #78716c;";
      itemDescStyle = "font-size: 9pt; color: #57534e; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap;";
      break;
    case 'academic':
      fontStack = "Georgia, 'Times New Roman', serif"; bgColor = "#fff"; textColor = "#171717";
      headerStyle = "text-align: center; border-bottom: 1px solid #d4d4d4; padding-bottom: 12px; margin-bottom: 16px;";
      nameStyle = "font-size: 22pt; font-weight: 700; text-align: center; color: #0a0a0a; margin: 0;";
      taglineStyle = "font-size: 10pt; color: #737373; text-align: center; margin-top: 3px;";
      contactStyle = "display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; color: #737373; font-size: 8pt; margin-top: 6px;";
      sectionTitleStyle = "font-size: 10.5pt; font-weight: 700; color: #0a0a0a; border-bottom: 1px solid #d4d4d4; padding-bottom: 3px;";
      sectionDividerStyle = "height: 0; display: none;";
      itemTitleStyle = "font-size: 10pt; font-weight: 700; color: #0a0a0a;";
      itemSubStyle = "font-size: 9pt; font-style: italic; color: #262626;";
      itemDateStyle = "font-size: 8.5pt; color: #737373;";
      itemDescStyle = "font-size: 9pt; color: #404040; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap;";
      break;
    case 'graduate':
      fontStack = "'Inter', sans-serif"; bgColor = "#fff"; textColor = "#262626";
      headerStyle = "border-top: 4px solid #f59e0b; padding-top: 8px; margin-bottom: 16px;";
      nameStyle = "font-size: 22pt; font-weight: 700; color: #171717; margin: 0;";
      taglineStyle = "font-size: 10pt; color: #b45309; font-weight: 600; margin-top: 3px;";
      contactStyle = "display: flex; flex-wrap: wrap; gap: 12px; color: #737373; font-size: 8pt; margin-top: 6px;";
      sectionTitleStyle = "font-size: 9.5pt; font-weight: 700; color: #171717; text-transform: uppercase; border-bottom: 1px solid #fde68a; padding-bottom: 2px;";
      sectionDividerStyle = "height: 0; display: none;";
      itemTitleStyle = "font-size: 10.5pt; font-weight: 700; color: #0a0a0a;";
      itemSubStyle = "font-size: 9pt; font-style: italic; color: #404040;";
      itemDateStyle = "font-size: 8.5pt; color: #b45309; font-weight: 700;";
      itemDescStyle = "font-size: 9pt; color: #525252; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap;";
      break;
    case 'internship':
      fontStack = "'Inter', sans-serif"; bgColor = "#fff"; textColor = "#1e293b";
      headerStyle = "border-bottom: 1px solid #e0f2fe; padding-bottom: 12px; margin-bottom: 16px;";
      nameStyle = "font-size: 22pt; font-weight: 700; color: #0f172a; margin: 0;";
      taglineStyle = "font-size: 10pt; color: #0284c7; font-weight: 500; margin-top: 3px;";
      contactStyle = "display: flex; flex-wrap: wrap; gap: 12px; color: #64748b; font-size: 8pt; margin-top: 6px;";
      sectionTitleStyle = "font-size: 9.5pt; font-weight: 700; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #7dd3fc; padding-bottom: 2px;";
      sectionDividerStyle = "height: 0; display: none;";
      itemTitleStyle = "font-size: 10.5pt; font-weight: 700; color: #0f172a;";
      itemSubStyle = "font-size: 9pt; font-style: italic; color: #334155;";
      itemDateStyle = "font-size: 8.5pt; color: #0284c7;";
      itemDescStyle = "font-size: 9pt; color: #475569; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap;";
      break;
    case 'healthcare':
      fontStack = "'Inter', sans-serif"; bgColor = "#fff"; textColor = "#27272a";
      headerStyle = "border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px;";
      nameStyle = "font-size: 22pt; font-weight: 700; color: #115e59; margin: 0;";
      taglineStyle = "font-size: 10pt; color: #0d9488; font-weight: 500; margin-top: 3px;";
      contactStyle = "display: flex; flex-wrap: wrap; gap: 12px; color: #52525b; font-size: 8pt; margin-top: 6px;";
      sectionTitleStyle = "font-size: 9.5pt; font-weight: 700; color: #115e59; text-transform: uppercase;";
      sectionDividerStyle = "height: 1px; background: #ccfbf1; margin-bottom: 10px;";
      itemTitleStyle = "font-size: 10.5pt; font-weight: 700; color: #134e4a;";
      itemSubStyle = "font-size: 9pt; font-style: italic; color: #3f3f46;";
      itemDateStyle = "font-size: 8.5pt; color: #0f766e;";
      itemDescStyle = "font-size: 9pt; color: #52525b; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap;";
      break;
    case 'teacher':
      fontStack = "'Inter', sans-serif"; bgColor = "#fff"; textColor = "#27272a";
      headerStyle = "text-align: center; border-bottom: 1px solid #fed7aa; padding-bottom: 12px; margin-bottom: 16px;";
      nameStyle = "font-size: 22pt; font-weight: 700; color: #c2410c; margin: 0; text-align: center;";
      taglineStyle = "font-size: 10pt; color: #78716c; font-weight: 500; text-align: center; margin-top: 3px;";
      contactStyle = "display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; color: #78716c; font-size: 8pt; margin-top: 6px;";
      sectionTitleStyle = "font-size: 9.5pt; font-weight: 700; color: #9a3412; text-transform: uppercase; border-bottom: 1px solid #ffedd5; padding-bottom: 2px;";
      sectionDividerStyle = "height: 0; display: none;";
      itemTitleStyle = "font-size: 10.5pt; font-weight: 700; color: #0a0a0a;";
      itemSubStyle = "font-size: 9pt; font-style: italic; color: #44403c;";
      itemDateStyle = "font-size: 8.5pt; color: #c2410c;";
      itemDescStyle = "font-size: 9pt; color: #57534e; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap;";
      break;
    case 'law':
      fontStack = "Georgia, 'Times New Roman', serif"; bgColor = "#fff"; textColor = "#1c1917";
      headerStyle = "text-align: center; border-bottom: 4px double #064e3b; padding-bottom: 12px; margin-bottom: 16px;";
      nameStyle = "font-size: 22pt; font-weight: 700; color: #064e3b; margin: 0; text-align: center;";
      taglineStyle = "font-size: 10pt; color: #78716c; text-align: center; margin-top: 3px;";
      contactStyle = "display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; color: #78716c; font-size: 8pt; margin-top: 6px;";
      sectionTitleStyle = "font-size: 9.5pt; font-weight: 700; text-transform: uppercase; color: #064e3b;";
      sectionDividerStyle = "height: 1px; background: #064e3b; margin-bottom: 10px;";
      itemTitleStyle = "font-size: 10.5pt; font-weight: 700; color: #0f291e;";
      itemSubStyle = "font-size: 9pt; font-style: italic; color: #292524;";
      itemDateStyle = "font-size: 8.5pt; color: #064e3b;";
      itemDescStyle = "font-size: 9pt; color: #44403c; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap;";
      break;
    case 'marketing':
      fontImport = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap";
      fontStack = "'Outfit', 'Inter', sans-serif"; bgColor = "#fff"; textColor = "#262626";
      headerStyle = "border-left: 4px solid #ec4899; padding-left: 16px; margin-bottom: 16px;";
      nameStyle = "font-size: 22pt; font-weight: 800; text-transform: uppercase; color: #9d174d; margin: 0;";
      taglineStyle = "font-size: 10pt; color: #be185d; font-weight: 600; margin-top: 3px;";
      contactStyle = "display: flex; flex-wrap: wrap; gap: 12px; color: #737373; font-size: 8pt; margin-top: 6px;";
      sectionTitleStyle = "font-size: 9.5pt; font-weight: 700; color: #9d174d; text-transform: uppercase; border-bottom: 1px solid #fce7f3; padding-bottom: 2px;";
      sectionDividerStyle = "height: 0; display: none;";
      itemTitleStyle = "font-size: 10.5pt; font-weight: 700; color: #831843;";
      itemSubStyle = "font-size: 9pt; font-style: italic; color: #404040;";
      itemDateStyle = "font-size: 8.5pt; color: #be185d; font-weight: 700;";
      itemDescStyle = "font-size: 9pt; color: #525252; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap;";
      break;
    case 'sales':
      fontStack = "'Inter', sans-serif"; bgColor = "#fff"; textColor = "#262626";
      headerStyle = "border-bottom: 1px solid #f59e0b; padding-bottom: 12px; margin-bottom: 16px;";
      nameStyle = "font-size: 22pt; font-weight: 700; color: #171717; margin: 0;";
      taglineStyle = "font-size: 10pt; color: #b45309; font-weight: 500; margin-top: 3px;";
      contactStyle = "display: flex; flex-wrap: wrap; gap: 12px; color: #737373; font-size: 8pt; margin-top: 6px;";
      sectionTitleStyle = "font-size: 9.5pt; font-weight: 700; color: #171717; text-transform: uppercase; border-bottom: 2px solid #d97706; padding-bottom: 2px;";
      sectionDividerStyle = "height: 0; display: none;";
      itemTitleStyle = "font-size: 10.5pt; font-weight: 700; color: #171717;";
      itemSubStyle = "font-size: 9pt; font-style: italic; color: #404040;";
      itemDateStyle = "font-size: 8.5pt; color: #b45309; font-weight: 700;";
      itemDescStyle = "font-size: 9pt; color: #525252; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap;";
      break;
    case 'minimal_editorial':
      fontStack = "'Inter', sans-serif"; bgColor = "#fff"; textColor = "#0a0a0a";
      headerStyle = "border-bottom: 4px solid #0a0a0a; padding-bottom: 12px; margin-bottom: 16px;";
      nameStyle = "font-size: 24pt; font-weight: 900; text-transform: uppercase; color: #0a0a0a; margin: 0; letter-spacing: -0.03em; line-height: 1;";
      taglineStyle = "font-size: 10pt; color: #262626; font-weight: 700; margin-top: 3px;";
      contactStyle = "display: flex; flex-wrap: wrap; gap: 12px; color: #525252; font-size: 8pt; margin-top: 6px;";
      sectionTitleStyle = "font-size: 10pt; font-weight: 900; color: #0a0a0a; text-transform: uppercase;";
      sectionDividerStyle = "height: 4px; background: #0a0a0a; margin-bottom: 10px;";
      itemTitleStyle = "font-size: 10pt; font-weight: 900; color: #0a0a0a;";
      itemSubStyle = "font-size: 9pt; font-weight: 600; color: #404040;";
      itemDateStyle = "font-size: 8.5pt; color: #0a0a0a; font-weight: 700;";
      itemDescStyle = "font-size: 9pt; color: #404040; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap; border-left: 2px solid #e5e5e5; padding-left: 10px;";
      break;
    case 'luxury':
      fontImport = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap";
      fontStack = "'Playfair Display', Georgia, serif"; bgColor = "#fafaf9"; textColor = "#44403c";
      headerStyle = "text-align: center; border-bottom: 1px solid #7c2d12; padding-bottom: 12px; margin-bottom: 16px;";
      nameStyle = "font-size: 22pt; font-weight: 400; text-transform: uppercase; letter-spacing: 0.1em; color: #4c0519; margin: 0; text-align: center;";
      taglineStyle = "font-size: 10pt; color: #78716c; font-style: italic; text-align: center; margin-top: 4px;";
      contactStyle = "display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; color: #78716c; font-size: 8pt; margin-top: 6px;";
      sectionTitleStyle = "font-size: 10pt; font-weight: 700; color: #4c0519; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #9f1239; padding-bottom: 2px;";
      sectionDividerStyle = "height: 0; display: none;";
      itemTitleStyle = "font-size: 10pt; font-weight: 700; color: #1c1917;";
      itemSubStyle = "font-size: 9pt; font-style: italic; color: #44403c;";
      itemDateStyle = "font-size: 8.5pt; color: #4c0519; font-weight: 600;";
      itemDescStyle = "font-size: 9pt; color: #57534e; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap;";
      break;
    case 'startup':
      fontStack = "'Inter', sans-serif"; bgColor = "#fff"; textColor = "#334155";
      headerStyle = "border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 16px;";
      nameStyle = "font-size: 22pt; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.02em;";
      taglineStyle = "font-size: 10pt; color: #4f46e5; font-weight: 700; margin-top: 3px;";
      contactStyle = "display: flex; flex-wrap: wrap; gap: 12px; color: #64748b; font-size: 8pt; margin-top: 6px;";
      sectionTitleStyle = "font-size: 9.5pt; font-weight: 800; color: #0f172a; text-transform: uppercase; border-left: 4px solid #6366f1; padding-left: 8px;";
      sectionDividerStyle = "height: 1px; background: #f1f5f9; margin-bottom: 10px;";
      itemTitleStyle = "font-size: 10.5pt; font-weight: 700; color: #0f172a;";
      itemSubStyle = "font-size: 9pt; font-weight: 600; color: #4f46e5;";
      itemDateStyle = "font-size: 8.5pt; color: #64748b;";
      itemDescStyle = "font-size: 9pt; color: #475569; margin: 4px 0 0 0; line-height: 1.5; white-space: pre-wrap; background: #f8fafc; padding: 8px; border: 1px solid #f1f5f9; border-radius: 3px;";
      break;
  }

  const esc = (str: string) =>
    (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const contactItems = [
    content.personalInfo?.email,
    content.personalInfo?.phone,
    content.personalInfo?.location,
    content.personalInfo?.website,
  ]
    .filter(Boolean)
    .map((item) => `<span>${esc(item)}</span>`)
    .join(" &nbsp;&middot;&nbsp; ");

  let body = `
    <div style="${headerStyle}">
      <div>
        <div style="${nameStyle}">${esc(content.personalInfo?.firstName || "Your")} ${esc(content.personalInfo?.lastName || "Name")}</div>
        ${content.personalInfo?.title ? `<div style="${taglineStyle}">${esc(content.personalInfo.title)}</div>` : ""}
        <div style="${contactStyle}">${contactItems}</div>
      </div>
    </div>
  `;

  if (content.summary) {
    body += `<div style="${sectionHeaderStyle}">
      <div style="${sectionTitleStyle}">Professional Summary</div>
      <div style="${sectionDividerStyle}"></div>
      <p style="${itemDescStyle}">${esc(content.summary)}</p>
    </div>`;
  }

  if (content.experience && content.experience.length > 0) {
    body += `<div style="${sectionHeaderStyle}"><div style="${sectionTitleStyle}">Experience</div><div style="${sectionDividerStyle}"></div>`;
    content.experience.forEach((exp: any) => {
      const parts = [exp.startDate, exp.current ? "Present" : exp.endDate].filter(Boolean);
      const dateRange = parts.join(" - ");
      body += `<div style="${itemBlockStyle}">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 4px;">
          <div style="${itemTitleStyle}">${esc(exp.position)}</div>
          <div style="${itemDateStyle}">${esc(dateRange)}</div>
        </div>
        <div style="${itemSubStyle}">${esc(exp.company)}${exp.location ? " &nbsp;|&nbsp; " + esc(exp.location) : ""}</div>
        ${exp.description ? `<div style="${itemDescStyle}">${esc(exp.description)}</div>` : ""}
      </div>`;
    });
    body += `</div>`;
  }

  if (content.education && content.education.length > 0) {
    body += `<div style="${sectionHeaderStyle}"><div style="${sectionTitleStyle}">Education</div><div style="${sectionDividerStyle}"></div>`;
    content.education.forEach((edu: any) => {
      body += `<div style="${itemBlockStyle}">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 4px;">
          <div style="${itemTitleStyle}">${esc(edu.institution)}</div>
          <div style="${itemDateStyle}">${esc(edu.graduationDate || "")}</div>
        </div>
        <div style="${itemSubStyle}">${esc(edu.degree)}${edu.fieldOfStudy ? " in " + esc(edu.fieldOfStudy) : ""}${edu.gpa ? " &nbsp;— GPA: " + esc(edu.gpa) : ""}</div>
        ${edu.description ? `<div style="${itemDescStyle}">${esc(edu.description)}</div>` : ""}
      </div>`;
    });
    body += `</div>`;
  }

  if (content.skills && content.skills.length > 0) {
    body += `<div style="${sectionHeaderStyle}"><div style="${sectionTitleStyle}">Skills</div><div style="${sectionDividerStyle}"></div>
      <div style="${skillsWrapperStyle}">`;
    content.skills.forEach((skill: any) => {
      body += `<div style="page-break-inside: avoid; break-inside: avoid; margin-bottom: 4px;">
        <span style="${skillCategoryStyle}">${esc(skill.category)}: </span>
        <span style="${skillItemStyle}">${skill.items.map((i: string) => esc(i)).join(", ")}</span>
      </div>`;
    });
    body += `</div></div>`;
  }

  if (content.projects && content.projects.length > 0) {
    body += `<div style="${sectionHeaderStyle}"><div style="${sectionTitleStyle}">Projects</div><div style="${sectionDividerStyle}"></div>`;
    content.projects.forEach((proj: any) => {
      body += `<div style="${itemBlockStyle}">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 4px;">
          <div style="${itemTitleStyle}">${esc(proj.name)}</div>
          ${proj.url ? `<div style="${itemDateStyle}">${esc(proj.url)}</div>` : ""}
        </div>
        ${proj.technologies && proj.technologies.length > 0 ? `<div style="${itemSubStyle}">${proj.technologies.map((t: string) => esc(t)).join(" · ")}</div>` : ""}
        ${proj.description ? `<div style="${itemDescStyle}">${esc(proj.description)}</div>` : ""}
      </div>`;
    });
    body += `</div>`;
  }

  if (content.certifications && content.certifications.length > 0) {
    body += `<div style="${sectionHeaderStyle}"><div style="${sectionTitleStyle}">Certifications</div><div style="${sectionDividerStyle}"></div>`;
    content.certifications.forEach((cert: any) => {
      body += `<div style="${itemBlockStyle}">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 4px;">
          <div style="${itemTitleStyle}">${esc(cert.name)}</div>
          <div style="${itemDateStyle}">${esc(cert.date || "")}</div>
        </div>
        <div style="${itemSubStyle}">${esc(cert.issuer || "")}</div>
      </div>`;
    });
    body += `</div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Resume</title>
  <link href="${fontImport}" rel="stylesheet" />
  <style>
    @page {
      size: ${pageWidth} ${pageHeight};
      margin: ${marginVal};
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: ${bgColor};
      color: ${textColor};
      font-family: ${fontStack};
      font-size: 10pt;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    @media print {
      html, body { width: ${pageWidth}; background: ${bgColor}; }
    }
  </style>
</head>
<body>
  <div style="width: 100%;">${body}</div>
</body>
</html>`;
};
