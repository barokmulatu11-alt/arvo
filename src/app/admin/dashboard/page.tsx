"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { 
  Users, FileText, Cpu, CreditCard, DollarSign, BarChart2, 
  HelpCircle, Shield, Settings, Trash2, Search, Sliders, 
  Menu, X, Check, RefreshCw, Eye, Download, AlertTriangle, 
  Calendar, FileSpreadsheet, ArrowLeft, ArrowUpRight, ArrowDownRight,
  UserCheck, AlertCircle, Receipt, Clock, CheckCircle2, XCircle, ZoomIn
} from "lucide-react";

// Mock Data representing a professional SaaS state (100,000+ scaling simulation)
const INITIAL_USERS = [
  { id: "usr_1a89c9", name: "Sarah Jenkins", email: "sarah.j@vercel.com", country: "US", plan: "PRO", status: "Active", regDate: "2026-05-12", lastActive: "2026-06-24", aiUsage: 142, resumes: 8, notes: "Verified enterprise user." },
  { id: "usr_2b78d2", name: "David Chen", email: "dchen@stripe.com", country: "CA", plan: "PRO", status: "Active", regDate: "2026-05-18", lastActive: "2026-06-24", aiUsage: 211, resumes: 12, notes: "Requested discount code previously." },
  { id: "usr_3c54f4", name: "Elena Rostova", email: "elena.r@yandex.ru", country: "RU", plan: "FREE", status: "Active", regDate: "2026-06-01", lastActive: "2026-06-23", aiUsage: 4, resumes: 1, notes: "" },
  { id: "usr_4d21e8", name: "Marcus Aurelius", email: "marcus@rome.org", country: "IT", plan: "PRO", status: "Suspended", regDate: "2026-04-20", lastActive: "2026-06-15", aiUsage: 95, resumes: 5, notes: "Suspended due to payment dispute." },
  { id: "usr_5e99a2", name: "Amina Yusuf", email: "amina.y@github.com", country: "NG", plan: "FREE", status: "Active", regDate: "2026-06-10", lastActive: "2026-06-24", aiUsage: 2, resumes: 2, notes: "" },
  { id: "usr_6f44x9", name: "Kenji Sato", email: "sato.kenji@sony.co.jp", country: "JP", plan: "PRO", status: "Active", regDate: "2026-02-15", lastActive: "2026-06-24", aiUsage: 310, resumes: 19, notes: "Power user. High AI usage." },
  { id: "usr_7g88w1", name: "Clara Oswald", email: "clara.os@tardis.co.uk", country: "UK", plan: "FREE", status: "Active", regDate: "2026-06-20", lastActive: "2026-06-22", aiUsage: 0, resumes: 0, notes: "" },
  { id: "usr_8h32m3", name: "Guillaume Dubois", email: "g.dubois@framer.com", country: "FR", plan: "PRO", status: "Active", regDate: "2026-03-30", lastActive: "2026-06-24", aiUsage: 189, resumes: 11, notes: "Wants invoices in Euro." },
];

const INITIAL_RESUMES = [
  { id: "res_889a", title: "Senior Full Stack Dev (2026)", owner: "Sarah Jenkins", ownerId: "usr_1a89c9", template: "Modern", creationDate: "2026-05-12", updateDate: "2026-06-24", downloads: 42, format: "PDF", flagged: false },
  { id: "res_902b", title: "Technical Project Lead - Stripe", owner: "David Chen", ownerId: "usr_2b78d2", template: "Minimal", creationDate: "2026-05-18", updateDate: "2026-06-24", downloads: 78, format: "PDF", flagged: false },
  { id: "res_344c", title: "Data Scientist Resume", owner: "Elena Rostova", ownerId: "usr_3c54f4", template: "Corporate", creationDate: "2026-06-01", updateDate: "2026-06-01", downloads: 3, format: "PDF", flagged: false },
  { id: "res_771d", title: "Graphic Designer", owner: "Sarah Jenkins", ownerId: "usr_1a89c9", template: "Creative", creationDate: "2026-05-15", updateDate: "2026-06-10", downloads: 15, format: "DOCX", flagged: true },
  { id: "res_122e", title: "Senior Solutions Architect", owner: "Kenji Sato", ownerId: "usr_6f44x9", template: "Tech", creationDate: "2026-02-15", updateDate: "2026-06-24", downloads: 120, format: "PDF", flagged: false },
];

const INITIAL_PAYMENTS = [
  { txId: "tx_908122", customer: "Sarah Jenkins", amount: 15.00, currency: "USD", method: "Stripe", status: "Succeeded", date: "2026-06-12" },
  { txId: "tx_776152", customer: "David Chen", amount: 150.00, currency: "USD", method: "PayPal", status: "Succeeded", date: "2026-05-18" },
  { txId: "tx_344120", customer: "Marcus Aurelius", amount: 15.00, currency: "USD", method: "Stripe", status: "Refunded", date: "2026-06-15" },
  { txId: "tx_112098", customer: "Kenji Sato", amount: 150.00, currency: "USD", method: "Apple Pay", status: "Succeeded", date: "2026-02-15" },
  { txId: "tx_655319", customer: "Guillaume Dubois", amount: 15.00, currency: "USD", method: "Stripe", status: "Failed", date: "2026-06-23" },
];

const INITIAL_TICKETS = [
  { id: "tkt_1", user: "Elena Rostova", priority: "High", status: "Open", category: "AI Output Quality", title: "AI prompt keeps throwing formatting errors in experience block", date: "2026-06-23", replies: [
    { sender: "user", text: "Whenever I try to optimize my experience section, it gives me a JSON parsing error." },
    { sender: "support", text: "Hello Elena, we are looking into the JSON constraints on our Gemini prompts." }
  ] },
  { id: "tkt_2", user: "David Chen", priority: "Medium", status: "Open", category: "Billing & Invoices", title: "Need custom corporate tax invoice", date: "2026-06-24", replies: [
    { sender: "user", text: "Hi, I need an official tax invoice with Stripe's company registration details." }
  ] },
  { id: "tkt_3", user: "Guillaume Dubois", priority: "Low", status: "Closed", category: "Template Bug", title: "Tech template printing overlaps margin", date: "2026-06-20", replies: [
    { sender: "user", text: "Fixed the margins by disabling the custom background." }
  ] },
];

const INITIAL_LOGS = [
  { id: "log_1", admin: "SuperAdmin", action: "Impersonated User (Sarah Jenkins)", severity: "Low", ip: "192.168.1.55", date: "2026-06-24 10:14" },
  { id: "log_2", admin: "System", action: "Reset Free Tier AI Quotas", severity: "Info", ip: "127.0.0.1", date: "2026-06-24 00:00" },
  { id: "log_3", admin: "FinanceAdmin", action: "Refunded Transaction tx_344120", severity: "Medium", ip: "192.168.1.99", date: "2026-06-15 14:22" },
  { id: "log_4", admin: "SuperAdmin", action: "Suspended User usr_4d21e8", severity: "High", ip: "192.168.1.55", date: "2026-06-15 14:15" },
];

