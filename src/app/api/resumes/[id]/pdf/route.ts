import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { auth } from "@/auth";
import { isAtsResumeContent } from "@/lib/resume-content";
import { ResumeRepository } from "@/repositories/resume.repository";

export const runtime = "nodejs";

function pdfSafe(value: string) { return value.replace(/[—–•]/g, "-").replace(/[“”]/g, '"').replace(/[’]/g, "'"); }

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user.id) return new Response("Não autorizado.", { status: 401 });
  const { id } = await params;
  const row = await new ResumeRepository().findGenerated(session.user.id, id);
  if (!row || !isAtsResumeContent(row.content)) return new Response("Currículo não encontrado.", { status: 404 });
  const resume = row.content;

  const document = await PDFDocument.create();
  document.setTitle(`${resume.name} - ${resume.targetTitle}`);
  document.setAuthor(resume.name);
  document.setSubject(`Currículo direcionado para ${resume.targetTitle}`);
  document.setKeywords(resume.relevantRequirements);
  let page = document.addPage([595.28, 841.89]);
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const margin = 48;
  let y = 793;
  const addPageIfNeeded = (needed = 20) => { if (y >= margin + needed) return; page = document.addPage([595.28, 841.89]); y = 793; };
  const line = (text: string, size = 9, isBold = false) => { addPageIfNeeded(size + 8); page.drawText(pdfSafe(text), { x: margin, y, size, font: isBold ? bold : regular, color: rgb(0.08, 0.08, 0.08) }); y -= size + 5; };
  const wrap = (text: string, max = 96) => {
    const lines: string[] = [];
    for (const paragraph of text.split(/\r?\n/)) { let current = ""; for (const word of paragraph.split(/\s+/).filter(Boolean)) { if (`${current} ${word}`.trim().length > max) { if (current) lines.push(current); current = word; } else current = `${current} ${word}`.trim(); } if (current) lines.push(current); }
    return lines;
  };
  const section = (title: string) => { y -= 7; addPageIfNeeded(28); page.drawLine({ start: { x: margin, y: y + 7 }, end: { x: 547, y: y + 7 }, thickness: 0.6, color: rgb(0.7, 0.7, 0.7) }); line(title, 9, true); };

  line(resume.name.toUpperCase(), 18, true);
  line(resume.targetTitle.toUpperCase(), 10, true);
  wrap([resume.location, resume.phone, resume.email, resume.linkedinUrl, resume.githubUrl].filter(Boolean).join(" | "), 110).forEach((value) => line(value, 8));
  if (resume.summary) { section("RESUMO PROFISSIONAL"); wrap(resume.summary).forEach((value) => line(value)); }
  if (resume.relevantRequirements.length) { section("COMPETENCIAS ALINHADAS A VAGA"); wrap(resume.relevantRequirements.join(" | ")).forEach((value) => line(value)); }
  section("COMPETENCIAS"); wrap(resume.skills.map((item) => item.name).join(" | ")).forEach((value) => line(value));
  section("EXPERIENCIA PROFISSIONAL");
  for (const item of resume.experiences) { line(`${item.role} | ${item.company} | ${item.current ? "Atual" : "Periodo nao informado"}`, 9, true); wrap(item.description).forEach((value) => line(value)); y -= 3; }
  if (resume.projects.length) { section("PROJETOS"); for (const item of resume.projects) { line(item.name, 9, true); wrap(item.description).forEach((value) => line(value)); } }
  section("FORMACAO"); resume.education.forEach((item) => line(`${item.course} | ${item.institution}`));
  if (resume.certifications.length) { section("CERTIFICACOES"); resume.certifications.forEach((item) => line(`${item.name} | ${item.issuer}`)); }

  const bytes = await document.save();
  const filename = `curriculo-${resume.name}-${resume.targetTitle}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return new Response(Buffer.from(bytes), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename=${filename}.pdf`, "Cache-Control": "private, no-store" } });
}
