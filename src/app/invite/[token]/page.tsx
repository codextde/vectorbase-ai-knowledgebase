import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AcceptInviteForm } from './accept-invite-form'
import { Footer } from '@/components/footer'

interface InvitePageProps {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const invite = await prisma.organizationInvite.findUnique({
    where: { token },
    include: {
      organization: { select: { name: true, slug: true } },
      inviter: { select: { fullName: true, email: true } },
    },
  })

  if (!invite) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full mx-auto p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Invalid Invitation</h1>
            <p className="text-muted-foreground mb-6">
              This invitation link is invalid or has been revoked.
            </p>
            <a href="/auth/login" className="text-primary hover:underline">
              Go to Login
            </a>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (invite.status !== 'pending') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full mx-auto p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Invitation {invite.status}</h1>
            <p className="text-muted-foreground mb-6">
              This invitation has already been {invite.status}.
            </p>
            <a href="/auth/login" className="text-primary hover:underline">
              Go to Login
            </a>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (invite.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full mx-auto p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Invitation Expired</h1>
            <p className="text-muted-foreground mb-6">
              This invitation has expired. Please ask the organization admin to send a new one.
            </p>
            <a href="/auth/login" className="text-primary hover:underline">
              Go to Login
            </a>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    redirect(`/auth/login?redirect=/invite/${token}`)
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  })

  if (!profile || profile.email.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full mx-auto p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Wrong Account</h1>
            <p className="text-muted-foreground mb-4">
              This invitation was sent to <strong>{invite.email}</strong>.
            </p>
            <p className="text-muted-foreground mb-6">
              You are logged in as <strong>{profile?.email}</strong>. Please log out and sign in with the correct account.
            </p>
            <a href="/auth/login" className="text-primary hover:underline">
              Switch Account
            </a>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const existingMembership = await prisma.organizationMember.findFirst({
    where: { userId: user.id, organizationId: invite.organizationId },
  })

  if (existingMembership) {
    redirect(`/dashboard`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center">
        <AcceptInviteForm
          token={token}
          organizationName={invite.organization.name}
          inviterName={invite.inviter.fullName || invite.inviter.email}
          role={invite.role}
        />
      </div>
      <Footer />
    </div>
  )
}
