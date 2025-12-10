"use client"

import { useState } from "react"

export function useCurrency() {
  const [userLocale] = useState("en-KE")
  const [currency] = useState("KES")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(userLocale, {
      style: "currency",
      currency: currency,
      currencyDisplay: "code", // Shows "KES" instead of "Ksh"
    })
      .format(amount)
      .replace("KES", "KES ")
  }

  return { userLocale, currency, formatCurrency }
}