export default function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // States for CRUD
  const [users, setUsers] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: "0",
    premiumSubscribers: "0",
    totalResumes: "0",
    aiRequestsToday: "0"
  });
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [resumeSearch, setResumeSearch] = useState("");
  const [paymentSearch, setPaymentSearch] = useState("");

  // Modals/Actions
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("20");
  const [coupons, setCoupons] = useState([
    { code: "BAROK30", discount: "30%", active: true },
    { code: "STARTUP50", discount: "50%", active: true }
  ]);

  // System Settings State
  const [settingsState, setSettingsState] = useState({
    platformName: "Arvo",
    defaultModel: "gemini-flash-lite-latest",
    maxFreeAi: "5",
    pricingMonthly: "199",
    pricingAnnual: "1990",
    maintenanceMode: false
  });

  // Ticket detail reply state
  const [replyText, setReplyText] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Impersonating simulation
  const [impersonatingUser, setImpersonatingUser] = useState<string | null>(null);

  // Bulk operation selection
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Payment Requests state
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedPaymentRequest, setSelectedPaymentRequest] = useState<any | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [screenshotZoom, setScreenshotZoom] = useState(false);

  const loadPaymentRequests = async () => {
    try {
      const res = await fetch("/api/admin/payment-requests");
      const data = await res.json();
      if (data.success) {
        setPaymentRequests(data.requests || []);
        setPendingCount(data.pendingCount || 0);
      }
    } catch (err) {
      console.error("Failed to load payment requests", err);
    }
  };

  const handleReviewPayment = async (requestId: string, action: "APPROVE" | "REJECT") => {
    setIsReviewing(true);
    try {
      const res = await fetch("/api/admin/payment-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action, adminNote: rejectNote || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        toast(action === "APPROVE" ? "User upgraded to Pro!" : "Payment rejected", action === "APPROVE" ? "success" : "info");
        setSelectedPaymentRequest(null);
        setRejectNote("");
        loadPaymentRequests();
      } else {
        toast(data.error || "Action failed", "error");
      }
    } catch (err: any) {
      toast(err.message || "Action failed", "error");
    } finally {
      setIsReviewing(false);
    }
  };

  const loadAdminData = async () => {
    try {
      const res = await fetch("/api/admin/data");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setResumes(data.resumes || []);
        setPayments(data.payments || []);
        setTickets(data.tickets || []);
        setLogs(data.logs || []);
        setStats({
          totalUsers: String(data.stats.totalUsers),
          premiumSubscribers: String(data.stats.premiumSubscribers),
          totalResumes: String(data.stats.totalResumes),
          aiRequestsToday: String(data.stats.aiRequestsToday)
        });
      }
    } catch (err) {
      console.error("Failed to load admin metrics", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadAdminData();
    loadPaymentRequests();
  }, []);

  // User status updates
  const handleUserStatus = async (userId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateUser", userId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, status: newStatus });
        }
        toast(`User status updated to ${newStatus}`, "success");
        // Log action
        const newLog = {
          id: "log_" + Date.now(),
          admin: "SuperAdmin",
          action: `${newStatus} User ${userId}`,
          severity: newStatus === "Suspended" ? "High" : "Medium",
          ip: "192.168.1.55",
          date: new Date().toISOString().replace("T", " ").substring(0, 16)
        };
        setLogs([newLog, ...logs]);
      } else {
        toast(`Failed to update status: ${data.error}`, "error");
      }
    } catch (err: any) {
      toast(`Error updating status: ${err.message}`, "error");
    }
  };

  const handleGrantPremium = async (userId: string, isPremium: boolean) => {
    try {
      const newPlan = isPremium ? "PRO" : "FREE";
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateUser", userId, plan: newPlan }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, plan: newPlan });
        }
        toast(`Plan updated to ${newPlan}`, "success");
      } else {
        toast(`Failed to update plan: ${data.error}`, "error");
      }
    } catch (err: any) {
      toast(`Error updating plan: ${err.message}`, "error");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/data?userId=${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u.id !== userId));
        setSelectedUser(null);
        toast("User deleted successfully", "success");
      } else {
        toast(`Failed to delete user: ${data.error}`, "error");
      }
    } catch (err: any) {
      toast(`Error deleting user: ${err.message}`, "error");
    }
  };

  // Add Coupon
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    setCoupons([{ code: newCouponCode.toUpperCase(), discount: `${newCouponDiscount}%`, active: true }, ...coupons]);
    setNewCouponCode("");
  };

  // Toggle Coupon Active Status
  const toggleCoupon = (code: string) => {
    setCoupons(coupons.map(c => c.code === code ? { ...c, active: !c.active } : c));
  };

  // Handle support ticket reply
  const handleTicketReply = (ticketId: string) => {
    if (!replyText.trim()) return;
    setTickets(tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          replies: [...t.replies, { sender: "support", text: replyText }]
        };
      }
      return t;
    }));
    setReplyText("");
  };

  // Export report simulation
  const handleExportReport = (reportType: string, format: string) => {
    alert(`Generating ${reportType} report as ${format.toUpperCase()}. Preparing payload download...`);
  };

  // Sidebar components
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart2 },
    { id: "users", label: "Users", icon: Users },
    { id: "resumes", label: "Resumes", icon: FileText },
    { id: "ai-usage", label: "AI Usage & Tailor", icon: Cpu },
    { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
    { id: "payment-requests", label: "Payment Requests", icon: Receipt, badge: pendingCount },
    { id: "payments", label: "Payments", icon: DollarSign },
    { id: "reports", label: "Reports", icon: FileSpreadsheet },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "support", label: "Support Tickets", icon: HelpCircle },
    { id: "activity", label: "Activity Logs", icon: Shield },
    { id: "settings", label: "System Settings", icon: Settings },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-white font-sans text-neutral-900 antialiased">
      {/* Impersonation Banner */}
      {impersonatingUser && (
        <div className="absolute top-0 left-0 right-0 h-8 bg-neutral-950 text-white text-[10px] font-mono font-bold flex items-center justify-between px-6 z-50">
          <span>⚠️ IMPERSONATING ACCOUNT: {impersonatingUser}</span>
          <button 
            onClick={() => setImpersonatingUser(null)} 
            className="px-2 py-0.5 border border-white rounded-[4px] hover:bg-white hover:text-black transition-colors"
          >
            END SESSION
          </button>
        </div>
      )}

      {/* LEFT SIDEBAR */}
      <aside className={`${sidebarOpen ? "w-56" : "w-0"} shrink-0 border-r border-neutral-200 bg-white flex flex-col justify-between transition-all duration-150 z-40 overflow-hidden`}>
        <div className="flex flex-col gap-5 p-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-[4px] bg-neutral-900 flex items-center justify-center">
                <span className="font-mono text-[10px] font-bold text-white">R</span>
              </div>
              <span className="font-bold text-xs tracking-widest text-neutral-950 font-mono uppercase">
                Admin Console
              </span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-neutral-400 hover:text-neutral-900">
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex flex-col gap-0.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSelectedUser(null);
                    setSelectedTicketId(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-[6px] text-left text-xs font-medium transition-colors ${
                    isActive 
                      ? "bg-neutral-900 text-white font-semibold" 
                      : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="flex-1">{item.label}</span>
                  {(item as any).badge > 0 && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-white text-neutral-900" : "bg-red-500 text-white"
                    }`}>
                      {(item as any).badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-neutral-100 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-neutral-100 border border-neutral-250 flex items-center justify-center text-[10px] font-bold font-mono">
              SA
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-neutral-900 truncate">Super Admin</span>
              <span className="text-[8px] text-neutral-450 font-mono truncate">admin@barok.io</span>
            </div>
          </div>
          <Link
            href="/admin"
            className="w-full text-center py-1 border border-neutral-200 rounded-[4px] text-[10px] font-mono font-bold hover:bg-neutral-50 transition-colors mt-2"
          >
            LOG OUT
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-neutral-50 overflow-hidden">
        {/* TOP NAV BAR */}
        <header className="h-12 border-b border-neutral-200 bg-white flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-neutral-100 rounded-[4px] text-neutral-500 hover:text-neutral-900"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-neutral-200"></div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Global Search (Users, Payments, Logs)..."
                className="pl-8 pr-4 py-1 text-xs border border-neutral-200 rounded-[6px] w-64 focus:outline-none focus:border-neutral-900 bg-neutral-50/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* System Status Indicator */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-neutral-100 rounded-[4px] border border-neutral-200 text-[10px] font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-950 animate-pulse"></span>
              API OK
            </div>
            
            {/* Direct Back to App */}
            <Link 
              href="/dashboard" 
              className="text-[10px] font-bold text-neutral-900 hover:text-black uppercase tracking-wider font-mono flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Dashboard
            </Link>
          </div>
        </header>

        {/* CONTAINER VIEWPORTS */}
        <main className={`flex-1 overflow-y-auto p-8 ${impersonatingUser ? "pt-12" : "pt-8"}`}>
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fade-in">
              {/* Heading */}
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">Platform Overview</h1>
                <p className="text-xs text-neutral-500 mt-1">Real-time status updates and operational metrics for Arvo.</p>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Users", val: stats.totalUsers, chg: "+14%", pos: true },
                  { label: "Monthly Revenue", val: `$${(Number(stats.premiumSubscribers) * 12).toLocaleString()}`, chg: "+22%", pos: true },
                  { label: "Premium Subscribers", val: stats.premiumSubscribers, chg: "+8%", pos: true },
                  { label: "AI Requests (Today)", val: stats.aiRequestsToday, chg: "-4%", pos: false },
                  { label: "Total Resumes Created", val: stats.totalResumes, chg: "+19%", pos: true },
                  { label: "PDF Exports", val: String(Math.floor(Number(stats.totalResumes) * 0.8)), chg: "+24%", pos: true },
                  { label: "Failed AI Requests", val: "0", chg: "-100%", pos: true },
                  { label: "Open Support Tickets", val: String(tickets.length), chg: "+0", pos: true },
                ].map((kpi, idx) => (
                  <div key={idx} className="bg-white border border-neutral-200 rounded-[6px] p-4 flex flex-col justify-between">
                    <span className="text-[10px] font-mono font-bold text-neutral-450 uppercase tracking-wider">{kpi.label}</span>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-lg font-bold text-neutral-950">{kpi.val}</span>
                      <span className={`text-[10px] font-bold ${kpi.pos ? "text-neutral-900" : "text-red-700"}`}>
                        {kpi.chg}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Revenue Graph */}
              <div className="bg-white border border-neutral-200 rounded-[6px] p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-500">Revenue Growth Chart</h3>
                    <span className="text-lg font-bold text-neutral-950 mt-1 block">$8,912 Monthly Recurrent Revenue</span>
                  </div>
                  <div className="flex border border-neutral-200 rounded-[6px] overflow-hidden text-xs">
                    <button className="px-3 py-1 bg-neutral-900 text-white font-medium">Monthly</button>
                    <button className="px-3 py-1 hover:bg-neutral-50 font-medium">Weekly</button>
                    <button className="px-3 py-1 hover:bg-neutral-50 font-medium">Daily</button>
                  </div>
                </div>

                {/* SVG Mock Line Graph */}
                <div className="w-full h-48 bg-neutral-50 rounded-[4px] border border-neutral-200/50 flex items-center justify-center relative">
                  <svg className="w-full h-full px-4" viewBox="0 0 800 200">
                    {/* Grid lines */}
                    <line x1="0" y1="150" x2="800" y2="150" stroke="#f0f0f0" strokeWidth="1" />
                    <line x1="0" y1="100" x2="800" y2="100" stroke="#f0f0f0" strokeWidth="1" />
                    <line x1="0" y1="50" x2="800" y2="50" stroke="#f0f0f0" strokeWidth="1" />
                    
                    {/* Plot Line */}
                    <path 
                      d="M 50 160 L 150 140 L 250 130 L 350 90 L 450 110 L 550 70 L 650 60 L 750 40" 
                      fill="none" 
                      stroke="#111111" 
                      strokeWidth="2" 
                    />
                    
                    {/* Points */}
                    {[50, 150, 250, 350, 450, 550, 650, 750].map((x, i) => {
                      const y = [160, 140, 130, 90, 110, 70, 60, 40][i];
                      return <circle key={i} cx={x} cy={y} r="3" fill="#111111" />;
                    })}
                  </svg>
                  <div className="absolute bottom-2 left-6 text-[8px] font-mono text-neutral-400">Nov 2025</div>
                  <div className="absolute bottom-2 right-6 text-[8px] font-mono text-neutral-400">Jun 2026</div>
                </div>
              </div>

              {/* Lower Section: User Growth & Activity Feed */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* User Growth Stats */}
                <div className="md:col-span-5 bg-white border border-neutral-200 rounded-[6px] p-6 space-y-4">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-500">Retention & Churn</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Returning User Rate</span>
                        <span className="font-bold">78%</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-neutral-900" style={{ width: "78%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Premium Upgrade conversion</span>
                        <span className="font-bold">3.2%</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-neutral-900" style={{ width: "3.2%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Average Churn rate</span>
                        <span className="font-bold text-red-700">1.8%</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-red-900" style={{ width: "1.8%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="md:col-span-7 bg-white border border-neutral-200 rounded-[6px] p-6 space-y-4">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-500">Live Activity Feed</h3>
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {[
                        { text: "Sarah Jenkins upgraded to PRO plan", time: "2 min ago", type: "upgrade" },
                        { text: "Payment of $150.00 received from Kenji Sato", time: "1 hr ago", type: "payment" },
                        { text: "AI Resume Optimization requested by Amina Yusuf", time: "2 hr ago", type: "ai" },
                        { text: "Failed PDF Export detected for Elena Rostova", time: "4 hr ago", type: "error" },
                      ].map((act, actIdx) => (
                        <li key={actIdx}>
                          <div className="relative pb-8">
                            {actIdx !== 3 ? <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-neutral-100" aria-hidden="true" /> : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full border border-neutral-200 bg-neutral-50 flex items-center justify-center">
                                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                                </span>
                              </div>
                              <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                                <p className="text-xs text-neutral-800">{act.text}</p>
                                <div className="text-right text-[10px] whitespace-nowrap text-neutral-450 font-mono">
                                  {act.time}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === "users" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">User Directory</h1>
                <p className="text-xs text-neutral-500 mt-1">Manage and audit credentials, account statuses, and subscription upgrades.</p>
              </div>

              {/* Table search filters */}
              <div className="bg-white border border-neutral-200 rounded-[6px] p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name, email, or id..."
                    className="w-full pl-8 pr-4 py-1.5 text-xs border border-neutral-200 rounded-[6px] focus:outline-none focus:border-neutral-900 bg-white"
                  />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <select className="px-2 py-1.5 text-xs border border-neutral-200 rounded-[6px] bg-white">
                    <option>All Plans</option>
                    <option>PRO Only</option>
                    <option>FREE Only</option>
                  </select>
                  <select className="px-2 py-1.5 text-xs border border-neutral-200 rounded-[6px] bg-white">
                    <option>All Statuses</option>
                    <option>Active</option>
                    <option>Suspended</option>
                  </select>
                  <button className="px-3 py-1.5 text-xs font-mono font-bold border border-neutral-200 rounded-[6px] hover:bg-neutral-50 transition-colors">
                    BULK BAN
                  </button>
                </div>
              </div>

              {/* Searchable Table */}
              <div className="bg-white border border-neutral-200 rounded-[6px] overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200 text-left">
                  <thead className="bg-neutral-50 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Plan</th>
                      <th className="px-6 py-3">Country</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">AI Requests</th>
                      <th className="px-6 py-3">Resumes</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-xs">
                    {users
                      .filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-neutral-50/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-[4px] bg-neutral-100 border border-neutral-250 flex items-center justify-center font-bold">
                                {u.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-neutral-900 block">{u.name}</span>
                                <span className="text-[10px] text-neutral-450 font-mono">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${
                              u.plan === "PRO" ? "bg-neutral-900 text-white border-neutral-950" : "bg-neutral-50 text-neutral-600 border-neutral-200"
                            }`}>
                              {u.plan}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono">{u.country}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${
                              u.status === "Active" ? "bg-neutral-50 text-neutral-900 border-neutral-200" : "bg-red-50 text-red-900 border-red-200"
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono">{u.aiUsage}</td>
                          <td className="px-6 py-4 font-mono">{u.resumes}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="px-2.5 py-1 border border-neutral-200 hover:border-neutral-900 rounded-[4px] text-[10px] font-mono font-bold transition-colors"
                            >
                              AUDIT PROFILE
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* User Drawer / Auditing Modal */}
              {selectedUser && (
                <div className="fixed inset-0 bg-neutral-950/20 backdrop-blur-sm z-50 flex justify-end">
                  <div className="w-full max-w-xl bg-white h-full border-l border-neutral-200 p-8 overflow-y-auto flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[6px] bg-neutral-900 text-white flex items-center justify-center font-bold text-lg">
                            {selectedUser.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h2 className="text-base font-bold text-neutral-950">{selectedUser.name}</h2>
                            <span className="text-xs text-neutral-450 font-mono">{selectedUser.id}</span>
                          </div>
                        </div>
                        <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-neutral-100 rounded-[4px]">
                          <X className="w-4 h-4 text-neutral-400" />
                        </button>
                      </div>

                      <div className="border-t border-neutral-200 mt-6 pt-6 space-y-6">
                        {/* Grid info */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Email Address</span>
                            <span className="block mt-1 font-bold text-neutral-900">{selectedUser.email}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Registration Date</span>
                            <span className="block mt-1 font-bold text-neutral-900">{selectedUser.regDate}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Current Plan</span>
                            <span className="block mt-1 font-bold text-neutral-900">{selectedUser.plan}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Account Status</span>
                            <span className="block mt-1 font-bold text-neutral-900">{selectedUser.status}</span>
                          </div>
                        </div>

                        {/* Admin Notes */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">Internal Notes</label>
                          <textarea
                            defaultValue={selectedUser.notes || "No internal flags set."}
                            className="w-full p-2 border border-neutral-200 rounded-[6px] text-xs bg-neutral-50/50"
                            placeholder="Add administrative notes..."
                          />
                        </div>

                        {/* Action buttons */}
                        <div className="space-y-2.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">Administrative Actions</span>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedUser.status === "Active" ? (
                              <button
                                onClick={() => handleUserStatus(selectedUser.id, "Suspended")}
                                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 rounded-[6px] text-xs font-semibold transition-colors"
                              >
                                Suspend Account
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserStatus(selectedUser.id, "Active")}
                                className="w-full py-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-[6px] text-xs font-semibold transition-colors"
                              >
                                Reactivate Account
                              </button>
                            )}

                            {selectedUser.plan === "FREE" ? (
                              <button
                                onClick={() => handleGrantPremium(selectedUser.id, true)}
                                className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-[6px] text-xs font-semibold transition-colors"
                              >
                                Grant Premium Plan
                              </button>
                            ) : (
                              <button
                                onClick={() => handleGrantPremium(selectedUser.id, false)}
                                className="w-full py-2 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-[6px] text-xs font-semibold transition-colors"
                              >
                                Remove Premium Plan
                              </button>
                            )}

                            <button
                              onClick={() => setImpersonatingUser(selectedUser.email)}
                              className="w-full py-2 border border-neutral-200 hover:bg-neutral-50 rounded-[6px] text-xs font-semibold transition-colors"
                            >
                              Impersonate User
                            </button>

                            <button
                              onClick={() => handleDeleteUser(selectedUser.id)}
                              className="w-full py-2 border border-red-200 text-red-700 hover:bg-red-50 rounded-[6px] text-xs font-semibold transition-colors"
                            >
                              Delete Account Permanently
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-neutral-200 pt-6 flex justify-between">
                      <button className="text-xs font-bold text-neutral-400 hover:text-neutral-900">
                        Export Full JSON Data
                      </button>
                      <button onClick={() => setSelectedUser(null)} className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-[6px] text-xs font-semibold">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RESUME MANAGEMENT */}
          {activeTab === "resumes" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">Document Management</h1>
                <p className="text-xs text-neutral-500 mt-1">Review, flag, and manage documents generated on the platform.</p>
              </div>

              {/* Table search filters */}
              <div className="bg-white border border-neutral-200 rounded-[6px] p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={resumeSearch}
                    onChange={(e) => setResumeSearch(e.target.value)}
                    placeholder="Search by resume title or owner..."
                    className="w-full pl-8 pr-4 py-1.5 text-xs border border-neutral-200 rounded-[6px] focus:outline-none focus:border-neutral-900 bg-white"
                  />
                </div>
              </div>

              {/* Resumes List Table */}
              <div className="bg-white border border-neutral-200 rounded-[6px] overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200 text-left">
                  <thead className="bg-neutral-50 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                    <tr>
                      <th className="px-6 py-3">Resume ID</th>
                      <th className="px-6 py-3">Title</th>
                      <th className="px-6 py-3">Owner</th>
                      <th className="px-6 py-3">Template</th>
                      <th className="px-6 py-3">Downloads</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-xs">
                    {resumes
                      .filter(r => r.title.toLowerCase().includes(resumeSearch.toLowerCase()) || r.owner.toLowerCase().includes(resumeSearch.toLowerCase()))
                      .map((r) => (
                        <tr key={r.id} className="hover:bg-neutral-50/50">
                          <td className="px-6 py-4 font-mono text-[10px]">{r.id}</td>
                          <td className="px-6 py-4 font-semibold text-neutral-900">{r.title}</td>
                          <td className="px-6 py-4">{r.owner}</td>
                          <td className="px-6 py-4 font-mono uppercase text-[10px]">{r.template}</td>
                          <td className="px-6 py-4 font-mono">{r.downloads}</td>
                          <td className="px-6 py-4">
                            {r.flagged ? (
                              <span className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-950 rounded-[4px] text-[10px] font-bold inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-red-700" /> Flagged
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-neutral-50 border border-neutral-200 text-neutral-600 rounded-[4px] text-[10px]">
                                Approved
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-1.5">
                            <button
                              onClick={() => {
                                setResumes(resumes.map(item => item.id === r.id ? { ...item, flagged: !item.flagged } : item));
                              }}
                              className="px-2 py-1 border border-neutral-200 hover:border-neutral-950 rounded-[4px] text-[10px] font-mono font-bold"
                            >
                              {r.flagged ? "UNFLAG" : "FLAG"}
                            </button>
                            <button
                              onClick={() => setResumes(resumes.filter(item => item.id !== r.id))}
                              className="px-2 py-1 border border-red-250 text-red-700 hover:bg-red-50 rounded-[4px] text-[10px] font-mono font-bold"
                            >
                              DELETE
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: AI USAGE / TAILOR PANEL */}
          {activeTab === "ai-usage" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">AI Usage & Tailoring</h1>
                <p className="text-xs text-neutral-500 mt-1">Track LLM utilization, token costs, prompt latency, and ATS tailoring reports.</p>
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-neutral-200 rounded-[6px] p-4">
                  <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">Total AI Prompts</span>
                  <span className="text-lg font-bold text-neutral-950 mt-2 block">148,912</span>
                </div>
                <div className="bg-white border border-neutral-200 rounded-[6px] p-4">
                  <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">Avg Response Time</span>
                  <span className="text-lg font-bold text-neutral-950 mt-2 block">890ms</span>
                </div>
                <div className="bg-white border border-neutral-200 rounded-[6px] p-4">
                  <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">Model API Cost</span>
                  <span className="text-lg font-bold text-neutral-950 mt-2 block">$34.12</span>
                </div>
                <div className="bg-white border border-neutral-200 rounded-[6px] p-4">
                  <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">Tailoring Matches Generated</span>
                  <span className="text-lg font-bold text-neutral-950 mt-2 block">4,812</span>
                </div>
              </div>

              {/* Detail charts */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Consumption */}
                <div className="md:col-span-7 bg-white border border-neutral-200 rounded-[6px] p-6 space-y-4">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-500">Hourly AI request counts</h3>
                  <div className="w-full h-40 bg-neutral-50 rounded-[4px] border border-neutral-200/50 flex items-center justify-center">
                    <svg className="w-full h-full px-4" viewBox="0 0 600 150">
                      <rect x="30" y="80" width="30" height="70" fill="#111111" />
                      <rect x="80" y="50" width="30" height="100" fill="#111111" />
                      <rect x="130" y="40" width="30" height="110" fill="#111111" />
                      <rect x="180" y="60" width="30" height="90" fill="#111111" />
                      <rect x="230" y="90" width="30" height="60" fill="#111111" />
                      <rect x="280" y="20" width="30" height="130" fill="#111111" />
                      <rect x="330" y="30" width="30" height="120" fill="#111111" />
                      <rect x="380" y="70" width="30" height="80" fill="#111111" />
                      <rect x="430" y="50" width="30" height="100" fill="#111111" />
                    </svg>
                  </div>
                </div>

                {/* Model distribution */}
                <div className="md:col-span-5 bg-white border border-neutral-200 rounded-[6px] p-6 space-y-4">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-500">Model split</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono">gemini-2.5-flash</span>
                      <span className="font-bold">94.8%</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-[2px] overflow-hidden">
                      <div className="h-full bg-neutral-900" style={{ width: "94.8%" }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-mono">gemini-2.5-pro</span>
                      <span className="font-bold">5.2%</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-[2px] overflow-hidden">
                      <div className="h-full bg-neutral-900" style={{ width: "5.2%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SUBSCRIPTION MANAGEMENT */}
          {activeTab === "subscriptions" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">Subscription & Coupons</h1>
                <p className="text-xs text-neutral-500 mt-1">Manage platform tiers and generate campaign discount coupon codes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Coupon Generator */}
                <div className="md:col-span-5 bg-white border border-neutral-200 rounded-[6px] p-6 space-y-4">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-500">Create Promotion Coupon</h3>
                  <form onSubmit={handleAddCoupon} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-1">Coupon Code</label>
                      <input
                        type="text"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        placeholder="e.g. DISCOUNT25"
                        className="w-full px-3 py-1.5 text-xs border border-neutral-200 rounded-[6px] focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-1">Discount percentage</label>
                      <select 
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-neutral-200 rounded-[6px] bg-white focus:outline-none"
                      >
                        <option value="10">10% Off</option>
                        <option value="20">20% Off</option>
                        <option value="30">30% Off</option>
                        <option value="50">50% Off</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-[6px] text-xs font-bold transition-colors">
                      GENERATE PROMO CODE
                    </button>
                  </form>
                </div>

                {/* Active Coupons List */}
                <div className="md:col-span-7 bg-white border border-neutral-200 rounded-[6px] p-6 space-y-4">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-500">Active Campaign Coupons</h3>
                  <div className="border border-neutral-200 rounded-[6px] overflow-hidden">
                    <table className="min-w-full divide-y divide-neutral-200 text-left text-xs">
                      <thead className="bg-neutral-50 font-mono font-bold text-[10px] uppercase text-neutral-400">
                        <tr>
                          <th className="px-4 py-2">Code</th>
                          <th className="px-4 py-2">Discount</th>
                          <th className="px-4 py-2">Status</th>
                          <th className="px-4 py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {coupons.map((c) => (
                          <tr key={c.code}>
                            <td className="px-4 py-3 font-mono font-bold">{c.code}</td>
                            <td className="px-4 py-3 font-mono">{c.discount}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold border ${c.active ? "bg-neutral-55 text-neutral-900 border-neutral-200" : "bg-red-50 text-red-900 border-red-200"}`}>
                                {c.active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => toggleCoupon(c.code)}
                                className="text-[10px] font-mono font-bold underline text-neutral-900"
                              >
                                {c.active ? "DEACTIVATE" : "ACTIVATE"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PAYMENTS */}
          {activeTab === "payments" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">Ledger & Transaction Logs</h1>
                <p className="text-xs text-neutral-500 mt-1">Audit, export, or refund credit transactions.</p>
              </div>

              {/* Table search filters */}
              <div className="bg-white border border-neutral-200 rounded-[6px] p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                    placeholder="Search transaction ID or customer..."
                    className="w-full pl-8 pr-4 py-1.5 text-xs border border-neutral-200 rounded-[6px] focus:outline-none focus:border-neutral-900 bg-white"
                  />
                </div>
              </div>

              {/* Payments List Table */}
              <div className="bg-white border border-neutral-200 rounded-[6px] overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200 text-left">
                  <thead className="bg-neutral-50 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                    <tr>
                      <th className="px-6 py-3">Tx ID</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Method</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-xs">
                    {payments
                      .filter(p => p.txId.toLowerCase().includes(paymentSearch.toLowerCase()) || p.customer.toLowerCase().includes(paymentSearch.toLowerCase()))
                      .map((p) => (
                        <tr key={p.txId} className="hover:bg-neutral-50/50">
                          <td className="px-6 py-4 font-mono text-[10px]">{p.txId}</td>
                          <td className="px-6 py-4 font-semibold text-neutral-900">{p.customer}</td>
                          <td className="px-6 py-4 font-mono">${p.amount.toFixed(2)}</td>
                          <td className="px-6 py-4 font-mono">{p.method}</td>
                          <td className="px-6 py-4 font-mono">{p.date}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${
                              p.status === "Succeeded" ? "bg-neutral-50 text-neutral-900 border-neutral-200" :
                              p.status === "Refunded" ? "bg-neutral-200 text-neutral-900 border-neutral-300" : "bg-red-50 text-red-900 border-red-200"
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {p.status === "Succeeded" && (
                              <button
                                onClick={() => {
                                  setPayments(payments.map(item => item.txId === p.txId ? { ...item, status: "Refunded" } : item));
                                }}
                                className="px-2 py-1 border border-neutral-250 hover:bg-neutral-50 text-neutral-900 rounded-[4px] text-[10px] font-mono font-bold"
                              >
                                REFUND
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: REPORTS */}
          {activeTab === "reports" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">Downloadable Reports</h1>
                <p className="text-xs text-neutral-500 mt-1">Export transaction registries, subscription retention metrics, or user rosters.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: "Revenue & Ledger Logs", desc: "Contains Stripe settlement dates, transaction states, and net subscription fees." },
                  { title: "Subscription Churn Report", desc: "Detailed churn cohorts, upgrade converters, and average trial lifespans." },
                  { title: "AI Generation Statistics", desc: "Aggregated model prompt details, prompt-token volumes, and error occurrences." },
                  { title: "Full User Roster", desc: "Listing of user registration data, active/suspended flags, and cumulative document sizes." },
                ].map((rep, idx) => (
                  <div key={idx} className="bg-white border border-neutral-200 rounded-[6px] p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-950">{rep.title}</h3>
                      <p className="text-xs text-neutral-500 mt-2 leading-relaxed">{rep.desc}</p>
                    </div>
                    <div className="mt-6 flex gap-2">
                      <button 
                        onClick={() => handleExportReport(rep.title, "csv")}
                        className="flex-1 py-1.5 border border-neutral-200 hover:bg-neutral-50 text-[10px] font-mono font-bold rounded-[4px] transition-colors"
                      >
                        EXPORT CSV
                      </button>
                      <button 
                        onClick={() => handleExportReport(rep.title, "pdf")}
                        className="flex-1 py-1.5 border border-neutral-200 hover:bg-neutral-50 text-[10px] font-mono font-bold rounded-[4px] transition-colors"
                      >
                        EXPORT PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">Usage Analytics</h1>
                <p className="text-xs text-neutral-500 mt-1">Track Daily/Monthly Active Users, session retention, and template distribution metrics.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Device distribution */}
                <div className="md:col-span-6 bg-white border border-neutral-200 rounded-[6px] p-6 space-y-4">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-500">Access Browsers</h3>
                  <div className="space-y-3 text-xs">
                    {[
                      { browser: "Google Chrome", pct: "68%" },
                      { browser: "Apple Safari", pct: "19%" },
                      { browser: "Mozilla Firefox", pct: "8%" },
                      { browser: "Microsoft Edge", pct: "5%" },
                    ].map((b, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-1">
                          <span>{b.browser}</span>
                          <span className="font-bold">{b.pct}</span>
                        </div>
                        <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-neutral-900" style={{ width: b.pct }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Templates usage */}
                <div className="md:col-span-6 bg-white border border-neutral-200 rounded-[6px] p-6 space-y-4">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-500">Popular Layout Templates</h3>
                  <div className="space-y-3 text-xs">
                    {[
                      { template: "Modern", pct: "42%" },
                      { template: "Minimal", pct: "31%" },
                      { template: "Tech", pct: "15%" },
                      { template: "Corporate", pct: "9%" },
                      { template: "Creative", pct: "3%" },
                    ].map((t, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-mono text-[10px]">{t.template}</span>
                          <span className="font-bold">{t.pct}</span>
                        </div>
                        <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-neutral-900" style={{ width: t.pct }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SUPPORT TICKETS */}
          {activeTab === "support" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">Support Desk</h1>
                <p className="text-xs text-neutral-500 mt-1">Review user inquiries and process ticket status escalations.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Tickets list */}
                <div className="md:col-span-5 space-y-3">
                  {tickets.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`w-full p-4 border rounded-[6px] text-left transition-colors flex flex-col justify-between ${
                        selectedTicketId === t.id ? "bg-white border-neutral-900" : "bg-white border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400">{t.id}</span>
                        <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold border ${
                          t.priority === "High" ? "bg-red-50 text-red-900 border-red-200" : "bg-neutral-50 border-neutral-200"
                        }`}>{t.priority}</span>
                      </div>
                      <h4 className="text-xs font-bold text-neutral-900 mt-2 truncate w-full">{t.title}</h4>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-[10px] text-neutral-500">{t.user}</span>
                        <span className="text-[9px] font-mono text-neutral-400">{t.status}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Ticket Details/Chat */}
                <div className="md:col-span-7 bg-white border border-neutral-200 rounded-[6px] p-6 flex flex-col justify-between min-h-[400px]">
                  {selectedTicketId ? (
                    (() => {
                      const t = tickets.find(item => item.id === selectedTicketId)!;
                      return (
                        <div className="flex flex-col justify-between h-full space-y-6">
                          <div>
                            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
                              <div>
                                <h3 className="text-xs font-bold text-neutral-900">{t.title}</h3>
                                <span className="text-[10px] text-neutral-500 mt-1 block">Inquirer: {t.user} | Category: {t.category}</span>
                              </div>
                              <button
                                onClick={() => {
                                  setTickets(tickets.map(item => item.id === t.id ? { ...item, status: "Closed" } : item));
                                }}
                                className="px-2 py-1 bg-neutral-900 text-white rounded-[4px] text-[10px] font-bold"
                              >
                                CLOSE TICKET
                              </button>
                            </div>

                            {/* Chat Thread */}
                            <div className="mt-6 space-y-4 max-h-60 overflow-y-auto pr-2">
                              {t.replies.map((rep: any, idx: number) => (
                                <div key={idx} className={`p-3 rounded-[6px] text-xs max-w-sm ${
                                  rep.sender === "user" ? "bg-neutral-50 text-neutral-800 self-start" : "bg-neutral-900 text-white ml-auto"
                                }`}>
                                  <span className="text-[9px] font-mono opacity-50 block mb-1">
                                    {rep.sender === "user" ? "USER" : "SUPPORT AGENT"}
                                  </span>
                                  <p>{rep.text}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Reply Box */}
                          <div className="border-t border-neutral-100 pt-4 flex gap-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type support reply..."
                              className="flex-1 px-3 py-2 text-xs border border-neutral-200 rounded-[6px] focus:outline-none focus:border-neutral-950"
                            />
                            <button
                              onClick={() => handleTicketReply(t.id)}
                              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-[6px] text-xs font-bold"
                            >
                              SEND
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                      <HelpCircle className="w-8 h-8 text-neutral-300 mb-2" />
                      <p className="text-xs text-neutral-400">Select a support ticket to audit details and write replies.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: ACTIVITY LOGS */}
          {activeTab === "activity" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">Audit Trail Logs</h1>
                <p className="text-xs text-neutral-500 mt-1">Audit administrative operations, login actions, and user plan adjustments.</p>
              </div>

              {/* Logs list */}
              <div className="bg-white border border-neutral-200 rounded-[6px] overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200 text-left text-xs">
                  <thead className="bg-neutral-50 font-mono font-bold text-[10px] uppercase text-neutral-400">
                    <tr>
                      <th className="px-6 py-3">Log ID</th>
                      <th className="px-6 py-3">Operator</th>
                      <th className="px-6 py-3">Operation Description</th>
                      <th className="px-6 py-3">Severity</th>
                      <th className="px-6 py-3">IP Address</th>
                      <th className="px-6 py-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 font-mono text-[11px]">
                    {logs.map((l) => (
                      <tr key={l.id} className="hover:bg-neutral-50/50">
                        <td className="px-6 py-3 text-neutral-400">{l.id}</td>
                        <td className="px-6 py-3 font-semibold text-neutral-800">{l.admin}</td>
                        <td className="px-6 py-3 text-neutral-700">{l.action}</td>
                        <td className="px-6 py-3">
                          <span className={`px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold border ${
                            l.severity === "High" ? "bg-red-50 text-red-950 border-red-200" :
                            l.severity === "Medium" ? "bg-neutral-200 border-neutral-300 text-neutral-850" : "bg-neutral-50 text-neutral-500"
                          }`}>
                            {l.severity}
                          </span>
                        </td>
                        <td className="px-6 py-3">{l.ip}</td>
                        <td className="px-6 py-3 text-neutral-400">{l.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 11: SYSTEM SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-fade-in max-w-2xl">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">System Configuration</h1>
                <p className="text-xs text-neutral-500 mt-1">Configure limits, model defaults, plan pricing tiers, and maintenance settings.</p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-[6px] p-6 space-y-6 text-xs">
                {/* Form fields */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-1">Platform Name</label>
                    <input
                      type="text"
                      value={settingsState.platformName}
                      onChange={(e) => setSettingsState({ ...settingsState, platformName: e.target.value })}
                      className="w-full px-3 py-1.5 border border-neutral-200 rounded-[6px] focus:outline-none focus:border-neutral-950"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-1">Default AI Model</label>
                    <select
                      value={settingsState.defaultModel}
                      onChange={(e) => setSettingsState({ ...settingsState, defaultModel: e.target.value })}
                      className="w-full px-3 py-1.5 border border-neutral-200 bg-white rounded-[6px] focus:outline-none focus:border-neutral-950"
                    >
                      <option value="gemini-2.5-flash">gemini-2.5-flash (Fast & Recommended)</option>
                      <option value="gemini-2.5-pro">gemini-2.5-pro (Creative Optimization)</option>
                      <option value="gemini-2.0-flash">gemini-2.0-flash (Alternative)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-1">Max Free AI Requests</label>
                    <input
                      type="number"
                      value={settingsState.maxFreeAi}
                      onChange={(e) => setSettingsState({ ...settingsState, maxFreeAi: e.target.value })}
                      className="w-full px-3 py-1.5 border border-neutral-200 rounded-[6px] focus:outline-none focus:border-neutral-950"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-1">Monthly PRO Cost ($)</label>
                    <input
                      type="number"
                      value={settingsState.pricingMonthly}
                      onChange={(e) => setSettingsState({ ...settingsState, pricingMonthly: e.target.value })}
                      className="w-full px-3 py-1.5 border border-neutral-200 rounded-[6px] focus:outline-none focus:border-neutral-950"
                    />
                  </div>
                </div>

                {/* Maintenance toggler */}
                <div className="border-t border-neutral-150 pt-6 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-neutral-950 text-xs">Enable Platform Maintenance Mode</h4>
                    <p className="text-neutral-500 text-[10px] mt-0.5">Locks all writes and presents a standard maintenance page to clients.</p>
                  </div>
                  <button
                    onClick={() => {
                      setSettingsState({ ...settingsState, maintenanceMode: !settingsState.maintenanceMode });
                    }}
                    className={`px-4 py-1.5 rounded-[6px] text-xs font-mono font-bold border ${
                      settingsState.maintenanceMode ? "bg-red-50 text-red-950 border-red-200" : "bg-neutral-50 border-neutral-250 hover:bg-neutral-100"
                    }`}
                  >
                    {settingsState.maintenanceMode ? "ENABLED" : "DISABLED"}
                  </button>
                </div>

                <div className="border-t border-neutral-150 pt-6 flex justify-end">
                  <button 
                    onClick={() => alert("Platform settings applied successfully.")}
                    className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-[6px] text-xs font-bold"
                  >
                    SAVE CONFIGURATION
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT REQUESTS TAB */}
          {activeTab === "payment-requests" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-neutral-900">Payment Requests</h1>
                  <p className="text-xs text-neutral-500 mt-1">Review manual payment screenshots and upgrade users to Pro.</p>
                </div>
                <button
                  onClick={loadPaymentRequests}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 rounded-[6px] text-xs font-medium hover:bg-neutral-50 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total Requests", val: paymentRequests.length, color: "text-neutral-900" },
                  { label: "Pending Review", val: paymentRequests.filter(r => r.status === "PENDING").length, color: "text-amber-700" },
                  { label: "Approved", val: paymentRequests.filter(r => r.status === "APPROVED").length, color: "text-neutral-900" },
                ].map((s, i) => (
                  <div key={i} className="bg-white border border-neutral-200 rounded-[6px] p-4">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">{s.label}</p>
                    <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.val}</p>
                  </div>
                ))}
              </div>

              {/* Request list */}
              <div className="bg-white border border-neutral-200 rounded-[6px] overflow-hidden">
                {paymentRequests.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center text-neutral-400">
                    <Receipt className="w-8 h-8 mb-3" />
                    <p className="text-sm font-medium">No payment requests yet</p>
                    <p className="text-xs mt-1">When users submit payment screenshots, they'll appear here.</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-neutral-200 text-left">
                    <thead className="bg-neutral-50 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                      <tr>
                        <th className="px-5 py-3">User</th>
                        <th className="px-5 py-3">Method</th>
                        <th className="px-5 py-3">Amount</th>
                        <th className="px-5 py-3">Submitted</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 text-xs">
                      {paymentRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-neutral-50/50">
                          <td className="px-5 py-4">
                            <p className="font-bold text-neutral-900">{req.userName}</p>
                            <p className="text-[10px] text-neutral-450 font-mono">{req.userEmail}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-neutral-100 border border-neutral-200">
                              {req.method}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-mono font-bold">ETB {req.amount}</td>
                          <td className="px-5 py-4 text-neutral-500">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4">
                            {req.status === "PENDING" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-800">
                                <Clock className="w-3 h-3" /> Pending
                              </span>
                            )}
                            {req.status === "APPROVED" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-neutral-900 text-white">
                                <CheckCircle2 className="w-3 h-3" /> Approved
                              </span>
                            )}
                            {req.status === "REJECTED" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-red-50 border border-red-200 text-red-800">
                                <XCircle className="w-3 h-3" /> Rejected
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => { setSelectedPaymentRequest(req); setRejectNote(""); }}
                              className="px-2.5 py-1 border border-neutral-200 hover:border-neutral-900 rounded-[4px] text-[10px] font-mono font-bold transition-colors"
                            >
                              REVIEW
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Screenshot review drawer */}
              {selectedPaymentRequest && (
                <div className="fixed inset-0 bg-neutral-950/30 backdrop-blur-sm z-50 flex justify-end">
                  <div className="w-full max-w-lg bg-white h-full border-l border-neutral-200 overflow-y-auto flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-neutral-100 shrink-0">
                      <div>
                        <h2 className="text-sm font-bold text-neutral-900">Payment Review</h2>
                        <p className="text-[11px] text-neutral-500 mt-0.5 font-mono">{selectedPaymentRequest.id}</p>
                      </div>
                      <button onClick={() => { setSelectedPaymentRequest(null); setRejectNote(""); }} className="p-1.5 hover:bg-neutral-100 rounded-[6px]">
                        <X className="w-4 h-4 text-neutral-400" />
                      </button>
                    </div>

                    <div className="flex-1 p-5 space-y-5 overflow-y-auto">
                      {/* User info */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Name</p>
                          <p className="font-bold text-neutral-900 mt-0.5">{selectedPaymentRequest.userName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Email</p>
                          <p className="font-bold text-neutral-900 mt-0.5">{selectedPaymentRequest.userEmail}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Method</p>
                          <p className="font-bold text-neutral-900 mt-0.5">{selectedPaymentRequest.method}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Amount</p>
                          <p className="font-bold text-neutral-900 mt-0.5">ETB {selectedPaymentRequest.amount}</p>
                        </div>
                      </div>

                      {/* Screenshot */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Payment Screenshot</p>
                          <button
                            onClick={() => setScreenshotZoom(!screenshotZoom)}
                            className="flex items-center gap-1 text-[10px] font-medium text-neutral-500 hover:text-neutral-900"
                          >
                            <ZoomIn className="w-3 h-3" /> {screenshotZoom ? "Fit" : "Zoom"}
                          </button>
                        </div>
                        <div className={`rounded-[6px] overflow-hidden border border-neutral-200 bg-neutral-50 ${screenshotZoom ? "" : "max-h-72"}`}>
                          <img
                            src={`data:${selectedPaymentRequest.screenshotType};base64,${selectedPaymentRequest.screenshotData}`}
                            alt="Payment screenshot"
                            className={`w-full ${screenshotZoom ? "" : "object-cover h-72"}`}
                          />
                        </div>
                      </div>

                      {/* Current status */}
                      {selectedPaymentRequest.status !== "PENDING" && (
                        <div className={`p-3 rounded-[6px] border text-xs font-medium ${
                          selectedPaymentRequest.status === "APPROVED"
                            ? "bg-neutral-50 border-neutral-200 text-neutral-700"
                            : "bg-red-50 border-red-200 text-red-800"
                        }`}>
                          This request has already been <strong>{selectedPaymentRequest.status.toLowerCase()}</strong>.
                          {selectedPaymentRequest.adminNote && <p className="mt-1">{selectedPaymentRequest.adminNote}</p>}
                        </div>
                      )}

                      {/* Reject note */}
                      {selectedPaymentRequest.status === "PENDING" && (
                        <div>
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                            Rejection Note (optional)
                          </label>
                          <textarea
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            placeholder="e.g. Screenshot is blurry. Please resubmit with a clearer image."
                            className="w-full p-2.5 border border-neutral-200 rounded-[6px] text-xs resize-none h-20 focus:outline-none focus:border-neutral-900"
                          />
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    {selectedPaymentRequest.status === "PENDING" && (
                      <div className="p-5 border-t border-neutral-100 grid grid-cols-2 gap-3 shrink-0">
                        <button
                          onClick={() => handleReviewPayment(selectedPaymentRequest.id, "REJECT")}
                          disabled={isReviewing}
                          className="py-2.5 border border-red-200 text-red-800 hover:bg-red-50 rounded-[6px] text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button
                          onClick={() => handleReviewPayment(selectedPaymentRequest.id, "APPROVE")}
                          disabled={isReviewing}
                          className="py-2.5 bg-neutral-900 hover:bg-black text-white rounded-[6px] text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          {isReviewing ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          Approve & Upgrade
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Screenshot zoom overlay */}
              {screenshotZoom && selectedPaymentRequest && (
                <div
                  className="fixed inset-0 z-[60] bg-neutral-950/80 flex items-center justify-center p-8"
                  onClick={() => setScreenshotZoom(false)}
                >
                  <img
                    src={`data:${selectedPaymentRequest.screenshotType};base64,${selectedPaymentRequest.screenshotData}`}
                    alt="Payment screenshot full"
                    className="max-w-full max-h-full rounded-[8px] shadow-2xl"
                  />
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
