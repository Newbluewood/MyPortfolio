import { cvPageUrl, launchCvPdfBrowser } from "@/lib/cv-pdf-browser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  let browser;
  try {
    browser = await launchCvPdfBrowser();
    const page = await browser.newPage();
    await page.goto(cvPageUrl(request), {
      waitUntil: "networkidle0",
      timeout: 45_000,
    });
    await page.emulateMediaType("print");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "5mm", right: "8mm", bottom: "5mm", left: "8mm" },
    });

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Nebojsa-Simovic-CV.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF export failed";
    const status = message === "CV_PDF_NO_BROWSER" ? 503 : 500;
    return Response.json(
      {
        error:
          message === "CV_PDF_NO_BROWSER"
            ? "PDF browser not available on this machine. Use Print → Save as PDF instead."
            : "Could not generate CV PDF.",
      },
      { status },
    );
  } finally {
    await browser?.close().catch(() => undefined);
  }
}
