import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

export async function GET() {
  const document = await PDFDocument.create();
  let page = document.addPage([595.28, 841.89]);
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const margin = 54;
  let y = 786;

  const addPageIfNeeded = () => {
    if (y > 75) return;
    page = document.addPage([595.28, 841.89]);
    y = 786;
  };
  const line = (text: string, size = 10, isBold = false, indent = 0) => {
    addPageIfNeeded();
    page.drawText(text, { x: margin + indent, y, size, font: isBold ? bold : regular, color: rgb(0.09, 0.09, 0.09) });
    y -= size + 6;
  };
  const wrap = (text: string, max = 88) => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      if (`${current} ${word}`.trim().length > max) { lines.push(current); current = word; } else current = `${current} ${word}`.trim();
    }
    if (current) lines.push(current);
    return lines;
  };
  const section = (title: string) => {
    y -= 8;
    page.drawLine({ start: { x: margin, y: y + 9 }, end: { x: 541, y: y + 9 }, thickness: 0.6, color: rgb(0.75, 0.75, 0.75) });
    line(title, 9, true);
  };

  line("DIEGO SILVA", 19, true);
  line("DESENVOLVEDOR FRONTEND", 11, true);
  line("Recife, PE | +55 81 99999-9999 | portfolio.example.com | github.com/exemplo", 8);
  section("RESUMO PROFISSIONAL");
  wrap("Desenvolvedor frontend com experiência na construção de aplicações React e Next.js acessíveis, responsivas e orientadas a produto. Atua com TypeScript, integração de APIs REST e colaboração próxima com design.").forEach((value) => line(value, 9));
  section("COMPETÊNCIAS");
  wrap("React | TypeScript | Next.js | Node.js | PostgreSQL | Tailwind CSS | Git | REST API | Testing Library").forEach((value) => line(value, 9));
  section("EXPERIÊNCIA");
  line("Desenvolvedor Frontend | Studio Digital | 2024 - Atual", 9, true);
  wrap("Desenvolvimento de aplicações React e Next.js, colaboração com design e integração com APIs REST.").forEach((value) => line(value, 9));
  section("PROJETOS");
  line("Plataforma de oportunidades", 9, true);
  wrap("Aplicação web modular desenvolvida com Next.js, TypeScript e PostgreSQL.").forEach((value) => line(value, 9));
  section("FORMAÇÃO");
  line("Análise e Desenvolvimento de Sistemas | Faculdade de Tecnologia", 9, true);

  const bytes = await document.save();
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=curriculo-diego-silva-nimbus.pdf",
      "Cache-Control": "no-store",
    },
  });
}
