import { Router, Request, Response } from "express";
import {
  requireAuth,
  createSuccessResponse,
  createErrorResponse,
  prisma,
} from "@openconnect/shared";

export const voiceContactRouter = Router();

// In-memory map of callId -> Twilio SID (hackathon workaround since we can't modify the Prisma schema)
const twilioSidMap = new Map<string, string>();

// Hardcoded hotlines always available to incarcerated individuals
const SYSTEM_HOTLINES = [
  {
    id: "hotline-crisis",
    type: "hotline" as const,
    name: "Crisis Hotline",
    phone: "+18002738255", // 988 Suicide & Crisis Lifeline
    description: "24/7 mental health crisis support",
    alwaysAvailable: true,
  },
  {
    id: "hotline-prea",
    type: "hotline" as const,
    name: "PREA Hotline",
    phone: "+18003727827", // National PREA Hotline
    description: "Report sexual abuse or harassment confidentially",
    alwaysAvailable: true,
  },
];

// ==========================================
// FAMILY MEMBER / LOVED ONE USER ENDPOINTS
// ==========================================

/**
 * GET /contacts — Approved contacts for the logged-in incarcerated person
 * Includes hardcoded system hotlines (Crisis, PREA) that are always available
 */
voiceContactRouter.get(
  "/contacts",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const contacts = await prisma.approvedContact.findMany({
        where: {
          familyMemberId: userId,
          status: "approved",
        },
        include: {
          familyMember: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
        orderBy: { requestedAt: "desc" },
      });

      // Combine system hotlines with user's approved contacts
      const allContacts = [
        ...SYSTEM_HOTLINES,
        ...contacts.map((c) => ({
          ...c,
          type: "contact" as const,
        })),
      ];

      res.json(createSuccessResponse(allContacts));
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json(
        createErrorResponse({
          code: "INTERNAL_ERROR",
          message: "Failed to fetch contacts",
        }),
      );
    }
  },
);

export default voiceContactRouter;
