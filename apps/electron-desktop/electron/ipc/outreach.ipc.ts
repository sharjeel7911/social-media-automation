// ============================================================================
// WHAT IS THIS FILE?
// This file handles the "Generate outreach" button. When you click it on
// a lead, this code sends that lead's details (company, job title, etc.)
// to Claude (the AI) and asks it to write a short introduction email,
// then sends that email text back to the on-screen app to display.
//
// This has to happen in the background code (not the on-screen app)
// because it needs your secret AI API key to work, and secret keys should
// never be placed anywhere the on-screen app (or a curious user peeking
// at the app's inner workings) could read them.
// ============================================================================

import { ipcMain } from "electron";
import axios from "axios";
// ^ A popular, easy-to-use tool for sending requests to other websites/
//   services over the internet — here, we use it to talk to Anthropic's
//   AI service.

import type { Lead } from "../../modules/leads/types/job.js";

interface OutreachResult {
  // The shape of what we send back once we're done (or if something failed).
  ok: boolean;
  text?: string;
  error?: string;
}

function buildPrompt(lead: Lead): string {
  // Builds the actual instructions we send to the AI, filling in this
  // specific lead's details. A "prompt" is just the technical word for
  // "the question/instructions you give an AI."
  return `You are drafting a short, warm cold-outreach email from a sales rep at a company that sells an AI virtual receptionist product. It is addressed to a company that just posted this job opening, which signals they are hiring for the role and may be a good fit for an AI alternative:

Company: ${lead.company_name}
Job posting title: ${lead.job_title}
Location: ${lead.location ?? "unknown"}
Industry: ${lead.industry ?? "unknown"}
Posted: ${lead.date_posted ? lead.date_posted.slice(0, 10) : "unknown"}

Write a 3-4 sentence email. Open with "Hi ${lead.company_name}," on its own line. Reference the specific job posting naturally, briefly explain the AI receptionist angle, and end with a low-pressure call to action (like a 15-minute call). No subject line, no signature block, no placeholders in brackets. Plain text only.`;
  // ^ The "${...}" bits are called template placeholders — they get
  //   swapped out for the lead's real company name, job title, etc.
  //   before this text is sent anywhere.
}

export function registerOutreachIpc(): void {
  // Turns on the listener for outreach-generation requests.

  ipcMain.handle("leads:generateOutreach", async (_event, lead: Lead): Promise<OutreachResult> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    // ^ Reads your secret AI key from the .env file (loaded earlier, in main.ts).

    if (!apiKey) {
      // If there's no key set up at all, don't even try — just explain
      // what's missing so it's easy to fix.
      return { ok: false, error: "No ANTHROPIC_API_KEY found. Add one to your .env file (see .env.example)." };
    }

    try {
      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        // ^ The web address of Anthropic's AI service.
        {
          model: "claude-sonnet-4-6",
          // ^ Which "version" of Claude to use.
          max_tokens: 1000,
          // ^ A rough cap on how long the AI's reply is allowed to be.
          messages: [{ role: "user", content: buildPrompt(lead) }],
          // ^ The actual instructions we're sending, built just above.
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            // ^ This is how the AI service knows this request is really
            //   from us (and allowed to use our account/billing).
            "anthropic-version": "2023-06-01",
            // ^ Which version of Anthropic's API rules we're following.
          },
        }
      );

      const content = response.data?.content as Array<{ text?: string }> | undefined;
      // ^ Digs into the AI's reply to find the actual written text inside it.

      const text = (content ?? []).map((b) => b.text ?? "").join("\n").trim();
      // ^ Joins all the pieces of text the AI sent back into one clean
      //   block, and trims off any stray blank space at the start/end.

      if (!text) return { ok: false, error: "Empty response from the model." };
      // ^ Just in case the AI somehow replied with nothing at all.

      return { ok: true, text };
      // Success! Hand the finished message back to the on-screen app.
    } catch (err) {
      // Something went wrong while talking to the AI service — figure out
      // the clearest possible explanation to show the user.
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const body = JSON.stringify(err.response?.data ?? {}).slice(0, 200);
        return { ok: false, error: `API error ${status ?? ""}: ${body}` };
      }
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  });
}
