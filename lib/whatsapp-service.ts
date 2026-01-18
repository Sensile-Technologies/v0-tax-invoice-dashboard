import Twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER

let twilioClient: Twilio.Twilio | null = null

function getClient(): Twilio.Twilio {
  if (!twilioClient) {
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured')
    }
    twilioClient = Twilio(accountSid, authToken)
  }
  return twilioClient
}

export interface DSSRSummary {
  branchName: string
  date: string
  shiftType: string
  attendantName: string
  totalSales: number
  totalVolume: number
  cashCollected: number
  mpesaCollected: number
  creditSales: number
  variance: number
  productBreakdown: Array<{
    product: string
    volume: number
    amount: number
  }>
}

export function formatDSSRMessage(summary: DSSRSummary): string {
  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`
  const formatVolume = (vol: number) => `${vol.toLocaleString('en-KE', { minimumFractionDigits: 2 })} L`
  
  let message = `*DSSR - ${summary.branchName}*\n`
  message += `Date: ${summary.date}\n`
  message += `Shift: ${summary.shiftType}\n`
  message += `Attendant: ${summary.attendantName}\n`
  message += `─────────────────\n`
  message += `*Sales Summary*\n`
  message += `Total Sales: ${formatCurrency(summary.totalSales)}\n`
  message += `Total Volume: ${formatVolume(summary.totalVolume)}\n`
  message += `─────────────────\n`
  message += `*Collections*\n`
  message += `Cash: ${formatCurrency(summary.cashCollected)}\n`
  message += `M-Pesa: ${formatCurrency(summary.mpesaCollected)}\n`
  message += `Credit: ${formatCurrency(summary.creditSales)}\n`
  message += `─────────────────\n`
  
  if (summary.productBreakdown.length > 0) {
    message += `*Product Breakdown*\n`
    for (const product of summary.productBreakdown) {
      message += `${product.product}: ${formatVolume(product.volume)} (${formatCurrency(product.amount)})\n`
    }
    message += `─────────────────\n`
  }
  
  const varianceStatus = summary.variance >= 0 ? '✅' : '⚠️'
  message += `*Variance: ${varianceStatus} ${formatCurrency(summary.variance)}*\n`
  message += `─────────────────\n`
  message += `_Sent automatically by Flow360_`
  
  return message
}

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!whatsappNumber) {
      throw new Error('Twilio WhatsApp number not configured')
    }
    
    const client = getClient()
    
    const toNumber = to.startsWith('+') ? to : `+${to}`
    const fromNumber = whatsappNumber.startsWith('+') ? whatsappNumber : `+${whatsappNumber}`
    
    const result = await client.messages.create({
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${toNumber}`,
      body: message
    })
    
    console.log(`[WhatsApp] Message sent successfully. SID: ${result.sid}`)
    
    return {
      success: true,
      messageId: result.sid
    }
  } catch (error: any) {
    console.error('[WhatsApp] Error sending message:', error.message)
    return {
      success: false,
      error: error.message || 'Failed to send WhatsApp message'
    }
  }
}

export async function sendDSSRToDirectors(
  summary: DSSRSummary,
  directorNumbers: string[]
): Promise<{ success: boolean; results: Array<{ number: string; success: boolean; error?: string }> }> {
  const message = formatDSSRMessage(summary)
  const results: Array<{ number: string; success: boolean; error?: string }> = []
  
  for (const number of directorNumbers) {
    const result = await sendWhatsAppMessage(number, message)
    results.push({
      number,
      success: result.success,
      error: result.error
    })
  }
  
  const allSuccess = results.every(r => r.success)
  
  return {
    success: allSuccess,
    results
  }
}
