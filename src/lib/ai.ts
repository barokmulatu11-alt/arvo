export interface AIResponse {
  success: boolean;
  content: string;
  error?: string;
}

const SYSTEM_PROMPT = `
Act exclusively as an Elite Executive Recruiter and seasoned ATS (Applicant Tracking System) Optimizer.
Your job is to optimize the provided resume section or content.
Output content must perfectly integrate natural, high-impact action verbs and contextual industry keywords.
`;

export async function generateAIContent(
  prompt: string,
  expectedFormat: "text" | "json" = "text"
): Promise<AIResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY not found in environment. Using high-quality Recruiter Mock service.");
    return generateMockResponse(prompt, expectedFormat);
  }

  const formatConstraint = expectedFormat === "json"
    ? "FORMAT CRITICAL CONSTRAINT: You must return output EXCLUSIVELY as a strictly formatted, minified JSON object matching the exact requested structural schema. Do NOT wrap your response in markdown code blocks (e.g., do NOT output ```json ... ```), never provide conversational pleasantries, warnings, notes, or explanations. Return ONLY the raw JSON payload."
    : "FORMAT CRITICAL CONSTRAINT: You must return output EXCLUSIVELY as clean, plain text. Do NOT structure your response as JSON, do NOT wrap your response in markdown code blocks, and do NOT provide conversational pleasantries, warnings, or notes. Return ONLY the optimized text content.";

  const fullSystemPrompt = `${SYSTEM_PROMPT.trim()}\n\n${formatConstraint}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${fullSystemPrompt}\n\nTask:\n${prompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean any accidental markdown wraps from the LLM response
    text = text.trim();
    if (text.startsWith("```json")) {
      text = text.substring(7);
    } else if (text.startsWith("```")) {
      text = text.substring(3);
    }
    if (text.endsWith("```")) {
      text = text.substring(0, text.length - 3);
    }
    text = text.trim();

    return { success: true, content: text };
  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    return { 
      success: false, 
      content: "", 
      error: error.message || "Failed to communicate with AI model" 
    };
  }
}

// High-fidelity recruiter mock fallback for offline/no-API-key testing
function generateMockResponse(prompt: string, format: "text" | "json"): AIResponse {
  const lowerPrompt = prompt.toLowerCase();

  // 1. If it's a summary improvement task
  if (lowerPrompt.includes("summary") || lowerPrompt.includes("profile")) {
    if (format === "json") {
      return {
        success: true,
        content: JSON.stringify({
          summary: "Results-driven Senior Software Engineer with 6+ years of expertise architecting high-performance SaaS applications and leading cross-functional teams. Specialized in TypeScript, React, and serverless node environments. Proven track record of boosting system responsiveness by 40% and deploying robust CI/CD pipelines that slash delivery overhead by 25%."
        })
      };
    }
    return {
      success: true,
      content: "Results-driven Senior Software Engineer with 6+ years of expertise architecting high-performance SaaS applications and leading cross-functional teams. Specialized in TypeScript, React, and serverless node environments. Proven track record of boosting system responsiveness by 40% and deploying robust CI/CD pipelines that slash delivery overhead by 25%."
    };
  }

  // 2. If it's a work experience rewrite task
  if (lowerPrompt.includes("experience") || lowerPrompt.includes("work") || lowerPrompt.includes("job")) {
    const rewrittenExp = [
      {
        company: "Stripe",
        position: "Senior Backend Engineer",
        location: "San Francisco, CA",
        startDate: "2023-01",
        endDate: "Present",
        current: true,
        description: "• Spearheaded design and integration of Next-Gen global settlement pipelines, boosting transaction processing capacity by 35%.\n• Pioneered microservice refactoring using TypeScript and Node, cutting memory leaks and optimizing latency by 180ms.\n• Facilitated peer code reviews and mentored 4 junior engineers, boosting sprint velocity and deployment confidence across teams."
      }
    ];

    if (format === "json") {
      return {
        success: true,
        content: JSON.stringify(rewrittenExp)
      };
    }
    return {
      success: true,
      content: rewrittenExp[0].description
    };
  }

  // 3. If it's a skills optimization task
  if (lowerPrompt.includes("skills") || lowerPrompt.includes("technologies")) {
    const rewrittenSkills = [
      { category: "Languages", items: ["TypeScript", "JavaScript", "SQL", "HTML5/CSS3"] },
      { category: "Frameworks & Runtimes", items: ["React", "Next.js", "Node.js", "Express", "Tailwind CSS"] },
      { category: "Cloud & Databases", items: ["PostgreSQL", "Prisma", "AWS (S3, Lambda, EC2)", "Docker", "Git"] }
    ];

    if (format === "json") {
      return {
        success: true,
        content: JSON.stringify(rewrittenSkills)
      };
    }
    return {
      success: true,
      content: "TypeScript, JavaScript, React, Next.js, Node.js, SQL, PostgreSQL, AWS, Docker, Git"
    };
  }

  // 4. Job Tailoring assessment
  if (lowerPrompt.includes("tailor") || lowerPrompt.includes("job description")) {
    const assessment = {
      score: 85,
      matchedKeywords: ["TypeScript", "Next.js", "SaaS", "PostgreSQL", "Agile"],
      missingKeywords: ["GraphQL", "Kubernetes", "Redis", "Security compliance"],
      gapAnalysis: "The resume showcases excellent frontend design and standard backend architecture, but lacks direct details about GraphQL query management and containerized deployments in Kubernetes.",
      tailoredSummary: "Accomplished Full-Stack Engineer with 5+ years of experience constructing high-availability SaaS architectures. Expert in Next.js, TypeScript, and database optimizations. Adept at implementing secure REST/GraphQL services and configuring containerized environments.",
      suggestedChanges: [
        { section: "summary", action: "update", details: "Inject GraphQL and SaaS optimization keywords." },
        { section: "experience", action: "bulletpoint", details: "Add a bullet point under Stripe illustrating dockerization and container orchestration." }
      ]
    };

    return {
      success: true,
      content: JSON.stringify(assessment)
    };
  }

  // Default fallback text
  return {
    success: true,
    content: "Developed and launched highly scalable web applications, yielding a 25% improvement in processing latency. Implemented ATS-optimized design principles and consolidated repository services, increasing team velocity by 15%."
  };
}
