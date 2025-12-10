export async function POST() {
  try {
    const demoStaff = [
      {
        email: "director1@flow360.com",
        username: "james.director",
        password: "flow360",
        fullName: "James Mwangi",
        phoneNumber: "+254712345001",
        role: "Director",
      },
      {
        email: "director2@flow360.com",
        username: "sarah.director",
        password: "flow360",
        fullName: "Sarah Kamau",
        phoneNumber: "+254712345002",
        role: "Director",
      },
      {
        email: "manager1@flow360.com",
        username: "john.manager",
        password: "flow360",
        fullName: "John Omondi",
        phoneNumber: "+254712345003",
        role: "Manager",
      },
      {
        email: "manager2@flow360.com",
        username: "mary.manager",
        password: "flow360",
        fullName: "Mary Wanjiku",
        phoneNumber: "+254712345004",
        role: "Manager",
      },
      {
        email: "supervisor1@flow360.com",
        username: "peter.supervisor",
        password: "flow360",
        fullName: "Peter Kipchoge",
        phoneNumber: "+254712345005",
        role: "Supervisor",
      },
      {
        email: "supervisor2@flow360.com",
        username: "jane.supervisor",
        password: "flow360",
        fullName: "Jane Akinyi",
        phoneNumber: "+254712345006",
        role: "Supervisor",
      },
      {
        email: "cashier1@flow360.com",
        username: "david.cashier",
        password: "flow360",
        fullName: "David Mutua",
        phoneNumber: "+254712345007",
        role: "Cashier",
      },
      {
        email: "cashier2@flow360.com",
        username: "lucy.cashier",
        password: "flow360",
        fullName: "Lucy Njeri",
        phoneNumber: "+254712345008",
        role: "Cashier",
      },
    ]

    const results = []
    const errors = []

    for (const staff of demoStaff) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("/rest/v1", "")}/api/staff/create`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(staff),
          },
        )

        const data = await response.json()

        if (response.ok) {
          results.push(data)
        } else {
          errors.push({ staff: staff.username, error: data.error })
        }
      } catch (error) {
        errors.push({ staff: staff.username, error: "Failed to create" })
      }
    }

    return Response.json({
      success: true,
      message: `Created ${results.length} staff members`,
      created: results.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("Error seeding demo staff:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
