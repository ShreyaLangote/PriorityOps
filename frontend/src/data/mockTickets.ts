export interface LegacyTicket {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "open" | "in-progress" | "pending" | "resolved" | "escalated";
  assignee: {
    name: string;
    avatar: string;
  };
  department: string;
  createdAt: string;
  sla: string;
  aiSuggestion?: string;
}

// Re-export the API Ticket type for consistency
export type { Ticket } from '@/types/api';

export const mockTickets: LegacyTicket[] = [
  {
    id: "PRT-2024-001",
    title: "Outlook cannot connect to server",
    description: "Multiple users in Marketing team unable to access Outlook",
    priority: "high",
    status: "in-progress",
    assignee: { name: "Sarah Martinez", avatar: "SM" },
    department: "Marketing Team",
    createdAt: "8 min ago",
    sla: "3h 52m",
    aiSuggestion: "Check Exchange server connectivity and verify user credentials"
  },
  {
    id: "PRT-2024-002",
    title: "Request Adobe Creative Suite license",
    description: "New designer needs Creative Cloud access",
    priority: "medium",
    status: "pending",
    assignee: { name: "Mike Chen", avatar: "MC" },
    department: "Design Department",
    createdAt: "22 min ago",
    sla: "1d 3h",
    aiSuggestion: "Verify budget approval and submit license request to Adobe portal"
  },
  {
    id: "PRT-2024-003",
    title: "WiFi connection drops frequently",
    description: "Conference Room B experiencing intermittent WiFi issues",
    priority: "medium",
    status: "open",
    assignee: { name: "David Wilson", avatar: "DW" },
    department: "Conference Room B",
    createdAt: "1h 5m ago",
    sla: "6h 55m",
    aiSuggestion: "Check access point firmware version and signal strength"
  },
  {
    id: "PRT-2024-004",
    title: "Cannot access shared drive",
    description: "Finance team cannot access Q4 reports folder",
    priority: "high",
    status: "escalated",
    assignee: { name: "Lisa Johnson", avatar: "LJ" },
    department: "Finance Department",
    createdAt: "1h 28m ago",
    sla: "2h 32m",
    aiSuggestion: "Verify Active Directory permissions and group membership"
  },
  {
    id: "PRT-2024-005",
    title: "New employee setup - laptop",
    description: "Provision laptop and accounts for new hire starting Monday",
    priority: "low",
    status: "resolved",
    assignee: { name: "Tom Rodriguez", avatar: "TR" },
    department: "HR Department",
    createdAt: "2h 15m ago",
    sla: "Completed",
    aiSuggestion: "Follow standard onboarding checklist"
  },
  {
    id: "PRT-2024-006",
    title: "Password reset for domain account",
    description: "User locked out after multiple failed login attempts",
    priority: "medium",
    status: "in-progress",
    assignee: { name: "Anna Kim", avatar: "AK" },
    department: "Sales Team",
    createdAt: "45 min ago",
    sla: "7h 15m",
    aiSuggestion: "Reset password via AD and enable MFA for account security"
  },
];
