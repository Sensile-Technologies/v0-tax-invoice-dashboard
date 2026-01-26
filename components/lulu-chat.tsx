"use client"

import { useState, useRef, useEffect } from "react"
import { X, Send, Bot, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface LuluChatProps {
  isOpen: boolean
  onClose: () => void
}

const KNOWLEDGE_BASE: { keywords: string[], response: string }[] = [
  {
    keywords: ["shift", "start shift", "end shift", "close shift"],
    response: "**Shift Management:**\n\n1. **Start Shift**: Use the **Mobile App** to start a shift. Tap the shift button and enter opening meter readings.\n\n2. **End Shift (Phase 1)**: On the web dashboard, go to **Sales Summary → Shift Management**. Enter closing meter readings and assign incoming attendants.\n\n3. **Reconciliation (Phase 2)**: Complete mandatory reconciliation with payment breakdown (Cash, M-Pesa, Cards) and banking summary.\n\nTip: Tank opening readings automatically use the previous shift's closing readings."
  },
  {
    keywords: ["sale", "create sale", "new sale", "record sale", "invoice"],
    response: "**Recording Sales:**\n\n1. Open the **Mobile App** (primary method for cashiers)\n2. Select the pump/nozzle\n3. Enter quantity and customer details\n4. Choose payment method (Cash, M-Pesa, Card, Credit)\n5. For KRA compliance, enter customer PIN if required\n6. Submit to generate invoice\n\nAll sales automatically sync with KRA eTIMS for tax compliance."
  },
  {
    keywords: ["bulk sale", "automated sale", "bulk invoice"],
    response: "**Bulk Sales:**\n\nBulk sales are automatically generated for fuel dispensed but not individually invoiced during a shift.\n\n1. Go to Sales → Automated Sales\n2. System calculates unreconciled fuel quantities\n3. Click 'Generate Bulk Invoices'\n4. Invoices are sent to KRA based on intermittency settings\n\nNote: Bulk sales use the same invoice sequence (CIV-XXXXXX) as regular sales."
  },
  {
    keywords: ["kra", "tims", "etims", "tax", "compliance"],
    response: "**KRA eTIMS Integration:**\n\nFlow360 is fully integrated with Kenya Revenue Authority's eTIMS system.\n\n- All sales are automatically transmitted to KRA\n- Invoice numbers match KRA's QR code verification\n- Configure KRA settings in Settings → KRA Configuration\n- View transmission status in KRA Logs\n\nTip: Use 'Initialize KRA' button to sync device configuration."
  },
  {
    keywords: ["customer", "loyalty", "points", "rewards"],
    response: "**Loyalty Program:**\n\n**Earning Points:**\n- Per Litre: Points = quantity × points_per_litre\n- Per Amount: Points = floor(amount/threshold) × points_per_amount\n\n**Redeeming Points:**\n- Configure redemption rules in Explore Tuzwa → Earning Rules\n- Set minimum points threshold and max discount percentage\n- Directors can trigger bulk redemption monthly\n\nManage customers in Customers → Loyalty Customers."
  },
  {
    keywords: ["purchase", "order", "po", "stock", "delivery"],
    response: "**Purchase Orders:**\n\n1. **Create PO**: Headquarters creates purchase orders for branches\n2. **Approval**: PO requires approval before becoming visible\n3. **Delivery**: Branch accepts delivery with volume verification\n4. **Stock Update**: Tank levels automatically update\n\nView purchase variance: Tank Variance + Meter Variance - Bowser Volume"
  },
  {
    keywords: ["tank", "dip", "reading", "stock", "level"],
    response: "**Tank Management:**\n\n- View current tank levels on the **Dashboard** (Tank Stock card)\n- Tank readings are recorded during **End Shift** process\n- Opening readings auto-populate from previous shift's closing\n- Track stock variance between deliveries\n\nStock is categorized by fuel type and linked to items catalog."
  },
  {
    keywords: ["staff", "employee", "attendant", "user", "role"],
    response: "**Staff Management:**\n\n**Roles:**\n- **Cashiers**: Process sales via mobile app\n- **Supervisors**: Manage shifts and reconciliation\n- **Managers**: Full branch access\n- **Directors**: Multi-branch oversight\n- **Vendors**: Organization-wide control\n\nManage staff in Settings → Staff. Assign specific pump/branch access."
  },
  {
    keywords: ["report", "dssr", "summary", "analytics"],
    response: "**Reports & Analytics:**\n\n- **DSSR**: Daily Sales Summary Report sent via WhatsApp\n- **Sales Summary**: Revenue by fuel type with charts\n- **Shift Reports**: Detailed shift reconciliation\n- **X/Z Reports**: Fiscal reports for KRA compliance\n\nDirectors receive WhatsApp notifications when branches reconcile shifts."
  },
  {
    keywords: ["branch", "station", "location"],
    response: "**Branch Management:**\n\n- Create branches in Settings → Branches\n- Each branch has its own:\n  - Pumps and nozzles\n  - Staff assignments\n  - Tank inventory\n  - Pricing (via Branch Items)\n  - Invoice sequence\n\nHeadquarters provides consolidated view of all branches."
  },
  {
    keywords: ["price", "pricing", "item", "catalog", "product"],
    response: "**Catalog & Pricing:**\n\n- Master catalog managed at HQ level (Items table)\n- Branch-specific pricing in Branch Items\n- Each branch can set different prices\n- All sales use branch_items pricing\n\nTo update prices: Go to Settings → Items → Branch Items tab."
  },
  {
    keywords: ["mobile", "app", "apk", "phone"],
    response: "**Mobile App (APK):**\n\nThe mobile app is the primary tool for cashiers and supervisors.\n\n**Features:**\n- **Start Shifts** with opening meter readings\n- Process sales with pump selection\n- Verify customer loyalty points\n- Print/share receipts\n- View invoices and transaction history\n\n**Login**: Use your staff credentials assigned by admin."
  },
  {
    keywords: ["receipt", "print", "qr", "copy"],
    response: "**Receipt Printing:**\n\n- Original receipts print once (no watermark)\n- Copies are watermarked 'COPY'\n- Receipt number matches KRA QR verification\n- Share receipts via mobile app\n\nReceipts include QR code for customer verification on KRA portal."
  },
  {
    keywords: ["credit", "note", "refund", "return"],
    response: "**Credit Notes:**\n\nTo issue a credit note for a sale:\n\n1. Find the original sale in Sales history\n2. Click 'Issue Credit Note'\n3. Enter reason for credit\n4. System generates credit note and sends to KRA\n\nCredit notes reduce inventory and revenue accordingly."
  },
  {
    keywords: ["payment", "mpesa", "cash", "card", "credit"],
    response: "**Payment Methods:**\n\n- **Cash**: Direct payment\n- **M-Pesa**: Mobile money\n- **Card**: Debit/Credit cards\n- **Credit**: Customer account credit\n\nDuring shift reconciliation, break down total sales by payment type for accurate banking."
  },
  {
    keywords: ["notification", "alert", "message"],
    response: "**Notifications:**\n\nSystem sends notifications for:\n- Overdue subscription invoices\n- Shift events\n- Low stock alerts\n- System updates\n\nView notifications via the bell icon in the header. Directors receive WhatsApp alerts for branch activities."
  },
  {
    keywords: ["whatsapp", "director", "sms"],
    response: "**WhatsApp Notifications:**\n\nDirectors can receive DSSR (Daily Sales Summary Reports) via WhatsApp.\n\n**Setup:**\n1. Go to Explore Tuzwa → Earning Rules tab\n2. Add director phone numbers\n3. Enable WhatsApp notifications\n\nNotifications are sent when branches complete shift reconciliation."
  },
  {
    keywords: ["help", "support", "contact", "issue"],
    response: "**Getting Help:**\n\n- **User Manuals**: Access via Help menu\n- **Contact Support**: Email or in-app support request\n- **Ask Lulu**: I'm here to answer your questions!\n\nFor urgent technical issues, contact your system administrator."
  },
  {
    keywords: ["login", "password", "account", "access"],
    response: "**Account Access:**\n\n- Login with your assigned username and password\n- Password can be reset by admin\n- Session expires after inactivity\n- Different roles have different access levels\n\nContact your admin if you're locked out."
  },
  {
    keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
    response: "Hello! I'm Lulu, your Flow360 assistant. I can help you with:\n\n- **Shifts**: Starting, ending, and reconciliation\n- **Sales**: Recording and invoicing\n- **KRA**: eTIMS compliance and reports\n- **Loyalty**: Points and redemption\n- **Stock**: Tank levels and purchases\n- **Reports**: DSSR and analytics\n\nWhat would you like to know?"
  }
]

function findBestResponse(query: string): string {
  const lowerQuery = query.toLowerCase()
  
  let bestMatch = { score: 0, response: "" }
  
  for (const item of KNOWLEDGE_BASE) {
    let score = 0
    for (const keyword of item.keywords) {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        score += keyword.split(" ").length
      }
    }
    if (score > bestMatch.score) {
      bestMatch = { score, response: item.response }
    }
  }
  
  if (bestMatch.score === 0) {
    return "I'm not sure about that specific topic. Here's what I can help you with:\n\n" +
      "- **Shifts**: Start, end, reconciliation\n" +
      "- **Sales**: Recording invoices\n" +
      "- **KRA/eTIMS**: Tax compliance\n" +
      "- **Loyalty**: Points & rewards\n" +
      "- **Purchases**: Stock & orders\n" +
      "- **Reports**: DSSR, analytics\n" +
      "- **Staff**: Users & roles\n" +
      "- **Mobile App**: APK usage\n\n" +
      "Try asking about one of these topics!"
  }
  
  return bestMatch.response
}

export function LuluChat({ isOpen, onClose }: LuluChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm Lulu, your Flow360 assistant. Ask me anything about using the system - shifts, sales, KRA compliance, loyalty points, or any other feature!",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const response = findBestResponse(userMessage.content)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 rounded-2xl border bg-background shadow-2xl animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between border-b bg-primary px-4 py-3 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Lulu</h3>
            <p className="text-xs text-white/70">Flow360 Assistant</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-80 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div
                className={cn(
                  "rounded-2xl px-4 py-2 max-w-[80%]",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <div 
                  className="text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: message.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br/>')
                  }}
                />
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl bg-muted px-4 py-2">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/50" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about Flow360..."
            className="flex-1 rounded-xl"
          />
          <Button
            size="icon"
            className="rounded-xl"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
